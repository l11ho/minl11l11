import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderIdFromUrl =
    searchParams.get('order_id') ||
    searchParams.get('orderId') ||
    searchParams.get('session_order_id');

  const typeFromUrl = searchParams.get('type');

  const [displayOrderId, setDisplayOrderId] = useState('');

  useEffect(() => {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const myBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
    const latestOrderId = localStorage.getItem('latestOrderId');

    const isValidOrderId =
      orderIdFromUrl &&
      orderIdFromUrl !== '{order_id}' &&
      orderIdFromUrl !== 'undefined' &&
      orderIdFromUrl !== 'null';

    const finalOrderId = isValidOrderId ? orderIdFromUrl : latestOrderId;

    if (!finalOrderId) {
      setDisplayOrderId('Код заказа не найден');
      return;
    }

    const updateList = (list) => {
      let found = false;

      const updated = list.map((booking) => {
        const sameOrder =
          booking.orderId === finalOrderId ||
          String(booking.id) === String(finalOrderId);

        if (!sameOrder) return booking;

        found = true;

        return {
          ...booking,
          orderId: booking.orderId || finalOrderId,
          id: booking.id || finalOrderId,
          status: 'paid',
          paymentStatus: 'paid',
          paidAt: new Date().toLocaleString('vi-VN'),
        };
      });

      return { updated, found };
    };

    const bookingsResult = updateList(bookings);
    const myBookingsResult = updateList(myBookings);

    let finalBookings = bookingsResult.updated;
    let finalMyBookings = myBookingsResult.updated;

    const found = bookingsResult.found || myBookingsResult.found;

    if (!found) {
      const fallbackBooking = {
        id: finalOrderId,
        orderId: finalOrderId,
        type: typeFromUrl || 'flight',
        itemName: finalOrderId,
        status: 'paid',
        paymentStatus: 'paid',
        createdAt: new Date().toLocaleString('vi-VN'),
        paidAt: new Date().toLocaleString('vi-VN'),
      };

      finalBookings = [...finalBookings, fallbackBooking];
      finalMyBookings = [...finalMyBookings, fallbackBooking];
    }

    localStorage.setItem('bookings', JSON.stringify(finalBookings));
    localStorage.setItem('myBookings', JSON.stringify(finalMyBookings));

    setDisplayOrderId(finalOrderId);
  }, [orderIdFromUrl, typeFromUrl]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '760px',
          background: '#fff',
          borderRadius: '26px',
          padding: '56px 48px',
          textAlign: 'center',
          boxShadow: '0 18px 50px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            background: '#22c55e',
            color: '#fff',
            fontSize: '64px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto 30px',
          }}
        >
          ✓
        </div>

        <h1
          style={{
            fontSize: '42px',
            fontWeight: '900',
            marginBottom: '22px',
            color: '#07152f',
          }}
        >
          Оплата прошла успешно!
        </h1>

        <p
          style={{
            fontSize: '20px',
            color: '#4b5563',
            marginBottom: '12px',
          }}
        >
          Ваш код заказа:
        </p>

        <div
          style={{
            fontSize: '30px',
            color: '#2563eb',
            fontWeight: '900',
            marginBottom: '36px',
            wordBreak: 'break-word',
          }}
        >
          {displayOrderId}
        </div>

        <button
          onClick={() => navigate('/my-bookings')}
          style={{
            width: '100%',
            padding: '18px',
            border: 'none',
            borderRadius: '16px',
            background: '#0ea5ff',
            color: '#fff',
            fontSize: '22px',
            fontWeight: '900',
            cursor: 'pointer',
          }}
        >
          Посмотреть мои бронирования
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;