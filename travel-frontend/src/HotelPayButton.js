import React from 'react';

const HotelPayButton = ({
  hotel_id,
  hotel_name,
  price,
  currency,
  check_in,
  check_out,
  guests,
  customer_name,
  customer_dob,
  customer_phone,
  customer_email,
  hotel_data,
}) => {
  const availableRooms = hotel_data?.availableRooms ?? 10;

  const handleCheckout = async () => {
    try {
      if (availableRooms <= 0) {
        alert('Свободных номеров больше нет.');
        return;
      }

      let generatedOrderId = localStorage.getItem('latestOrderId');
      if (!generatedOrderId) {
        generatedOrderId = `DH${Date.now()}`;
        localStorage.setItem('latestOrderId', generatedOrderId);
      }

      const response = await fetch(
        'http://127.0.0.1:8000/api/payment/create-hotel-checkout-session/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hotel_id,
            hotel_name,
            price,
            currency,
            check_in,
            check_out,
            guests,
            customer_name,
            customer_dob,
            customer_phone,
            customer_email,
            order_id: generatedOrderId,
            booking_type: 'hotel',
            created_at: new Date().toLocaleString(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Не удалось создать платежную сессию для отеля.'
        );
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Сервер не вернул URL для оплаты через Stripe.');
      }
    } catch (error) {
      console.error('Hotel payment error:', error);
      alert(error.message || 'Произошла ошибка при оплате отеля.');
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={availableRooms <= 0}
      style={{
        width: '100%',
        padding: '16px',
        border: 'none',
        borderRadius: '12px',
        background: availableRooms <= 0 ? '#9ca3af' : '#c96f0d',
        color: '#fff',
        fontSize: '18px',
        fontWeight: '700',
        cursor: availableRooms <= 0 ? 'not-allowed' : 'pointer',
      }}
    >
      {availableRooms <= 0 ? 'Нет свободных номеров' : 'Оплата отеля'}
    </button>
  );
};

export default HotelPayButton;