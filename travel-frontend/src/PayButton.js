import React, { useState } from 'react';

function PayButton({ product_name, amount, currency }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      let orderId = localStorage.getItem('latestOrderId');
      if (!orderId) {
        orderId = `DH${Date.now()}`;
        localStorage.setItem('latestOrderId', orderId);
      }

      const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

      const matchedBooking =
        [...bookings]
          .reverse()
          .find(
            (booking) =>
              booking.type === 'tour' &&
              booking.itemName === product_name &&
              booking.status === 'Ожидает оплаты'
          ) || {};

      const response = await fetch('http://127.0.0.1:8000/api/payment/create-checkout-session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_name,
          amount,
          currency,
          order_id: orderId,
          booking_type: 'tour',
          customer_name: matchedBooking.fullName || currentUser.fullName || '',
          customer_phone: matchedBooking.phone || '',
          customer_email:
            matchedBooking.customerEmail || matchedBooking.userEmail || currentUser.email || '',
          created_at: matchedBooking.createdAt || new Date().toLocaleString(),
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Ошибка при создании сеанса оплаты.');
      }
    } catch (error) {
      console.error('Ошибка оплаты:', error);
      alert('Произошла ошибка при создании сеанса оплаты.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Переход...' : 'Оплатить'}
      </button>
    </div>
  );
}

export default PayButton;