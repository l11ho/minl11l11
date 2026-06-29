import React, { useState } from 'react';

function FlightPayButton({ flight_number, price, currency, order_id }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const orderId =
        order_id ||
        localStorage.getItem('latestOrderId') ||
        `FLIGHT${Date.now()}`;

      localStorage.setItem('latestOrderId', orderId);

      const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
      const myBookings = JSON.parse(localStorage.getItem('myBookings')) || [];
      const allBookings = [...bookings, ...myBookings];

      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

      const matchedBooking =
        [...allBookings]
          .reverse()
          .find((booking) => {
            const sameOrder =
              booking.orderId === orderId || String(booking.id) === String(orderId);

            const isFlight = booking.type === 'flight';

            const sameFlight =
              booking.flightNumber === flight_number ||
              booking.itemName === flight_number ||
              String(booking.itemName || '').includes(flight_number) ||
              booking.flightDetails?.departureFlight?.flight_number === flight_number;

            const isPending =
              booking.status === 'pending' ||
              booking.status === 'Pending Payment' ||
              booking.status === 'Ожидает оплаты';

            return sameOrder && isFlight && sameFlight && isPending;
          }) || {};

      const searchInfo = matchedBooking.searchInfo || {};
      const flightDetails = matchedBooking.flightDetails || {};
      const departureFlight =
        flightDetails.departureFlight ||
        matchedBooking.departureFlight ||
        {};

      const response = await fetch(
        'http://127.0.0.1:8000/api/payment/create-flight-checkout-session/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            flight_number,
            price,
            currency,
            order_id: orderId,
            booking_type: 'flight',

            customer_name:
              matchedBooking.customerName ||
              matchedBooking.fullName ||
              matchedBooking.contactForm?.fullName ||
              currentUser.fullName ||
              '',

            customer_phone:
              matchedBooking.customerPhone ||
              matchedBooking.phone ||
              matchedBooking.contactForm?.mobileNumber ||
              '',

            customer_email:
              matchedBooking.customerEmail ||
              matchedBooking.email ||
              matchedBooking.userEmail ||
              matchedBooking.contactForm?.email ||
              currentUser.email ||
              '',

            customer_dob: matchedBooking.dateOfBirth || '',
            gender: matchedBooking.travelerForm?.gender || '',
            created_at: matchedBooking.createdAt || new Date().toLocaleString('vi-VN'),

            departure:
              matchedBooking.departure ||
              departureFlight.departure ||
              searchInfo.fromAirport ||
              '',

            arrival:
              matchedBooking.arrival ||
              departureFlight.arrival ||
              searchInfo.toAirport ||
              '',

            departure_date:
              matchedBooking.departureDate ||
              departureFlight.date ||
              searchInfo.departureDate ||
              '',

            passengers:
              matchedBooking.passengers ||
              searchInfo.passengers ||
              `${searchInfo.adults || 1} adult(s), ${searchInfo.children || 0} child(ren), ${searchInfo.infants || 0} infant(s)`,

            flight_time:
              matchedBooking.flightTime ||
              departureFlight.departure_time ||
              departureFlight.flight_time ||
              '',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Không thể tạo phiên thanh toán vé máy bay.'
        );
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Server không trả về link thanh toán.');
      }
    } catch (error) {
      console.error('Lỗi thanh toán vé máy bay:', error);
      alert(error.message || 'Có lỗi khi thanh toán vé máy bay.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Đang chuyển hướng...' : 'Thanh toán vé máy bay'}
      </button>
    </div>
  );
}

export default FlightPayButton;