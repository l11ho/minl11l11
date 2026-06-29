import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PayButton from './PayButton';
import FlightPayButton from './FlightPayButton';
import HotelPayButton from './HotelPayButton';
import './pages/PaymentForm.css';

const PaymentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tour = location.state?.tour;
  const flight = location.state?.flight;
  const hotel = location.state?.hotel;
  const bookingInfo = location.state?.bookingInfo;
  const customerInfo = location.state?.customerInfo;
  const searchInfo = location.state?.searchInfo;

  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  const [fullName, setFullName] = useState(
    customerInfo?.fullName || currentUser?.fullName || ''
  );
  const [phone, setPhone] = useState(customerInfo?.phone || '');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(
    customerInfo?.dateOfBirth || ''
  );
  const [email, setEmail] = useState(
    customerInfo?.email || currentUser?.email || ''
  );

  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [smallChildCount, setSmallChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);

  const [singleRoom, setSingleRoom] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [note, setNote] = useState('');
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const [showTravelerModal, setShowTravelerModal] = useState(false);
  const [confirmedTravelerInfo, setConfirmedTravelerInfo] = useState(null);
  const [showCostDetail, setShowCostDetail] = useState(true);

  const [travelerInfo, setTravelerInfo] = useState({
    fullName: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    gender: 'Nam',
    phone: '',
  });

  const [modalSingleRoom, setModalSingleRoom] = useState(singleRoom);

  const USD_TO_VND_RATE = 24000;
  const singleRoomFeeUsd = 100;

  const itemType = useMemo(() => {
    if (tour) return 'tour';
    if (flight) return 'flight';
    if (hotel) return 'hotel';
    return '';
  }, [tour, flight, hotel]);

  const parseNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const cleaned = String(value).replace(/[^\d.]/g, '');
    return Number(cleaned || 0);
  };

  const convertVndToUsd = (value) => {
    const number = parseNumber(value);

    // Nếu backend đang lưu giá VND như 3290000 thì đổi sang USD
    if (number > 10000) {
      return Number((number / USD_TO_VND_RATE).toFixed(2));
    }

    // Nếu backend đã lưu giá USD như 250.00 thì giữ nguyên
    return number;
  };

  const formatCurrency = (value, currency = 'USD') => {
    const number = parseNumber(value);

    if (String(currency).toUpperCase() === 'USD') {
      return `$ ${number.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return `${number.toLocaleString('vi-VN')}đ`;
  };

  const getTourName = () => {
    return tour?.name || tour?.tour_name || tour?.title || 'Туристический тур';
  };

  const getTourImage = () => {
    return (
      tour?.image ||
      tour?.image_url ||
      tour?.thumbnail ||
      tour?.cover ||
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80'
    );
  };

  const getTourDestination = () => {
    return tour?.destination || tour?.to || tour?.city || tour?.location || '';
  };

  const getTourDeparture = () => {
    return tour?.departure || tour?.from || 'Ханой';
  };

  const getTourDuration = () => {
    return tour?.duration || tour?.trip_duration || tour?.days || '3 дня 2 ночи';
  };

  const getTourCode = () => {
    return (
      tour?.selectedDepartureCode ||
      bookingInfo?.departureCode ||
      tour?.program_code ||
      tour?.tour_code ||
      tour?.code ||
      'NDHAN150-036-150526XE-D'
    );
  };

  const getDepartureDate = () => {
    return (
      tour?.selectedDepartureDate ||
      bookingInfo?.departureDate ||
      tour?.departure_date ||
      ''
    );
  };

  const getCurrency = () => {
    if (tour) return 'USD';
    return tour?.currency || bookingInfo?.currency || 'USD';
  };

  const singleRoomFee = useMemo(() => {
    return singleRoomFeeUsd;
  }, []);

  const baseTourPrice = useMemo(() => {
    if (tour) {
      return convertVndToUsd(
        bookingInfo?.price || tour.price || tour.price_from || 0
      );
    }

    if (flight) return parseNumber(flight.price || 0);
    if (hotel) return parseNumber(hotel.price || 0);

    return 0;
  }, [tour, flight, hotel, bookingInfo]);

  const tourTotalPrice = useMemo(() => {
    if (!tour) return baseTourPrice;

    const adultPrice = baseTourPrice * adultCount;
    const childPrice = baseTourPrice * 0.7 * childCount;
    const smallChildPrice = baseTourPrice * 0.5 * smallChildCount;
    const infantPrice = 0 * infantCount;
    const roomFee = singleRoom ? singleRoomFee : 0;

    return Number(
      (
        adultPrice +
        childPrice +
        smallChildPrice +
        infantPrice +
        roomFee
      ).toFixed(2)
    );
  }, [
    tour,
    baseTourPrice,
    adultCount,
    childCount,
    smallChildCount,
    infantCount,
    singleRoom,
    singleRoomFee,
  ]);

  const contactInfoEnough = useMemo(() => {
    return Boolean(
      fullName.trim() && phone.trim() && email.trim() && address.trim()
    );
  }, [fullName, phone, email, address]);

  const canContinueTour =
    contactInfoEnough && agreePolicy && Boolean(confirmedTravelerInfo);

  const itemName = useMemo(() => {
    if (tour) return getTourName();
    if (flight) return flight.flight_number;
    if (hotel) return hotel.name;
    return '';
  }, [tour, flight, hotel]);

  const itemPrice = useMemo(() => {
    if (tour) return tourTotalPrice;
    if (flight) return flight.price;
    if (hotel) return hotel.price;
    return 0;
  }, [tour, flight, hotel, tourTotalPrice]);

  const changeCounter = (setter, currentValue, type) => {
    if (type === 'minus') {
      setter(Math.max(0, currentValue - 1));
      return;
    }

    setter(currentValue + 1);
  };

  const openTravelerModal = () => {
    if (confirmedTravelerInfo) {
      setTravelerInfo(confirmedTravelerInfo);
    }

    setModalSingleRoom(singleRoom);
    setShowTravelerModal(true);
  };

  const handleResetTravelerInfo = () => {
    setTravelerInfo({
      fullName: '',
      birthDay: '',
      birthMonth: '',
      birthYear: '',
      gender: 'Nam',
      phone: '',
    });

    setModalSingleRoom(singleRoom);
  };

  const handleConfirmTravelerInfo = () => {
    if (!travelerInfo.fullName.trim()) {
      alert('Пожалуйста, введите ФИО пассажира.');
      return;
    }

    if (
      !travelerInfo.birthDay.trim() ||
      !travelerInfo.birthMonth.trim() ||
      !travelerInfo.birthYear.trim()
    ) {
      alert('Пожалуйста, введите полную дату рождения.');
      return;
    }

    setConfirmedTravelerInfo(travelerInfo);
    setSingleRoom(modalSingleRoom);
    setShowTravelerModal(false);
  };

  const saveBookingToLocalStorage = () => {
    let currentOrderId = localStorage.getItem('latestOrderId');

    if (!currentOrderId) {
      currentOrderId = `${itemType.toUpperCase()}${Date.now()}`;
      localStorage.setItem('latestOrderId', currentOrderId);
    }

    const commonBooking = {
      id: currentOrderId,
      orderId: currentOrderId,
      type: itemType,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toLocaleString('vi-VN'),

      customerName: fullName,
      customerPhone: phone,
      customerEmail: email,
      customerInfo: {
        fullName,
        phone,
        email,
        address,
        dateOfBirth,
      },

      itemName,
      price: itemPrice,
      totalPrice: itemPrice,
      currency: getCurrency(),
    };

    let finalBooking = commonBooking;

    if (tour) {
      finalBooking = {
        ...commonBooking,
        type: 'tour',
        tourId: tour.id || tour.tour_id || null,
        tourName: getTourName(),
        title: getTourName(),
        image: getTourImage(),
        destination: getTourDestination(),
        departure: getTourDeparture(),
        duration: getTourDuration(),
        departureDate: getDepartureDate(),
        departureCode: getTourCode(),

        passengers: {
          adults: adultCount,
          children: childCount,
          smallChildren: smallChildCount,
          infants: infantCount,
        },

        travelerDetails: confirmedTravelerInfo
          ? [
              {
                type: 'adult',
                fullName: confirmedTravelerInfo.fullName,
                dateOfBirth: `${confirmedTravelerInfo.birthDay}/${confirmedTravelerInfo.birthMonth}/${confirmedTravelerInfo.birthYear}`,
                gender: confirmedTravelerInfo.gender,
                phone: confirmedTravelerInfo.phone,
                singleRoom,
              },
            ]
          : [],

        baseTourPrice,
        singleRoom,
        singleRoomFee: singleRoom ? singleRoomFee : 0,
        singleRoomFeeUsd: singleRoom ? singleRoomFeeUsd : 0,
        note,
        couponCode,
      };
    }

    if (flight) {
      finalBooking = {
        ...commonBooking,
        type: 'flight',
        flightNumber: flight.flight_number,
        flightId: flight.id || flight.flight_number,
        departure: flight.departure,
        arrival: flight.arrival,
        departureDate: flight.date,
        flightTime: flight.flight_time || flight.departure_time || '',
        passengers: searchInfo?.passengers || '',
        searchInfo: searchInfo || null,
        flight: flight,
      };
    }

    if (hotel) {
      finalBooking = {
        ...commonBooking,
        type: 'hotel',
        hotelId: hotel.id,
        hotelName: hotel.name,
        image: hotel.image,
        checkIn: bookingInfo?.checkIn,
        checkOut: bookingInfo?.checkOut,
        guests: bookingInfo?.guests,
        bookingInfo,
        hotel,
      };
    }

    const upsert = (storageKey) => {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const list = Array.isArray(saved) ? saved : [];

      const existingIndex = list.findIndex(
        (booking) =>
          booking.orderId === currentOrderId || booking.id === currentOrderId
      );

      if (existingIndex === -1) {
        localStorage.setItem(storageKey, JSON.stringify([...list, finalBooking]));
      } else {
        const updated = [...list];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...finalBooking,
        };
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
    };

    upsert('myBookings');
    upsert('bookings');

    return currentOrderId;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    if (hotel && (hotel.availableRooms ?? 10) <= 0) {
      alert('Нет свободных номеров.');
      return;
    }

    if (flight && (flight.availableSeats ?? 10) <= 0) {
      alert('Нет свободных мест.');
      return;
    }

    if (tour) {
      if (!contactInfoEnough) {
        alert('Пожалуйста, заполните всю контактную информацию.');
        return;
      }

      if (!confirmedTravelerInfo) {
        alert('Пожалуйста, введите информацию о пассажире.');
        return;
      }

      if (!agreePolicy) {
        alert(
          'Пожалуйста, согласитесь с политикой защиты персональных данных и условиями.'
        );
        return;
      }
    } else if (hotel) {
      if (!fullName || !dateOfBirth || !phone || !email) {
        alert('Пожалуйста, заполните всю информацию о клиенте.');
        return;
      }
    } else {
      if (!fullName || !phone || !address) {
        alert('Пожалуйста, заполните всю информацию.');
        return;
      }
    }

    saveBookingToLocalStorage();
    setIsFormValid(true);
  };

  if (!(tour || flight || hotel)) {
    return (
      <div className="booking-page">
        <div className="booking-empty">
          <p>Нет информации о бронировании. Пожалуйста, вернитесь назад и выберите услугу.</p>
          <button type="button" onClick={() => navigate('/')}>
            На главную
          </button>
        </div>
      </div>
    );
  }

  if (tour) {
    return (
      <div className="tour-payment-page">
        <header className="tour-payment-header">
          <div className="tour-payment-logo" onClick={() => navigate('/')}>
            BestPrice<span>✈</span>
          </div>

          <div className="tour-payment-steps">
            <div className="tour-step active">
              <span>1</span>
              Ввод данных
            </div>
            <div className="tour-step-line"></div>
            <div className={`tour-step ${isFormValid ? 'active' : ''}`}>
              <span>2</span>
              Оплата
            </div>
            <div className="tour-step-line"></div>
            <div className="tour-step">
              <span>3</span>
              Завершено
            </div>
          </div>
        </header>

        <main className="tour-payment-container">
          <section className="tour-payment-left">
            <div className="tour-payment-title">
              <h1>Бронирование тура</h1>
              <p>
                Пожалуйста, убедитесь, что вся информация на этой странице
                указана правильно перед переходом к оплате.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <section className="tour-form-card">
                <h2>Контактная информация</h2>

                <div className="tour-login-benefit">
                  <span>👤</span>
                  <strong>Войдите в аккаунт</strong>
                  <p>чтобы получать скидки, копить баллы и удобнее управлять заказами!</p>
                </div>

                <div className="tour-form-grid">
                  <label>
                    ФИО <span>(*)</span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Например: Nguyễn Văn A"
                    />
                  </label>

                  <label>
                    Телефон <span>(*)</span>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Например: 0901234567 / +84901234567"
                    />
                  </label>

                  <label>
                    Email <span>(*)</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Например: email@example.com"
                    />
                  </label>

                  <label>
                    Адрес <span>(*)</span>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Например: 190 Pasteur, район Xuân Hoà, г. Хошимин"
                    />
                  </label>
                </div>
              </section>

              <section className="tour-form-card">
                <h2>Пассажиры</h2>

                <div className="tour-passenger-grid">
                  <div className="tour-counter-item">
                    <div>
                      <strong>Взрослые</strong>
                      <p>От 12 лет и старше ⓘ</p>
                    </div>

                    <div className="tour-counter-control">
                      <button
                        type="button"
                        onClick={() =>
                          changeCounter(setAdultCount, adultCount, 'minus')
                        }
                      >
                        −
                      </button>
                      <span>{adultCount}</span>
                      <button
                        type="button"
                        onClick={() =>
                          changeCounter(setAdultCount, adultCount, 'plus')
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="tour-counter-item">
                    <div>
                      <strong>Дети</strong>
                      <p>От 5 до 11 лет ⓘ</p>
                    </div>

                    <div className="tour-counter-control">
                      <button
                        type="button"
                        onClick={() =>
                          changeCounter(setChildCount, childCount, 'minus')
                        }
                      >
                        −
                      </button>
                      <span>{childCount}</span>
                      <button
                        type="button"
                        onClick={() =>
                          changeCounter(setChildCount, childCount, 'plus')
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="tour-counter-item">
                    <div>
                      <strong>Маленькие дети</strong>
                      <p>От 2 до 4 лет ⓘ</p>
                    </div>

                    <div className="tour-counter-control">
                      <button
                        type="button"
                        onClick={() =>
                          changeCounter(
                            setSmallChildCount,
                            smallChildCount,
                            'minus'
                          )
                        }
                      >
                        −
                      </button>
                      <span>{smallChildCount}</span>
                      <button
                        type="button"
                        onClick={() =>
                          changeCounter(
                            setSmallChildCount,
                            smallChildCount,
                            'plus'
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="tour-counter-item">
                    <div>
                      <strong>Младенцы</strong>
                      <p>До 2 лет ⓘ</p>
                    </div>

                    <div className="tour-counter-control">
                      <button
                        type="button"
                        onClick={() =>
                          changeCounter(setInfantCount, infantCount, 'minus')
                        }
                      >
                        −
                      </button>
                      <span>{infantCount}</span>
                      <button
                        type="button"
                        onClick={() =>
                          changeCounter(setInfantCount, infantCount, 'plus')
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="tour-form-card">
                <h2>Информация о пассажире</h2>

                <div className="tour-traveler-title">
                  🧑‍🤝‍🧑 <strong>Взрослый</strong>
                  <span>От 12 лет и старше</span>
                </div>

                <p className="tour-single-room-note">
                  Одноместный номер доступен для клиентов от 12 лет и старше,
                  стоимость одноместного номера:{' '}
                  <strong>{formatCurrency(singleRoomFeeUsd, 'USD')} / номер</strong>
                </p>

                <div className="tour-traveler-row">
                  <span>#1</span>

                  <button
                    type="button"
                    className={`tour-traveler-input ${
                      confirmedTravelerInfo ? 'completed' : ''
                    }`}
                    onClick={openTravelerModal}
                  >
                    {confirmedTravelerInfo?.fullName || 'Взрослый (*)'}

                    <strong>
                      {confirmedTravelerInfo ? 'Заполнено ✓' : 'Ввести данные →'}
                    </strong>
                  </button>

                  <div className="tour-single-switch">
                    <span>Одноместный номер:</span>
                    <label>
                      <input
                        type="checkbox"
                        checked={singleRoom}
                        onChange={(e) => setSingleRoom(e.target.checked)}
                      />
                      <i></i>
                    </label>
                  </div>
                </div>
              </section>

              <section className="tour-form-card">
                <h2>Промокод</h2>

                <div className="tour-coupon-row">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Например: VIETRAVEL100"
                  />

                  <button type="button" disabled={!couponCode.trim()}>
                    Применить
                  </button>
                </div>
              </section>

              <section className="tour-form-card">
                <h2>Примечание</h2>
                <p>
                  Пожалуйста, сообщите нам, если у вас есть примечания или
                  особые пожелания.
                </p>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Например: вегетарианское питание, позднее прибытие, ..."
                ></textarea>
              </section>
            </form>
          </section>

          <aside className="tour-payment-right">
            <section className="tour-summary-card">
              <h2>Краткая информация о заказе</h2>

              <div className="tour-summary-main">
                <img src={getTourImage()} alt={getTourName()} />

                <div>
                  <h3>{getTourName()}</h3>
                  <p>
                    {getTourDuration()} • {getTourDestination()}
                  </p>
                  <span>🎫 {getTourCode()}</span>
                </div>
              </div>

              <div className="tour-summary-cost">
                <button
                  type="button"
                  onClick={() => setShowCostDetail(!showCostDetail)}
                >
                  💳 Детали стоимости
                  <span>{showCostDetail ? '⌃' : '⌄'}</span>
                </button>

                {showCostDetail && (
                  <div className="tour-cost-detail-list">
                    <div className="tour-cost-detail-row">
                      <span>Взрослые</span>
                      <strong>
                        {adultCount} × {formatCurrency(baseTourPrice, 'USD')}
                      </strong>
                    </div>

                    {childCount > 0 && (
                      <div className="tour-cost-detail-row">
                        <span>Дети</span>
                        <strong>
                          {childCount} ×{' '}
                          {formatCurrency(baseTourPrice * 0.7, 'USD')}
                        </strong>
                      </div>
                    )}

                    {smallChildCount > 0 && (
                      <div className="tour-cost-detail-row">
                        <span>Маленькие дети</span>
                        <strong>
                          {smallChildCount} ×{' '}
                          {formatCurrency(baseTourPrice * 0.5, 'USD')}
                        </strong>
                      </div>
                    )}

                    {singleRoom && (
                      <div className="tour-cost-detail-row">
                        <span>Доплата за одноместный номер</span>
                        <strong>
                          1 × {formatCurrency(singleRoomFeeUsd, 'USD')}
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="tour-total-card">
              <div className="tour-total-line">
                <strong>Итого</strong>
                <span>{formatCurrency(tourTotalPrice, 'USD')}</span>
              </div>

              <label className="tour-policy-check">
                <input
                  type="checkbox"
                  checked={agreePolicy}
                  onChange={(e) => setAgreePolicy(e.target.checked)}
                />
                <span>
                  Я согласен с{' '}
                  <strong>Политикой защиты персональных данных</strong> и{' '}
                  <strong>Условиями использования</strong>
                </span>
              </label>

              {!isFormValid ? (
                <button
                  type="button"
                  className={`tour-submit-btn ${canContinueTour ? 'ready' : ''}`}
                  disabled={!canContinueTour}
                  onClick={handleSubmit}
                >
                  {canContinueTour
                    ? 'Подтвердить и продолжить'
                    : 'Заполнены не все данные'}
                </button>
              ) : (
                <div className="tour-pay-button-wrap">
                  <PayButton
                    product_name={getTourName()}
                    amount={tourTotalPrice}
                    currency="usd"
                  />
                </div>
              )}
            </section>
          </aside>
        </main>

        {showTravelerModal && (
          <div className="tour-traveler-modal-overlay">
            <div className="tour-traveler-modal">
              <div className="tour-traveler-modal-header">
                <h2>Информация о пассажире</h2>

                <button
                  type="button"
                  onClick={() => setShowTravelerModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="tour-traveler-modal-note">
                Одноместный номер доступен для клиентов от 12 лет и старше,
                стоимость одноместного номера:{' '}
                <strong>{formatCurrency(singleRoomFeeUsd, 'USD')} / номер</strong>
              </div>

              <div className="tour-traveler-modal-body">
                <div className="tour-traveler-modal-title">
                  🧑‍🤝‍🧑 <strong>Взрослый</strong>
                  <span> Взрослый, рожденный до 14/05/2014</span>
                </div>

                <div className="tour-traveler-modal-form">
                  <div className="tour-modal-index">#1</div>

                  <label className="tour-modal-full">
                    ФИО <span>(*)</span>
                    <input
                      type="text"
                      value={travelerInfo.fullName}
                      onChange={(e) =>
                        setTravelerInfo({
                          ...travelerInfo,
                          fullName: e.target.value,
                        })
                      }
                      placeholder="Например: Nguyễn Văn A"
                    />
                    <small>Пожалуйста, введите ФИО</small>
                  </label>

                  <div className="tour-modal-grid">
                    <label>
                      Дата рождения <span>(*)</span>
                      <div className="tour-birthday-inputs">
                        <input
                          type="text"
                          value={travelerInfo.birthDay}
                          onChange={(e) =>
                            setTravelerInfo({
                              ...travelerInfo,
                              birthDay: e.target.value,
                            })
                          }
                          placeholder="dd"
                          maxLength="2"
                        />
                        <span>/</span>
                        <input
                          type="text"
                          value={travelerInfo.birthMonth}
                          onChange={(e) =>
                            setTravelerInfo({
                              ...travelerInfo,
                              birthMonth: e.target.value,
                            })
                          }
                          placeholder="mm"
                          maxLength="2"
                        />
                        <span>/</span>
                        <input
                          type="text"
                          value={travelerInfo.birthYear}
                          onChange={(e) =>
                            setTravelerInfo({
                              ...travelerInfo,
                              birthYear: e.target.value,
                            })
                          }
                          placeholder="yyyy"
                          maxLength="4"
                        />
                        <span className="tour-calendar-icon">📅</span>
                      </div>
                    </label>

                    <label>
                      Пол <span>(*)</span>
                      <select
                        value={travelerInfo.gender}
                        onChange={(e) =>
                          setTravelerInfo({
                            ...travelerInfo,
                            gender: e.target.value,
                          })
                        }
                      >
                        <option value="Nam">Мужской</option>
                        <option value="Nữ">Женский</option>
                        <option value="Khác">Другое</option>
                      </select>
                    </label>
                  </div>

                  <div className="tour-modal-phone-row">
                    <label>
                      Телефон
                      <input
                        type="text"
                        value={travelerInfo.phone}
                        onChange={(e) =>
                          setTravelerInfo({
                            ...travelerInfo,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Например: 0901234567 / +84901234567"
                      />
                    </label>

                    <div className="tour-modal-single-room">
                      <span>Одноместный номер</span>

                      <label>
                        <input
                          type="checkbox"
                          checked={modalSingleRoom}
                          onChange={(e) => setModalSingleRoom(e.target.checked)}
                        />
                        <i></i>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tour-traveler-modal-footer">
                <button
                  type="button"
                  className="tour-modal-reset-btn"
                  onClick={handleResetTravelerInfo}
                >
                  Сбросить
                </button>

                <button
                  type="button"
                  className="tour-modal-confirm-btn"
                  onClick={handleConfirmTravelerInfo}
                >
                  Подтвердить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Оплата {flight ? 'авиабилета' : 'отеля'}</h2>
        <p>Пожалуйста, подтвердите информацию перед оплатой</p>

        {hotel && (
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <p>
              <strong>Отель:</strong> {hotel.name}
            </p>
            <p>
              <strong>Место:</strong> {bookingInfo?.location}
            </p>
            <p>
              <strong>Дата заезда:</strong> {bookingInfo?.checkIn}
            </p>
            <p>
              <strong>Дата выезда:</strong> {bookingInfo?.checkOut}
            </p>
            <p>
              <strong>Количество гостей:</strong> {bookingInfo?.guests}
            </p>
            <p>
              <strong>Свободные номера:</strong> {hotel.availableRooms ?? 10}
            </p>
          </div>
        )}

        {flight && (
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
            <p>
              <strong>Номер рейса:</strong> {flight.flight_number}
            </p>
            <p>
              <strong>Авиакомпания:</strong> {flight.airline}
            </p>
            <p>
              <strong>Пункт отправления:</strong> {flight.departure}
            </p>
            <p>
              <strong>Пункт назначения:</strong> {flight.arrival}
            </p>
            <p>
              <strong>Дата рейса:</strong> {flight.date}
            </p>
            {flight.flight_time && (
              <p>
                <strong>Время рейса:</strong> {flight.flight_time}
              </p>
            )}
            {searchInfo?.passengers && (
              <p>
                <strong>Количество пассажиров:</strong> {searchInfo.passengers}
              </p>
            )}
            <p>
              <strong>Осталось мест:</strong> {flight.availableSeats ?? 10}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="ФИО"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            readOnly={!!hotel}
          />

          {hotel ? (
            <>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                readOnly
              />

              <input
                type="text"
                placeholder="Телефон"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                readOnly
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly
              />
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Телефон"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <input
                type="text"
                placeholder="Адрес"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </>
          )}

          <button type="submit">Подтвердить и продолжить</button>
        </form>

        {isFormValid && (
          <div style={{ marginTop: '20px' }}>
            {flight && (
              <FlightPayButton
                flight_number={flight.flight_number}
                price={flight.price}
                currency="usd"
              />
            )}

            {hotel && (
              <HotelPayButton
                hotel_id={hotel.id}
                hotel_name={hotel.name}
                price={hotel.price}
                currency="usd"
                check_in={bookingInfo?.checkIn}
                check_out={bookingInfo?.checkOut}
                guests={bookingInfo?.guests}
                customer_name={fullName}
                customer_dob={dateOfBirth}
                customer_phone={phone}
                customer_email={email}
                hotel_data={hotel}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;