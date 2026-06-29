import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const FlightBooking = () => {
  const [fromAirport, setFromAirport] = useState('');
  const [toAirport, setToAirport] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [tripType, setTripType] = useState('oneway');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fromAirport || !toAirport || !departureDate) {
      alert('Пожалуйста заполните все данные о рейсе.');
      return;
    }

    if (fromAirport === toAirport) {
      alert('Аэропорт вылета и аэропорт прилета не должны совпадать.');
      return;
    }

    if (tripType === 'roundtrip' && !returnDate) {
      alert('Выберите дату обратного вылета для рейса туда-обратно.');
      return;
    }

    navigate('/flight-result', {
      state: {
        searchInfo: {
          fromAirport,
          toAirport,
          departureDate,
          returnDate: tripType === 'roundtrip' ? returnDate : '',
          passengers: Number(passengers),
          tripType,
        },
      },
    });
  };

  return (
    <div className="flight-booking">
      <h2>Бронирование авиабилетов</h2>

      <form onSubmit={handleSubmit} className="flight-form">
        <div>
          <label>Аэропорт вылета</label>
          <select
            value={fromAirport}
            onChange={(e) => setFromAirport(e.target.value)}
            required
          >
            <option value="">Выберите аэропорт вылета</option>
            <option value="SGN">TP.HCM - Tân Sơn Nhất (SGN)</option>
            <option value="HAN">Hà Nội - Nội Bài (HAN)</option>
            <option value="DAD">Đà Nẵng (DAD)</option>
            <option value="CXR">Nha Trang - Cam Ranh (CXR)</option>
          </select>
        </div>

        <div>
          <label>Аэропорт вылета</label>
          <select
            value={toAirport}
            onChange={(e) => setToAirport(e.target.value)}
            required
          >
            <option value="">Выберите аэропорт вылета</option>
            <option value="SGN">TP.HCM - Tân Sơn Nhất (SGN)</option>
            <option value="HAN">Hà Nội - Nội Bài (HAN)</option>
            <option value="DAD">Đà Nẵng (DAD)</option>
            <option value="CXR">Nha Trang - Cam Ranh (CXR)</option>
          </select>
        </div>

        <div>
          <label>Дата вылета</label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            required
          />
        </div>

        {tripType === 'roundtrip' && (
          <div>
            <label>Дата обратно вылета</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required={tripType === 'roundtrip'}
            />
          </div>
        )}

        <div>
          <label>Количество пассажиров</label>
          <input
            type="number"
            min="1"
            value={passengers}
            onChange={(e) => setPassengers(e.target.value)}
            required
          />
        </div>

        <div>
          <label>
            <input
              type="radio"
              value="oneway"
              checked={tripType === 'oneway'}
              onChange={() => setTripType('oneway')}
            />
            В одну сторону
          </label>

          <label style={{ marginLeft: '16px' }}>
            <input
              type="radio"
              value="roundtrip"
              checked={tripType === 'roundtrip'}
              onChange={() => setTripType('roundtrip')}
            />
            Туда и обратно
          </label>
        </div>

        <button type="submit">Найти рейсы</button>
      </form>
    </div>
  );
};

export default FlightBooking;