import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const REVIEW_API_URL = "http://127.0.0.1:8000/api/hotel-reviews/";
const HOTEL_CHECKOUT_API_URL =
  "http://127.0.0.1:8000/api/payment/create-hotel-checkout-session/";

const HotelCustomerInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const hotel = location.state?.hotel;
  const bookingInfo = location.state?.bookingInfo || {};
  const selectedRoom = location.state?.selectedRoom || null;

  const [contactName, setContactName] = useState("");
  const [phoneCode, setPhoneCode] = useState("+84");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [guestName, setGuestName] = useState("");
  const [isBookingForMe, setIsBookingForMe] = useState(false);
  const [specialRequest, setSpecialRequest] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  useEffect(() => {
    if (!hotel?.id) return;

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);

        const response = await fetch(`${REVIEW_API_URL}?hotel_id=${hotel.id}`);

        if (!response.ok) {
          throw new Error("Не удалось загрузить отзывы об отеле.");
        }

        const data = await response.json();

        const reviewList = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : [];

        setReviews(reviewList);
      } catch (error) {
        console.error("Cannot load hotel reviews:", error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [hotel?.id]);

  if (!hotel) {
    return (
      <div className="hotel-booking-missing">
        <div className="hotel-booking-missing-card">
          <h2>Нет информации о бронировании</h2>
          <p>Пожалуйста, вернитесь назад и выберите номер перед продолжением.</p>
          <button onClick={() => navigate("/hotel-results")}>Назад</button>
        </div>
      </div>
    );
  }

  const roomName =
    selectedRoom?.name ||
    hotel?.roomName ||
    "Executive Deluxe - Специальное предложение";

  const checkIn = bookingInfo?.checkIn || "";
  const checkOut = bookingInfo?.checkOut || "";
  const guests = bookingInfo?.guests || bookingInfo?.adults || 2;
  const children = bookingInfo?.children || 0;

  let nights = 1;

  if (checkIn && checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    nights = diff > 0 ? diff : 1;
  }

  const parsePrice = (price) => {
    if (price === null || price === undefined) return 0;

    const cleaned = String(price).replace(/[^\d.]/g, "");
    return Number(cleaned || 0);
  };

  const unitRoomPrice = parsePrice(hotel.price);
  const roomPrice = unitRoomPrice * nights;
  const taxFee = Math.round(roomPrice * 0.155);
  const totalPrice = roomPrice + taxFee;

  const formatCurrency = (value) => {
    return `${Number(value || 0).toLocaleString("en-US")} USD`;
  };

  const reviewCount = reviews.length;

  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        reviewCount
      : null;

  const averageRatingDisplay =
    averageRating !== null ? averageRating.toFixed(1) : "Пока нет отзывов";

  const renderStarsFromRating10 = (rating10) => {
    if (rating10 === null || rating10 === undefined) return "☆☆☆☆☆";

    const rating5 = Number(rating10) / 2;
    const rounded = Math.round(rating5);

    return "★".repeat(rounded) + "☆".repeat(5 - rounded);
  };

  const formatDateVN = (dateString) => {
    if (!dateString) return "";

    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;

    const weekdays = [
      "Воскресенье",
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
    ];

    return `${weekdays[d.getDay()]}, ${d.getDate()}.${
      d.getMonth() + 1
    }.${d.getFullYear()}`;
  };

  const handleBookingForMe = (checked) => {
    setIsBookingForMe(checked);

    if (checked) {
      setGuestName(contactName);
    }
  };

  const savePendingBookingToLocalStorage = (orderId) => {
    const newBooking = {
      id: orderId,
      orderId: orderId,

      type: "hotel",
      status: "pending",

      hotelId: hotel.id,
      hotelName: hotel.name,
      hotel: hotel,

      roomName: roomName,

      checkIn: checkIn,
      checkOut: checkOut,
      nights: nights,
      guests: guests,
      children: children,

      bookingInfo: {
        location: bookingInfo?.location || "",
        checkIn: checkIn,
        checkOut: checkOut,
        guests: guests,
        children: children,
      },

      customerName: guestName,
      customerPhone: `${phoneCode} ${phone}`,
      customerEmail: email,

      customerInfo: {
        fullName: guestName,
        contactName: contactName,
        phone: `${phoneCode} ${phone}`,
        email: email,
        specialRequest: specialRequest,
      },

      unitRoomPrice: unitRoomPrice,
      roomPrice: roomPrice,
      taxFee: taxFee,
      price: totalPrice,
      totalPrice: totalPrice,
      currency: "USD",

      specialRequest: specialRequest,

      createdAt: new Date().toLocaleString("vi-VN"),
      paidAt: "",
    };

    const existingBookings = JSON.parse(
      localStorage.getItem("myBookings") || "[]"
    );

    const updatedBookings = [
      ...existingBookings.filter((item) => item.orderId !== orderId),
      newBooking,
    ];

    localStorage.setItem("myBookings", JSON.stringify(updatedBookings));
  };

  const handleContinue = async (e) => {
    e.preventDefault();

    if (!contactName || !phone || !email || !guestName) {
      alert("Пожалуйста, заполните всю обязательную информацию.");
      return;
    }

    if ((hotel.availableRooms ?? 10) <= 0) {
      alert("В этом отеле сейчас нет свободных номеров.");
      return;
    }

    try {
      setIsCreatingCheckout(true);

      const orderId = `HOTEL${Date.now()}`;

      const response = await fetch(HOTEL_CHECKOUT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hotel_id: hotel.id,
          hotel_name: hotel.name,
          price: totalPrice,
          currency: "usd",

          check_in: checkIn,
          check_out: checkOut,
          guests: guests,

          customer_name: guestName,
          customer_phone: `${phoneCode} ${phone}`,
          customer_email: email,

          order_id: orderId,
          created_at: new Date().toLocaleString("vi-VN"),
          special_request: specialRequest,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Не удалось создать платеж Stripe.");
        return;
      }

      if (data.url) {
        savePendingBookingToLocalStorage(orderId);
        window.location.href = data.url;
        return;
      }

      alert("Не получена ссылка для оплаты Stripe.");
    } catch (error) {
      console.error("Stripe checkout error:", error);
      alert("Произошла ошибка при переходе к оплате Stripe.");
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  return (
    <div className="hotel-customer-page">
      <div className="hotel-customer-container">
        <div className="hotel-customer-topbar">
          <div className="hotel-customer-brand">
            <div className="hotel-customer-logo">BestPrice</div>

            <div className="hotel-customer-hotel-meta">
              <h2>{hotel.name}</h2>

              <div className="hotel-customer-rating-row">
                <span className="hotel-customer-stars">
                  {reviewsLoading
                    ? "☆☆☆☆☆"
                    : renderStarsFromRating10(averageRating)}
                </span>

                <span className="hotel-customer-score">
                  {reviewsLoading
                    ? "Загрузка..."
                    : averageRating !== null
                    ? `${averageRatingDisplay}/10`
                    : "Пока нет отзывов"}
                </span>

                <span className="hotel-customer-review-count">
                  ({reviewCount} реальных отзывов)
                </span>
              </div>
            </div>
          </div>

          <div className="hotel-customer-steps">
            <span className="active-step">1 Проверка</span>
            <span className="step-divider">—</span>
            <span>2 Оплата</span>
          </div>
        </div>

        <form onSubmit={handleContinue} className="hotel-customer-layout">
          <div className="hotel-customer-left">
            <section className="hotel-customer-section">
              <h3>✉️ Контакт для бронирования</h3>
              <p>Добавьте контактные данные, чтобы получить подтверждение бронирования.</p>

              <div className="hotel-customer-form-box">
                <div className="hotel-customer-field full">
                  <label>ФИО*</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => {
                      setContactName(e.target.value);

                      if (isBookingForMe) {
                        setGuestName(e.target.value);
                      }
                    }}
                    placeholder="Введите ФИО контактного лица"
                  />
                  <small>
                    Для вьетнамских гостей: введите отчество + имя + фамилию.
                    Для иностранных гостей: введите имя + фамилию.
                  </small>
                </div>

                <div className="hotel-customer-row">
                  <div className="hotel-customer-field">
                    <label>Мобильный телефон*</label>

                    <div className="hotel-phone-group">
                      <select
                        value={phoneCode}
                        onChange={(e) => setPhoneCode(e.target.value)}
                        className="hotel-phone-code"
                      >
                        <option value="+84">+84</option>
                        <option value="+7">+7</option>
                        <option value="+1">+1</option>
                        <option value="+82">+82</option>
                        <option value="+81">+81</option>
                        <option value="+66">+66</option>
                      </select>

                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Введите номер телефона"
                      />
                    </div>

                    <small>
                      Введите номер телефона без выбранного кода страны/региона.
                    </small>
                  </div>

                  <div className="hotel-customer-field">
                    <label>Email*</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Например: email@example.com"
                    />
                    <small>
                      Пожалуйста, укажите email для получения подтверждения бронирования.
                    </small>
                  </div>
                </div>

                <div className="hotel-customer-checkbox-row">
                  <label className="hotel-checkbox-label">
                    <input
                      type="checkbox"
                      checked={isBookingForMe}
                      onChange={(e) => handleBookingForMe(e.target.checked)}
                    />
                    <span>Я бронирую для себя</span>
                  </label>
                </div>
              </div>
            </section>

            <section className="hotel-customer-section">
              <h3>👤 Информация о госте</h3>
              <p>
                Пожалуйста, заполните данные для получения подтверждения заказа.
              </p>

              <div className="hotel-customer-form-box">
                <div className="hotel-customer-field full">
                  <label>ФИО*</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Введите ФИО гостя"
                  />
                  <small>
                    Для вьетнамских гостей: введите отчество + имя + фамилию.
                    Для иностранных гостей: введите имя + фамилию.
                  </small>
                </div>
              </div>
            </section>

            <section className="hotel-customer-section">
              <h3>📝 Особые пожелания</h3>
              <p>
                Отель постарается выполнить ваши пожелания, но не может
                гарантировать это на 100%.
              </p>

              <div className="hotel-customer-form-box">
                <div className="hotel-customer-field full">
                  <label>Дополнительные пожелания</label>
                  <textarea
                    rows="4"
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="Например: высокий этаж, двуспальная кровать, ранний заезд..."
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="hotel-customer-right">
            <div className="hotel-booking-summary-card">
              <div className="hotel-booking-summary-highlight">
                ✨ Отличный выбор для вашего отдыха.
              </div>

              <h3 className="hotel-booking-room-name">(1x) {roomName}</h3>

              <div className="hotel-booking-time-grid">
                <div>
                  <span>Заезд</span>
                  <strong>{formatDateVN(checkIn)}</strong>
                  <small>С 14:00</small>
                </div>

                <div className="hotel-booking-night-col">
                  <strong>{nights} ночей</strong>
                  <span>→</span>
                </div>

                <div>
                  <span>Выезд</span>
                  <strong>{formatDateVN(checkOut)}</strong>
                  <small>До 12:00</small>
                </div>
              </div>

              <div className="hotel-booking-extra-info">
                <p>
                  👥 {guests} гостей
                  {Number(children) > 0 ? `, ${children} детей` : ""}
                </p>
                <p>🚫 Это бронирование не подлежит возврату.</p>
                <p>📅 Изменение даты недоступно</p>
                <p>📶 Бесплатный WiFi</p>
              </div>
            </div>

            <div className="hotel-booking-price-card">
              <div className="hotel-booking-price-header">
                <h3>🏷️ Детали стоимости</h3>
              </div>

              <div className="hotel-booking-price-row">
                <span>Стоимость номера</span>
                <span>{formatCurrency(roomPrice)}</span>
              </div>

              <div className="hotel-booking-price-sub">
                (1x) {roomName} ({nights} ночей)
              </div>

              <div className="hotel-booking-price-row">
                <span>Налоги и сборы</span>
                <span>{formatCurrency(taxFee)}</span>
              </div>

              <div className="hotel-booking-total-box">
                <div>
                  <strong>Итого</strong>
                  <p>
                    1 номер, {nights} ночей
                  </p>
                </div>

                <div className="hotel-booking-total-price">
                  {formatCurrency(totalPrice)}
                </div>
              </div>

              <button
                type="submit"
                className="hotel-booking-continue-btn"
                disabled={isCreatingCheckout}
              >
                {isCreatingCheckout ? "Переход к Stripe..." : "Продолжить"}
              </button>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default HotelCustomerInfo;