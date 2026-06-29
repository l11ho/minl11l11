import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const HOTEL_CHECKOUT_API_URL =
  "http://127.0.0.1:8000/api/payment/create-hotel-checkout-session/";

const FLIGHT_CHECKOUT_API_URL =
  "http://127.0.0.1:8000/api/payment/create-flight-checkout-session/";

const MyBookings = () => {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {
    fullName: "Гость",
    email: "Google",
  };

  const [activeTab, setActiveTab] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loadingPaymentId, setLoadingPaymentId] = useState(null);

  const [bookings, setBookings] = useState(() => {
    const savedMyBookings = JSON.parse(localStorage.getItem("myBookings") || "[]");
    const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");

    const combined = [
      ...(Array.isArray(savedMyBookings) ? savedMyBookings : []),
      ...(Array.isArray(savedBookings) ? savedBookings : []),
    ];

    const bookingMap = new Map();

    combined.forEach((booking) => {
      const key =
        booking.orderId ||
        booking.id ||
        `${booking.type}-${booking.itemName}-${booking.createdAt}`;

      if (!bookingMap.has(key)) {
        bookingMap.set(key, booking);
      } else {
        bookingMap.set(key, {
          ...bookingMap.get(key),
          ...booking,
        });
      }
    });

    return Array.from(bookingMap.values());
  });

  const saveBookings = (newBookings) => {
    setBookings(newBookings);
    localStorage.setItem("myBookings", JSON.stringify(newBookings));
    localStorage.setItem("bookings", JSON.stringify(newBookings));
  };

  const normalizeStatus = (status) => {
    if (status === "paid" || status === "Đã thanh toán") return "paid";
    if (status === "cancelled" || status === "Đã hủy") return "cancelled";

    if (
      status === "pending" ||
      status === "Pending Payment" ||
      status === "Ожидает оплаты" ||
      status === "Chờ thanh toán"
    ) {
      return "pending";
    }

    return status || "pending";
  };

  const filteredBookings = useMemo(() => {
    if (activeTab === "all") {
      return bookings.filter(
        (booking) => normalizeStatus(booking.status) !== "cancelled"
      );
    }

    if (activeTab === "hotel") {
      return bookings.filter(
        (booking) =>
          booking.type === "hotel" &&
          normalizeStatus(booking.status) !== "cancelled"
      );
    }

    if (activeTab === "tour") {
      return bookings.filter(
        (booking) =>
          booking.type === "tour" &&
          normalizeStatus(booking.status) !== "cancelled"
      );
    }

    if (activeTab === "flight") {
      return bookings.filter(
        (booking) =>
          booking.type === "flight" &&
          normalizeStatus(booking.status) !== "cancelled"
      );
    }

    if (activeTab === "cancelled") {
      return bookings.filter(
        (booking) => normalizeStatus(booking.status) === "cancelled"
      );
    }

    return bookings;
  }, [bookings, activeTab]);

  const bookingCounts = useMemo(() => {
    return {
      all: bookings.filter(
        (booking) => normalizeStatus(booking.status) !== "cancelled"
      ).length,

      hotel: bookings.filter(
        (booking) =>
          booking.type === "hotel" &&
          normalizeStatus(booking.status) !== "cancelled"
      ).length,

      tour: bookings.filter(
        (booking) =>
          booking.type === "tour" &&
          normalizeStatus(booking.status) !== "cancelled"
      ).length,

      flight: bookings.filter(
        (booking) =>
          booking.type === "flight" &&
          normalizeStatus(booking.status) !== "cancelled"
      ).length,

      cancelled: bookings.filter(
        (booking) => normalizeStatus(booking.status) === "cancelled"
      ).length,
    };
  }, [bookings]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const parseNumber = (value) => {
    if (value === null || value === undefined) return 0;

    const cleaned = String(value).replace(/[^\d.]/g, "");
    return Number(cleaned || 0);
  };

  const formatCurrency = (value, currency = "USD") => {
    const number = parseNumber(value);
    return `${number.toLocaleString("en-US")} ${String(currency).toUpperCase()}`;
  };

  const getBookingId = (booking, index) => {
    return booking.orderId || booking.id || `booking-${index}`;
  };

  const getBookingTitle = (booking) => {
    if (booking.type === "hotel") {
      return booking.hotelName || booking.hotel?.name || "Бронирование отеля";
    }

    if (booking.type === "tour") {
      return (
        booking.tourName ||
        booking.title ||
        booking.itemName ||
        booking.tour?.name ||
        "Туристический тур"
      );
    }

    if (booking.type === "flight") {
      return (
        booking.flightNumber ||
        booking.flight?.flight_number ||
        booking.flightDetails?.departureFlight?.flight_number ||
        booking.itemName ||
        "Авиабилет"
      );
    }

    return booking.title || booking.itemName || "Бронирование";
  };

  const getBookingSubtitle = (booking) => {
    if (booking.type === "hotel") {
      return `${booking.checkIn || booking.bookingInfo?.checkIn || "-"} → ${
        booking.checkOut || booking.bookingInfo?.checkOut || "-"
      }`;
    }

    if (booking.type === "tour") {
      const departure = booking.departure || booking.from || "-";
      const destination = booking.destination || booking.to || "-";
      const date =
        booking.departureDate ||
        booking.bookingInfo?.departureDate ||
        booking.selectedDepartureDate ||
        "";

      return `${departure} → ${destination}${date ? ` • ${date}` : ""}`;
    }

    if (booking.type === "flight") {
      const departure =
        booking.departure ||
        booking.flight?.departure ||
        booking.flightDetails?.departureFlight?.departure ||
        booking.from ||
        "";

      const arrival =
        booking.arrival ||
        booking.flight?.arrival ||
        booking.flightDetails?.departureFlight?.arrival ||
        booking.to ||
        "";

      const date =
        booking.departureDate ||
        booking.departure_date ||
        booking.flight?.departure_date ||
        booking.flightDetails?.departureFlight?.date ||
        "";

      return `${departure || "-"} → ${arrival || "-"}${
        date ? ` • ${date}` : ""
      }`;
    }

    return booking.createdAt || "";
  };

  const getPassengerText = (booking) => {
    if (booking.type === "tour") {
      const passengers = booking.passengers || {};

      if (typeof passengers === "string") return passengers;

      const adults = Number(passengers.adults || 0);
      const children = Number(passengers.children || 0);
      const smallChildren = Number(passengers.smallChildren || 0);
      const infants = Number(passengers.infants || 0);

      if (adults || children || smallChildren || infants) {
        return `${adults || 1} взрослых, ${children} детей, ${smallChildren} маленьких детей, ${infants} младенцев`;
      }

      return "1 взрослый";
    }

    if (booking.passengers) return booking.passengers;

    const searchInfo = booking.searchInfo || {};

    if (searchInfo.passengers) return searchInfo.passengers;

    const adults = Number(searchInfo.adults || 0);
    const children = Number(searchInfo.children || 0);
    const infants = Number(searchInfo.infants || 0);

    if (adults || children || infants) {
      return `${adults || 1} взрослых, ${children} детей, ${infants} младенцев`;
    }

    return booking.type === "flight" ? "1 взрослый" : "-";
  };

  const getBookingImage = (booking) => {
    if (booking.type === "hotel") {
      return (
        booking.image ||
        booking.hotel?.image ||
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
      );
    }

    if (booking.type === "tour") {
      return (
        booking.image ||
        booking.tour?.image ||
        booking.tourImage ||
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
      );
    }

    return "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80";
  };

  const getBookingTypeLabel = (booking) => {
    if (booking.type === "hotel") return "🏨 Отель";
    if (booking.type === "tour") return "🌍 Тур";
    if (booking.type === "flight") return "✈️ Авиабилет";
    return "🧾 Бронирование";
  };

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "paid") return "Оплачено";
    if (normalized === "pending") return "Ожидает оплаты";
    if (normalized === "cancelled") return "Отменено";

    return "Неизвестно";
  };

  const getStatusClass = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "paid") return "success";
    if (normalized === "pending") return "pending";
    if (normalized === "cancelled") return "cancelled";

    return "neutral";
  };

  const handleCancelBooking = (bookingId) => {
    const confirmCancel = window.confirm(
      "Вы уверены, что хотите отменить это бронирование?"
    );

    if (!confirmCancel) return;

    const updatedBookings = bookings.map((booking) => {
      const currentId = booking.orderId || booking.id;

      if (currentId === bookingId) {
        return {
          ...booking,
          status: "cancelled",
          paymentStatus: "cancelled",
          cancelledAt: new Date().toLocaleString("vi-VN"),
        };
      }

      return booking;
    });

    saveBookings(updatedBookings);

    if (selectedBooking) {
      const selectedId = selectedBooking.orderId || selectedBooking.id;

      if (selectedId === bookingId) {
        setSelectedBooking(null);
      }
    }
  };

  const handleRefundRequest = (booking) => {
    alert(
      `Бронирование ${booking.orderId || booking.id || ""} уже оплачено. Пожалуйста, свяжитесь со службой поддержки для оформления возврата.`
    );
  };

  const handleRepay = async (booking) => {
    if (normalizeStatus(booking.status) === "cancelled") {
      alert("Бронирование отменено, повторная оплата невозможна.");
      return;
    }

    if (booking.type === "tour") {
      localStorage.setItem("latestOrderId", booking.orderId || booking.id);

      navigate("/payment", {
        state: {
          tour: {
            id: booking.tourId,
            name: booking.tourName || booking.title || booking.itemName,
            price: booking.baseTourPrice || booking.price || booking.totalPrice || 0,
            currency: booking.currency || "USD",
            image: booking.image,
            destination: booking.destination,
            departure: booking.departure,
            duration: booking.duration,
            selectedDepartureDate: booking.departureDate,
            selectedDepartureCode: booking.departureCode,
          },
          bookingInfo: {
            departureDate: booking.departureDate,
            departureCode: booking.departureCode,
            price: booking.baseTourPrice || booking.price || booking.totalPrice || 0,
            currency: booking.currency || "USD",
          },
          customerInfo: {
            fullName:
              booking.customerName ||
              booking.customerInfo?.fullName ||
              currentUser.fullName ||
              "",
            phone:
              booking.customerPhone ||
              booking.customerInfo?.phone ||
              "",
            email:
              booking.customerEmail ||
              booking.customerInfo?.email ||
              currentUser.email ||
              "",
            address: booking.customerInfo?.address || "",
          },
        },
      });

      return;
    }

    try {
      const bookingId = booking.orderId || booking.id;
      setLoadingPaymentId(bookingId);
      localStorage.setItem("latestOrderId", bookingId);

      let response;

      if (booking.type === "hotel") {
        response = await fetch(HOTEL_CHECKOUT_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hotel_id: booking.hotelId || booking.hotel?.id,
            hotel_name:
              booking.hotelName || booking.hotel?.name || "Hotel Booking",
            price: booking.totalPrice || booking.price || 0,
            currency: String(booking.currency || "usd").toLowerCase(),

            check_in: booking.checkIn || booking.bookingInfo?.checkIn || "",
            check_out: booking.checkOut || booking.bookingInfo?.checkOut || "",
            guests: booking.guests || booking.bookingInfo?.guests || "",

            customer_name:
              booking.customerName ||
              booking.customerInfo?.fullName ||
              currentUser.fullName ||
              "",
            customer_phone:
              booking.customerPhone || booking.customerInfo?.phone || "",
            customer_email:
              booking.customerEmail || booking.customerInfo?.email || "",

            order_id: booking.orderId || `HOTEL${Date.now()}`,
            created_at: new Date().toLocaleString("vi-VN"),
            special_request: booking.specialRequest || "",
          }),
        });
      } else if (booking.type === "flight") {
        const departureFlight = booking.flightDetails?.departureFlight || {};

        response = await fetch(FLIGHT_CHECKOUT_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flight_number:
              booking.flightNumber ||
              booking.flight?.flight_number ||
              departureFlight.flight_number ||
              "",
            price: booking.totalPrice || booking.price || 0,
            currency: String(booking.currency || "usd").toLowerCase(),

            order_id: booking.orderId || `FLIGHT${Date.now()}`,

            customer_name:
              booking.customerName ||
              booking.customerInfo?.fullName ||
              booking.fullName ||
              currentUser.fullName ||
              "",
            customer_phone:
              booking.customerPhone ||
              booking.customerInfo?.phone ||
              booking.phone ||
              "",
            customer_email:
              booking.customerEmail ||
              booking.customerInfo?.email ||
              booking.email ||
              "",

            customer_dob:
              booking.customerDob || booking.customerInfo?.dateOfBirth || "",
            gender: booking.gender || booking.customerInfo?.gender || "",

            departure:
              booking.departure ||
              departureFlight.departure ||
              booking.from ||
              "",
            arrival:
              booking.arrival ||
              departureFlight.arrival ||
              booking.to ||
              "",
            departure_date:
              booking.departureDate ||
              booking.departure_date ||
              departureFlight.date ||
              "",
            flight_time:
              booking.flightTime ||
              booking.flight_time ||
              departureFlight.departure_time ||
              "",
            passengers: getPassengerText(booking),

            created_at: new Date().toLocaleString("vi-VN"),
          }),
        });
      } else {
        alert("Не удалось определить тип бронирования.");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Не удалось повторно создать платеж Stripe.");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      alert("Не получена ссылка для оплаты Stripe.");
    } catch (error) {
      console.error("Repay error:", error);
      alert("Произошла ошибка при повторном создании платежа.");
    } finally {
      setLoadingPaymentId(null);
    }
  };

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-container">
        <aside className="my-bookings-sidebar">
          <div className="mb-profile-card">
            <div className="mb-avatar">
              {currentUser?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="mb-profile-info">
              <h3>{currentUser?.fullName || "Пользователь"}</h3>
              <p>{currentUser?.email || "Google"}</p>
            </div>

            <div className="mb-priority-badge">
              🥈 Вы участник Silver Priority
            </div>
          </div>

          <div className="mb-side-menu">
            <div className="mb-side-group">
              <div className="mb-side-item">
                <span>🪙</span>
                <span>0</span>
              </div>

              <div className="mb-side-item">
                <span>💳</span>
                <span>Оплата</span>
              </div>
            </div>

            <div className="mb-side-group">
              <div className="mb-side-item active">
                <span>🧾</span>
                <span>Мои бронирования</span>
              </div>

              <div className="mb-side-item">
                <span>📋</span>
                <span>Список транзакций</span>
              </div>

              <div className="mb-side-item">
                <span>💸</span>
                <span>Возврат средств</span>
              </div>

              <div className="mb-side-item">
                <span>🔔</span>
                <span>Уведомления о ценах на авиабилеты</span>
              </div>

              <div className="mb-side-item">
                <span>👤</span>
                <span>Сохраненные данные пассажиров</span>
              </div>
            </div>

            <div className="mb-side-group">
              <div className="mb-side-item">
                <span>⚙️</span>
                <span>Аккаунт</span>
              </div>

              <div className="mb-side-item danger" onClick={handleLogout}>
                <span>⏻</span>
                <span>Выйти</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="my-bookings-main">
          <section className="mb-section">
            <h2 className="mb-section-title">
              Текущие электронные билеты и платежные ваучеры
            </h2>

            <div className="mb-tabs">
              <button
                type="button"
                className={activeTab === "all" ? "active" : ""}
                onClick={() => setActiveTab("all")}
              >
                Все ({bookingCounts.all})
              </button>

              <button
                type="button"
                className={activeTab === "hotel" ? "active" : ""}
                onClick={() => setActiveTab("hotel")}
              >
                Отели ({bookingCounts.hotel})
              </button>

              <button
                type="button"
                className={activeTab === "tour" ? "active" : ""}
                onClick={() => setActiveTab("tour")}
              >
                Туры ({bookingCounts.tour})
              </button>

              <button
                type="button"
                className={activeTab === "flight" ? "active" : ""}
                onClick={() => setActiveTab("flight")}
              >
                Авиабилеты ({bookingCounts.flight})
              </button>

              <button
                type="button"
                className={activeTab === "cancelled" ? "active" : ""}
                onClick={() => setActiveTab("cancelled")}
              >
                Отменено ({bookingCounts.cancelled})
              </button>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="mb-empty-card">
                <div className="mb-empty-icon">🧳</div>

                <div>
                  <h3>Бронирования не найдены</h3>
                  <p>
                    Все ваши бронирования будут отображаться здесь. Сейчас в
                    этом разделе нет бронирований.
                  </p>

                  <button
                    type="button"
                    className="mb-primary-btn"
                    onClick={() => navigate("/")}
                  >
                    Перейти на главную
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-active-list">
                {filteredBookings.map((booking, index) => {
                  const bookingId = getBookingId(booking, index);
                  const status = normalizeStatus(booking.status);

                  return (
                    <div className="mb-booking-card" key={bookingId}>
                      <img
                        src={getBookingImage(booking)}
                        alt={getBookingTitle(booking)}
                        className="mb-booking-image"
                      />

                      <div className="mb-booking-content">
                        <div className="mb-booking-type-line">
                          <span className="mb-booking-type">
                            {getBookingTypeLabel(booking)}
                          </span>

                          <span className={`mb-status ${getStatusClass(status)}`}>
                            {getStatusLabel(status)}
                          </span>
                        </div>

                        <h3>{getBookingTitle(booking)}</h3>

                        <p>{getBookingSubtitle(booking)}</p>

                        <p>
                          <strong>Код заказа:</strong>{" "}
                          {booking.orderId || booking.id || "N/A"}
                        </p>

                        <p>
                          <strong>Клиент:</strong>{" "}
                          {booking.customerName ||
                            booking.customerInfo?.fullName ||
                            booking.fullName ||
                            "-"}
                        </p>

                        <p>
                          <strong>Итого:</strong>{" "}
                          {formatCurrency(
                            booking.totalPrice || booking.price || 0,
                            booking.currency || "USD"
                          )}
                        </p>
                      </div>

                      <div className="mb-booking-actions">
                        <button
                          type="button"
                          className="mb-outline-btn"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          Подробнее
                        </button>

                        {status !== "paid" && (
                          <button
                            type="button"
                            className="mb-pay-btn"
                            onClick={() => handleRepay(booking)}
                            disabled={
                              loadingPaymentId === bookingId ||
                              status === "cancelled"
                            }
                          >
                            {loadingPaymentId === bookingId
                              ? "Создание..."
                              : "Оплатить снова"}
                          </button>
                        )}

                        {status === "paid" ? (
                          <button
                            type="button"
                            className="mb-cancel-btn"
                            onClick={() => handleRefundRequest(booking)}
                          >
                            Запросить возврат
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="mb-cancel-btn"
                            onClick={() => handleCancelBooking(bookingId)}
                            disabled={status === "cancelled"}
                          >
                            Отменить бронирование
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mb-section">
            <h2 className="mb-section-title">История транзакций</h2>

            {bookings.length === 0 ? (
              <div className="mb-history-card">
                <p>
                  Посмотреть <span className="mb-link-text">историю транзакций</span>{" "}
                  вашего аккаунта
                </p>
              </div>
            ) : (
              <div className="mb-history-list">
                {bookings.map((booking, index) => (
                  <div
                    className="mb-history-item"
                    key={booking.orderId || booking.id || `history-${index}`}
                  >
                    <div>
                      <strong>{getBookingTitle(booking)}</strong>
                      <p>
                        {booking.orderId || booking.id || "N/A"} •{" "}
                        {booking.createdAt || booking.paidAt || "-"}
                      </p>
                    </div>

                    <span
                      className={`mb-status ${getStatusClass(
                        booking.status || "pending"
                      )}`}
                    >
                      {getStatusLabel(booking.status || "pending")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {selectedBooking && (
        <div
          className="booking-detail-overlay"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="booking-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="booking-detail-header">
              <div>
                <h2>Детали бронирования</h2>
                <p>{selectedBooking.orderId || selectedBooking.id}</p>
              </div>

              <button
                type="button"
                className="booking-detail-close"
                onClick={() => setSelectedBooking(null)}
              >
                ×
              </button>
            </div>

            <div className="booking-detail-body">
              <div className="booking-detail-main">
                <h3>{getBookingTitle(selectedBooking)}</h3>

                <span
                  className={`booking-detail-status ${getStatusClass(
                    selectedBooking.status || "pending"
                  )}`}
                >
                  {getStatusLabel(selectedBooking.status || "pending")}
                </span>
              </div>

              <div className="booking-detail-grid">
                <div>
                  <label>Тип бронирования</label>
                  <p>
                    {selectedBooking.type === "hotel"
                      ? "Отель"
                      : selectedBooking.type === "tour"
                      ? "Тур"
                      : selectedBooking.type === "flight"
                      ? "Авиабилет"
                      : "Бронирование"}
                  </p>
                </div>

                <div>
                  <label>Код заказа</label>
                  <p>{selectedBooking.orderId || selectedBooking.id || "-"}</p>
                </div>

                <div>
                  <label>Клиент</label>
                  <p>
                    {selectedBooking.customerName ||
                      selectedBooking.customerInfo?.fullName ||
                      selectedBooking.fullName ||
                      "-"}
                  </p>
                </div>

                <div>
                  <label>Email</label>
                  <p>
                    {selectedBooking.customerEmail ||
                      selectedBooking.customerInfo?.email ||
                      selectedBooking.email ||
                      "-"}
                  </p>
                </div>

                <div>
                  <label>Телефон</label>
                  <p>
                    {selectedBooking.customerPhone ||
                      selectedBooking.customerInfo?.phone ||
                      selectedBooking.phone ||
                      "-"}
                  </p>
                </div>

                <div>
                  <label>Итого</label>
                  <p>
                    {formatCurrency(
                      selectedBooking.totalPrice || selectedBooking.price || 0,
                      selectedBooking.currency || "USD"
                    )}
                  </p>
                </div>

                {selectedBooking.type === "hotel" && (
                  <>
                    <div>
                      <label>Название отеля</label>
                      <p>{selectedBooking.hotelName || "-"}</p>
                    </div>

                    <div>
                      <label>Тип номера</label>
                      <p>{selectedBooking.roomName || "-"}</p>
                    </div>

                    <div>
                      <label>Дата заезда</label>
                      <p>{selectedBooking.checkIn || "-"}</p>
                    </div>

                    <div>
                      <label>Дата выезда</label>
                      <p>{selectedBooking.checkOut || "-"}</p>
                    </div>

                    <div>
                      <label>Количество ночей</label>
                      <p>{selectedBooking.nights || "-"}</p>
                    </div>

                    <div>
                      <label>Количество гостей</label>
                      <p>{selectedBooking.guests || "-"}</p>
                    </div>

                    <div>
                      <label>Особые пожелания</label>
                      <p>{selectedBooking.specialRequest || "Нет"}</p>
                    </div>

                    <div>
                      <label>Время создания</label>
                      <p>{selectedBooking.createdAt || "-"}</p>
                    </div>

                    <div>
                      <label>Время оплаты</label>
                      <p>{selectedBooking.paidAt || "-"}</p>
                    </div>
                  </>
                )}

                {selectedBooking.type === "tour" && (
                  <>
                    <div>
                      <label>Название тура</label>
                      <p>
                        {selectedBooking.tourName ||
                          selectedBooking.title ||
                          selectedBooking.itemName ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <label>Пункт отправления</label>
                      <p>{selectedBooking.departure || "-"}</p>
                    </div>

                    <div>
                      <label>Направление</label>
                      <p>{selectedBooking.destination || "-"}</p>
                    </div>

                    <div>
                      <label>Дата отправления</label>
                      <p>{selectedBooking.departureDate || "-"}</p>
                    </div>

                    <div>
                      <label>Код тура</label>
                      <p>{selectedBooking.departureCode || "-"}</p>
                    </div>

                    <div>
                      <label>Длительность тура</label>
                      <p>{selectedBooking.duration || "-"}</p>
                    </div>

                    <div>
                      <label>Количество пассажиров</label>
                      <p>{getPassengerText(selectedBooking)}</p>
                    </div>

                    <div>
                      <label>Доплата за одноместный номер</label>
                      <p>
                        {selectedBooking.singleRoom
                          ? formatCurrency(
                              selectedBooking.singleRoomFee ||
                                selectedBooking.singleRoomFeeUsd ||
                                0,
                              selectedBooking.currency || "USD"
                            )
                          : "Нет"}
                      </p>
                    </div>

                    <div>
                      <label>Примечание</label>
                      <p>{selectedBooking.note || "Нет"}</p>
                    </div>

                    <div>
                      <label>Время создания</label>
                      <p>{selectedBooking.createdAt || "-"}</p>
                    </div>

                    <div>
                      <label>Время оплаты</label>
                      <p>{selectedBooking.paidAt || "-"}</p>
                    </div>

                    {selectedBooking.travelerDetails?.length > 0 && (
                      <div>
                        <label>Информация о пассажирах</label>
                        <p>
                          {selectedBooking.travelerDetails
                            .map(
                              (traveler) =>
                                `${traveler.fullName || "-"} • ${
                                  traveler.gender || "-"
                                } • ${traveler.dateOfBirth || "-"}`
                            )
                            .join(", ")}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {selectedBooking.type === "flight" && (
                  <>
                    <div>
                      <label>Номер рейса</label>
                      <p>
                        {selectedBooking.flightNumber ||
                          selectedBooking.flightDetails?.departureFlight
                            ?.flight_number ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <label>Пункт отправления</label>
                      <p>
                        {selectedBooking.departure ||
                          selectedBooking.flightDetails?.departureFlight
                            ?.departure ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <label>Пункт назначения</label>
                      <p>
                        {selectedBooking.arrival ||
                          selectedBooking.flightDetails?.departureFlight
                            ?.arrival ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <label>Дата рейса</label>
                      <p>
                        {selectedBooking.departureDate ||
                          selectedBooking.departure_date ||
                          selectedBooking.flightDetails?.departureFlight?.date ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <label>Время рейса</label>
                      <p>
                        {selectedBooking.flightTime ||
                          selectedBooking.flightDetails?.departureFlight
                            ?.departure_time ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <label>Количество пассажиров</label>
                      <p>{getPassengerText(selectedBooking)}</p>
                    </div>

                    <div>
                      <label>Время оплаты</label>
                      <p>{selectedBooking.paidAt || "-"}</p>
                    </div>

                    {selectedBooking.returnFlightNumber && (
                      <>
                        <div>
                          <label>Номер обратного рейса</label>
                          <p>{selectedBooking.returnFlightNumber}</p>
                        </div>

                        <div>
                          <label>Дата обратного рейса</label>
                          <p>{selectedBooking.returnDate || "-"}</p>
                        </div>

                        <div>
                          <label>Время обратного рейса</label>
                          <p>{selectedBooking.returnFlightTime || "-"}</p>
                        </div>
                      </>
                    )}

                    {selectedBooking.ticketType && (
                      <div>
                        <label>Тип билета</label>
                        <p>{selectedBooking.ticketType.name}</p>
                      </div>
                    )}

                    {selectedBooking.flightEssentials && (
                      <div>
                        <label>Дополнительные услуги</label>
                        <p>
                          {[
                            selectedBooking.flightEssentials.baggage
                              ? "Багаж"
                              : "",
                            selectedBooking.flightEssentials.seat
                              ? "Выбор места"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(", ") || "Нет"}
                        </p>
                      </div>
                    )}

                    <div>
                      <label>Время создания</label>
                      <p>{selectedBooking.createdAt || "-"}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="booking-detail-actions">
              <button
                type="button"
                className="booking-detail-secondary"
                onClick={() => setSelectedBooking(null)}
              >
                Закрыть
              </button>

              {normalizeStatus(selectedBooking.status) !== "paid" && (
                <button
                  type="button"
                  className="mb-pay-btn"
                  onClick={() => handleRepay(selectedBooking)}
                  disabled={
                    normalizeStatus(selectedBooking.status) === "cancelled"
                  }
                >
                  Оплатить снова
                </button>
              )}

              {normalizeStatus(selectedBooking.status) === "paid" ? (
                <button
                  type="button"
                  className="mb-cancel-btn"
                  onClick={() => handleRefundRequest(selectedBooking)}
                >
                  Запросить возврат
                </button>
              ) : (
                <button
                  type="button"
                  className="mb-cancel-btn"
                  onClick={() =>
                    handleCancelBooking(
                      selectedBooking.orderId || selectedBooking.id
                    )
                  }
                  disabled={
                    normalizeStatus(selectedBooking.status) === "cancelled"
                  }
                >
                  Отменить бронирование
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;