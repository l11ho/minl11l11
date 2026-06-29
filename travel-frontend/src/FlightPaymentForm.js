import React, { useState } from 'react';

const FlightPaymentForm = () => {
  const [loading, setLoading] = useState(false);

  // Thông tin vé máy bay (có thể lấy từ state hoặc props)
  const flight = {
    flightNumber: 'VN123',
    price: 100,  // Giá vé
    currency: 'usd',
    departure: 'SGN',
    arrival: 'HAN',
    date: '2026-03-20',
    airline: 'Vietnam Airlines'
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Gửi yêu cầu POST tới API backend của bạn
      const response = await fetch("http://127.0.0.1:8000/api/payment/create-flight-checkout-session/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flight_number: flight.flightNumber,
          amount: flight.price,
          currency: flight.currency,
          departure: flight.departure,
          arrival: flight.arrival,
          date: flight.date,
          airline: flight.airline,
        }),
      });

      // Chuyển đổi phản hồi JSON
      const data = await response.json();

      // Kiểm tra nếu URL từ Stripe trả về và chuyển hướng người dùng đến trang thanh toán
      if (data.url) {
        window.location.href = data.url;  // Chuyển hướng đến trang Stripe Checkout
      } else {
        alert("Ошибка при создании платежной сессии.");
      }
    } catch (error) {
      console.error("Ошибка оплаты:", error);
      alert("Произошла ошибка при создании платежной сессии.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flight-payment-form">
      <h2>Оплата авиабилетов</h2>
      <p><strong>Рейс:</strong> {flight.flightNumber}</p>
      <p><strong>Авиакомпания:</strong> {flight.airline}</p>
      <p><strong>Пункт вылета:</strong> {flight.departure}</p>
      <p><strong>Пункт назначения:</strong> {flight.arrival}</p>
      <p><strong>Дата вылета:</strong> {flight.date}</p>
      <p><strong>Стоимость билета:</strong> {flight.price} USD</p>

      <button onClick={handlePayment} disabled={loading}>
        {loading ? "Перенаправлление..." : "Оплата авиабилетов"}
      </button>
    </div>
  );
};

export default FlightPaymentForm;