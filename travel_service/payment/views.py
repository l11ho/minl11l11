import io
import logging
from django.core.mail import EmailMessage
import json
import stripe
from datetime import datetime

from django.conf import settings
from django.core.mail import EmailMessage
from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

stripe.api_key = settings.STRIPE_SECRET_KEY


def build_payment_email_html(
    booking_type,
    item_name,
    customer_name,
    customer_phone,
    customer_email,
    order_id,
    paid_at,
):
    booking_type_map = {
        "tour": "Tour",
        "flight": "Vé máy bay",
        "hotel": "Khách sạn",
    }

    booking_label = booking_type_map.get(booking_type, "Đơn hàng")

    return f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #222;">
        <h2>Xác nhận thanh toán thành công</h2>
        <p>Xin chào <strong>{customer_name or 'Quý khách'}</strong>,</p>
        <p>Chúng tôi xác nhận bạn đã thanh toán thành công cho <strong>{booking_label}</strong>.</p>

        <table cellpadding="8" cellspacing="0" border="1" style="border-collapse: collapse; margin-top: 12px;">
          <tr>
            <td><strong>Loại đơn</strong></td>
            <td>{booking_label}</td>
          </tr>
          <tr>
            <td><strong>Tên sản phẩm / dịch vụ</strong></td>
            <td>{item_name or ''}</td>
          </tr>
          <tr>
            <td><strong>Khách hàng</strong></td>
            <td>{customer_name or ''}</td>
          </tr>
          <tr>
            <td><strong>Số điện thoại</strong></td>
            <td>{customer_phone or ''}</td>
          </tr>
          <tr>
            <td><strong>Email</strong></td>
            <td>{customer_email or ''}</td>
          </tr>
          <tr>
            <td><strong>Mã đơn hàng</strong></td>
            <td>{order_id or ''}</td>
          </tr>
          <tr>
            <td><strong>Thời gian thanh toán thành công</strong></td>
            <td>{paid_at}</td>
          </tr>
        </table>

        <p style="margin-top: 16px;">Cảm ơn bạn đã sử dụng dịch vụ.</p>
      </body>
    </html>
    """


def build_flight_ticket_pdf(metadata):
    import io
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.pdfgen import canvas

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # ===== Helpers =====
    def draw_box(x, y, w, h, title=None):
        p.setStrokeColor(colors.black)
        p.setLineWidth(1)
        p.rect(x, y - h, w, h, stroke=1, fill=0)
        if title:
            p.setFont("Helvetica-Bold", 10)
            p.drawString(x + 6, y - 14, title)

    def draw_cell_text(x, y, text, font="Helvetica", size=9, bold=False):
        p.setFont("Helvetica-Bold" if bold else font, size)
        p.drawString(x + 4, y - 14, str(text or ""))

    def draw_table(x, y, col_widths, row_height, headers, rows, title=None):
        total_width = sum(col_widths)
        total_rows = 1 + len(rows)
        total_height = row_height * total_rows + (24 if title else 0)

        # outer box
        p.setStrokeColor(colors.black)
        p.setLineWidth(1)
        p.rect(x, y - total_height, total_width, total_height, stroke=1, fill=0)

        current_y = y
        if title:
            p.setFont("Helvetica-Bold", 10)
            p.drawString(x + 6, current_y - 14, title)
            current_y -= 24
            p.line(x, current_y, x + total_width, current_y)

        # header row
        cx = x
        for i, w in enumerate(col_widths):
            p.rect(cx, current_y - row_height, w, row_height, stroke=1, fill=0)
            draw_cell_text(cx, current_y, headers[i], bold=True)
            cx += w

        # body rows
        row_y = current_y - row_height
        for row in rows:
            cx = x
            for i, w in enumerate(col_widths):
                p.rect(cx, row_y - row_height, w, row_height, stroke=1, fill=0)

                value = row[i] if i < len(row) else ""
                text = str(value or "")

                # support multiline
                lines = text.split("\n")
                if len(lines) == 1:
                    draw_cell_text(cx, row_y, text, size=9, bold=(i == len(row) - 1 and headers[-1] == "Mã vé"))
                else:
                    yy = row_y - 10
                    for j, line in enumerate(lines[:3]):
                        p.setFont("Helvetica", 8)
                        p.drawString(cx + 4, yy - j * 10, line)
                cx += w
            row_y -= row_height

        return y - total_height

    # ===== Data =====
    order_id = metadata.get("order_id", "")
    customer_name = metadata.get("customer_name", "")
    customer_email = metadata.get("customer_email", "")
    customer_phone = metadata.get("customer_phone", "")
    flight_number = metadata.get("flight_number", "")
    departure = metadata.get("departure", "")
    arrival = metadata.get("arrival", "")
    departure_date = metadata.get("departure_date", "")
    flight_time = metadata.get("flight_time", "")
    passengers = metadata.get("passengers", "1")
    paid_at = metadata.get("paid_at", "")
    item_name = metadata.get("item_name", f"Flight {flight_number}")

    # parse flight_time if possible
    depart_time = ""
    arrive_time = ""
    if flight_time and "-" in flight_time:
        parts = [t.strip() for t in flight_time.split("-")]
        if len(parts) >= 2:
            depart_time = parts[0]
            arrive_time = parts[1]
    else:
        depart_time = flight_time

    # fake ticket codes based on order_id for display
    ticket_code_1 = f"{str(order_id)[-8:]}" if order_id else "86890977"
    ticket_code_2 = f"{str(order_id)[-7:]}9" if order_id else "86891009"

    route_text = f"{departure} - {arrival}" if departure and arrival else ""
    customer_dob = metadata.get("customer_dob", "")
    gender = metadata.get("gender", "")

    passenger_rows = []
    passenger_count = int(passengers) if str(passengers).isdigit() else 1

    gender_display = gender if gender else ""

    for i in range(1, passenger_count + 1):
        passenger_rows.append([
            str(i),
            customer_name.upper() if customer_name else f"HANH KHACH {i}",
            "Nguoi lon",
            gender_display,
            "",
            customer_dob,
        ])

    # ===== Header =====
    top_y = height - 22 * mm

    # Logo text block
    p.setFillColor(colors.HexColor("#f28c28"))
    p.setFont("Helvetica-Bold", 18)
    p.drawString(18 * mm, top_y, "BestPrice")
    p.setFillColor(colors.HexColor("#2d72b8"))
    p.drawString(47 * mm, top_y, "Travel")

    p.setFillColor(colors.black)
    p.setFont("Helvetica", 9)
    p.drawString(20 * mm, top_y - 6 * mm, "Ban dong hanh tin cay")

    p.setFont("Helvetica-Bold", 12)
    p.drawRightString(width - 18 * mm, top_y + 2 * mm, "BestPrice Travel., JSC")

    p.setFont("Helvetica-Bold", 9)
    p.drawRightString(width - 18 * mm, top_y - 4 * mm, "VP Ha Noi: 12A, Ngo Ba Trieu, Pho Ba Trieu, Hai Ba Trung, HN")
    p.drawRightString(width - 18 * mm, top_y - 10 * mm, "VP HCM: 95 Tran Quang Khai, Tan Dinh, Q1, Ho Chi Minh")
    p.drawRightString(width - 18 * mm, top_y - 16 * mm, "Website: www.bestprice.vn - Tel: 1900 6505")
    p.setFillColor(colors.red)
    p.drawRightString(width - 18 * mm, top_y - 22 * mm, f"Hotline: {customer_phone or '0936.259.428'}")
    p.setFillColor(colors.black)

    p.setFont("Helvetica-Bold", 15)
    p.drawCentredString(width / 2, top_y - 36 * mm, "Ve may bay truc tuyen")

    y = top_y - 44 * mm

    # ===== Section 1: Order info =====
    order_rows = [
        ["1", ticket_code_1, item_name, flight_number, "Xac nhan"],
    ]
    y = draw_table(
        18 * mm, y,
        [10 * mm, 34 * mm, 42 * mm, 36 * mm, 34 * mm],
        12 * mm,
        ["#", "Ma ve", "Hang bay", "Ma chuyen bay", "Tinh trang don hang"],
        order_rows,
        title="Thong tin don hang"
    ) - 8 * mm

    # ===== Section 2: Passenger info =====
    y = draw_table(
        18 * mm, y,
        [10 * mm, 62 * mm, 24 * mm, 30 * mm, 28 * mm, 28 * mm],
        12 * mm,
        ["#", "Ten day du", "Loai khach", "Gioi tinh", "Kiem tra hanh ly", "Ngay thang nam sinh"],
        passenger_rows,
        title="Thong tin hanh khach"
    ) - 8 * mm

    # ===== Section 3: Flight info =====
    flight_rows = [[
        item_name,
        flight_number,
        route_text,
        departure_date,
        depart_time,
        arrive_time,
        ticket_code_1,
    ]]
    y = draw_table(
        18 * mm, y,
        [26 * mm, 24 * mm, 40 * mm, 26 * mm, 20 * mm, 20 * mm, 24 * mm],
        14 * mm,
        ["Hang bay", "Ma chuyen bay", "Lo trinh bay", "Ngay khoi hanh", "Thoi gian khoi hanh", "Thoi gian den", "Ma ve"],
        flight_rows,
        title="Thong tin chuyen bay"
    ) - 8 * mm

    # ===== Section 4: Fare rules =====
    fare_title_h = 10 * mm
    fare_body_h = 16 * mm
    box_x = 18 * mm
    box_w = width - 36 * mm
    p.rect(box_x, y - fare_title_h - fare_body_h, box_w, fare_title_h + fare_body_h, stroke=1, fill=0)
    p.line(box_x, y - fare_title_h, box_x + box_w, y - fare_title_h)

    p.setFont("Helvetica-Bold", 10)
    p.drawString(box_x + 6, y - 14, "Quy tac gia")

    p.setFont("Helvetica", 9)
    p.drawString(box_x + 6, y - fare_title_h - 12, f"So chuyen bay {flight_number}:")
    p.drawString(box_x + 62 * mm, y - fare_title_h - 12, "Duoc doi ngay bay. Phi nang hang tuy theo chinh sach hang.")
    p.drawString(box_x + 62 * mm, y - fare_title_h - 22, "Ve da thanh toan thanh cong.")
    y -= (fare_title_h + fare_body_h + 8 * mm)

    # ===== Notes =====
    p.setFont("Helvetica-Bold", 10)
    p.drawString(18 * mm, y - 4, "(*) Ghi chu quan trong")
    p.setFont("Helvetica", 9)

    notes = [
        "- Hanh khach vui long mang theo giay to tuy than hop le khi di may bay.",
        "- Hanh khach co mat tai san bay truoc gio khoi hanh it nhat 90 phut.",
        "- Vui long kiem tra email de nhan thong tin xac nhan va ve dien tu.",
        f"- Email nhan ve: {customer_email}",
        f"- Thoi gian thanh toan thanh cong: {paid_at}",
    ]

    line_y = y - 16
    for note in notes:
        p.drawString(20 * mm, line_y, note)
        line_y -= 12

    # ===== Footer =====
    p.setFont("Helvetica-Bold", 10)
    p.drawCentredString(width / 2, 24 * mm, "Cam on ban da dat dich vu tai BestPrice.")
    p.drawCentredString(width / 2, 18 * mm, "CHUC BAN CO CHUYEN DI VUI VE!")

    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer.read()

logger = logging.getLogger(__name__)

def send_payment_success_email(metadata):
    customer_email = metadata.get("customer_email")
    if not customer_email:
        logger.warning("Không tìm thấy email khách hàng!")
        return

    booking_type = metadata.get("booking_type", "")
    customer_name = metadata.get("customer_name", "")
    customer_phone = metadata.get("customer_phone", "")
    order_id = metadata.get("order_id", "")
    item_name = metadata.get("item_name", "")
    paid_at = metadata.get("paid_at", timezone.localtime().strftime("%d/%m/%Y %H:%M:%S"))

    subject = "Xác nhận thanh toán thành công"
    html_content = build_payment_email_html(
        booking_type=booking_type,
        item_name=item_name,
        customer_name=customer_name,
        customer_phone=customer_phone,
        customer_email=customer_email,
        order_id=order_id,
        paid_at=paid_at,
    )

    try:
        email = EmailMessage(
            subject=subject,
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[customer_email],
        )
        email.content_subtype = "html"

        # Gửi email
        email.send(fail_silently=False)
        logger.info(f"Email sent to {customer_email} for order {order_id}")

    except Exception as e:
        logger.error(f"Error sending email to {customer_email} for order {order_id}: {str(e)}")


@csrf_exempt
@require_POST
def create_checkout_session(request):
    try:
        data = json.loads(request.body or "{}")

        product_name = data.get("product_name", "Tour Booking")
        amount = int(data.get("amount", 100000))
        currency = data.get("currency", "vnd")

        order_id = data.get("order_id", f"DH{int(datetime.now().timestamp())}")
        customer_name = data.get("customer_name", "")
        customer_phone = data.get("customer_phone", "")
        customer_email = data.get("customer_email", "")
        created_at = data.get("created_at", timezone.localtime().strftime("%d/%m/%Y %H:%M:%S"))

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": currency,
                        "product_data": {
                            "name": product_name,
                        },
                        "unit_amount": amount,
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url="http://localhost:3000/success",
            cancel_url="http://localhost:3000/cancel",
            customer_email=customer_email if customer_email else None,
            metadata={
                "booking_type": "tour",
                "item_name": product_name,
                "order_id": order_id,
                "customer_name": customer_name,
                "customer_phone": customer_phone,
                "customer_email": customer_email,
                "created_at": created_at,
            },
        )

        return JsonResponse({
            "id": checkout_session.id,
            "url": checkout_session.url
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_POST
def create_flight_checkout_session(request):
    try:
        data = json.loads(request.body or "{}")

        flight_number = data.get("flight_number", "Flight Booking")
        price = data.get("price", 100)
        currency = data.get("currency", "usd")

        order_id = data.get("order_id", f"DH{int(datetime.now().timestamp())}")
        customer_name = data.get("customer_name", "")
        customer_phone = data.get("customer_phone", "")
        customer_email = data.get("customer_email", "")
        customer_dob = data.get("customer_dob", "")
        gender = data.get("gender", "")
        created_at = data.get("created_at", timezone.localtime().strftime("%d/%m/%Y %H:%M:%S"))

        departure = data.get("departure", "")
        arrival = data.get("arrival", "")
        departure_date = data.get("departure_date", "")
        flight_time = data.get("flight_time", "")
        passengers = str(data.get("passengers", ""))

        amount = int(float(price) * 100)

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": currency,
                        "product_data": {
                            "name": f"Flight {flight_number}",
                        },
                        "unit_amount": amount,
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url="http://localhost:3000/success",
            cancel_url="http://localhost:3000/cancel",
            customer_email=customer_email if customer_email else None,
            metadata={
                "booking_type": "flight",
                "item_name": f"Flight {flight_number}",
                "flight_number": flight_number,
                "order_id": order_id,
                "customer_name": customer_name,
                "customer_phone": customer_phone,
                "customer_email": customer_email,
                "customer_dob": customer_dob,
                "gender": gender,
                "created_at": created_at,
                "departure": departure,
                "arrival": arrival,
                "departure_date": departure_date,
                "flight_time": flight_time,
                "passengers": passengers,
            },
        )

        return JsonResponse({
            "id": checkout_session.id,
            "url": checkout_session.url
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_POST
def create_hotel_checkout_session(request):
    try:
        data = json.loads(request.body or "{}")

        hotel_id = data.get("hotel_id")
        hotel_name = data.get("hotel_name", "Hotel Booking")
        price = data.get("price", 0)
        currency = data.get("currency", "usd")

        check_in = data.get("check_in", "")
        check_out = data.get("check_out", "")
        guests = data.get("guests", "")
        customer_name = data.get("customer_name", "")
        customer_dob = data.get("customer_dob", "")
        customer_phone = data.get("customer_phone", "")
        customer_email = data.get("customer_email", "")
        order_id = data.get("order_id", f"DH{int(datetime.now().timestamp())}")
        created_at = data.get("created_at", timezone.localtime().strftime("%d/%m/%Y %H:%M:%S"))

        amount = int(float(price) * 100)

        description_parts = []

        if hotel_id:
            description_parts.append(f"Hotel ID: {hotel_id}")
        if check_in:
            description_parts.append(f"Check-in: {check_in}")
        if check_out:
            description_parts.append(f"Check-out: {check_out}")
        if guests:
            description_parts.append(f"Guests: {guests}")
        if customer_name:
            description_parts.append(f"Customer: {customer_name}")
        if customer_dob:
            description_parts.append(f"DOB: {customer_dob}")
        if customer_phone:
            description_parts.append(f"Phone: {customer_phone}")

        description = ", ".join(description_parts) if description_parts else "Hotel booking payment"

        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": currency,
                        "product_data": {
                            "name": hotel_name,
                            "description": description,
                        },
                        "unit_amount": amount,
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url="http://localhost:3000/success",
            cancel_url="http://localhost:3000/cancel",
            customer_email=customer_email if customer_email else None,
            metadata={
                "booking_type": "hotel",
                "item_name": hotel_name,
                "hotel_id": str(hotel_id or ""),
                "order_id": order_id,
                "customer_name": customer_name,
                "customer_phone": customer_phone,
                "customer_email": customer_email,
                "customer_dob": customer_dob,
                "check_in": check_in,
                "check_out": check_out,
                "guests": str(guests),
                "created_at": created_at,
            },
        )

        return JsonResponse({
            "id": checkout_session.id,
            "url": checkout_session.url
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
def stripe_webhook(request):
    print("=== DA VAO STRIPE WEBHOOK ===")

    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        if endpoint_secret:
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=sig_header,
                secret=endpoint_secret,
            )
        else:
            event = json.loads(payload)
    except Exception as e:
        print("Webhook loi:", str(e))
        return HttpResponse(status=400)

    print("Event type:", event["type"])

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {}) or {}
        metadata["paid_at"] = timezone.localtime().strftime("%d/%m/%Y %H:%M:%S")
        print("Metadata:", metadata)
        send_payment_success_email(metadata)
        print("Da goi ham gui email")

    return HttpResponse(status=200)