import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './pages/PassengerInfo.css';

const ESSENTIAL_PRICES = {
  baggage: 3.81,
  seat: 3.67,
};

const formatTime = (time) => {
  if (!time) return '--:--';
  return String(time).slice(0, 5);
};

const formatDateDisplay = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatPrice = (price, currency = 'USD') => {
  const number = Number(price || 0);

  if (currency === 'EUR') {
    return `€ ${number.toFixed(2)}`;
  }

  if (currency === 'VND') {
    return `${number.toLocaleString('vi-VN')} VND`;
  }

  return `$ ${number.toFixed(2)}`;
};

const getFlightDisplay = (flight) => {
  if (!flight) return null;

  return {
    airline: flight.airline || 'Airline',
    flightNumber: flight.flight_number || flight.flightNumber || '',
    departure: flight.departure || flight.from || flight.departure_airport || '',
    arrival: flight.arrival || flight.to || flight.arrival_airport || '',
    date: flight.date || flight.departure_date || '',
    departureTime:
      flight.departure_time ||
      flight.departureTime ||
      flight.flight_time ||
      '--:--',
    arrivalTime:
      flight.arrival_time ||
      flight.arrivalTime ||
      flight.arrive_time ||
      '--:--',
    duration: flight.duration || '1h 50m',
    baggage: flight.baggage || '15kg',
    price: Number(flight.price || 0),
    currency: flight.currency || 'USD',
  };
};

const PassengerInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchInfo = location.state?.searchInfo || {};
  const departureFlight =
    location.state?.departureFlight || location.state?.flight;
  const returnFlight = location.state?.returnFlight || null;
  const ticketType = location.state?.ticketType || null;
  const totalPrice = Number(location.state?.totalPrice || 0);

  const departureInfo = useMemo(
    () => getFlightDisplay(departureFlight),
    [departureFlight]
  );

  const returnInfo = useMemo(
    () => getFlightDisplay(returnFlight),
    [returnFlight]
  );

  const [contactForm, setContactForm] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
  });

  const [travelerForm, setTravelerForm] = useState({
    gender: '',
    firstMiddleName: '',
    lastName: '',
    noLastName: false,
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    nationality: '',
    frequentFlyer: false,
  });

  const [selectedEssentials, setSelectedEssentials] = useState({
    baggage: false,
    seat: false,
  });

  const isRoundTrip =
    searchInfo.tripType === 'roundtrip' && Boolean(searchInfo.returnDate);

  const essentialsTotal = useMemo(() => {
    let total = 0;

    if (selectedEssentials.baggage) {
      total += ESSENTIAL_PRICES.baggage;
    }

    if (selectedEssentials.seat) {
      total += ESSENTIAL_PRICES.seat;
    }

    return total;
  }, [selectedEssentials]);

  const finalPrice = useMemo(() => {
    return Number(totalPrice || 0) + essentialsTotal;
  }, [totalPrice, essentialsTotal]);

  const handleContactChange = (field, value) => {
    setContactForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTravelerChange = (field, value) => {
    setTravelerForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleEssential = (type) => {
    setSelectedEssentials((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleContinueToPayment = () => {
    navigate('/payment', {
      state: {
        searchInfo,
        departureFlight,
        returnFlight,
        ticketType,
        contactForm,
        travelerForm,
        flightEssentials: selectedEssentials,
        essentialsTotal,
        totalPrice: finalPrice,
      },
    });
  };

  if (!departureInfo) {
    return (
      <div className="pi-empty-page">
        <h2>No flight selected</h2>
        <p>Please go back and choose your flight first.</p>
        <button onClick={() => navigate('/flight-result')}>
          Back to flight results
        </button>
      </div>
    );
  }

  return (
    <div className="pi-page">
      <header className="pi-topbar">
        <div className="pi-topbar-inner">
          <Link to="/" className="pi-logo">
            BestPrice<span>✈</span>
          </Link>

          <div className="pi-progress">
            <div className="pi-progress-step active">
              <span className="pi-step-dot">1</span>
              <div>
                <strong>Your trip details</strong>
              </div>
            </div>

            <div className="pi-progress-line"></div>

            <div className="pi-progress-step">
              <span className="pi-step-dot">2</span>
              <div>
                <strong>Payment</strong>
                <p>Flight Essentials</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pi-main">
        <section className="pi-left">
          <div className="pi-card">
            <div className="pi-card-title">
              Contact Details (for E-ticket/Voucher)
            </div>

            <div className="pi-form-group">
              <label>Full Name*</label>
              <input
                type="text"
                value={contactForm.fullName}
                onChange={(e) =>
                  handleContactChange('fullName', e.target.value)
                }
              />
              <small>
                As on ID Card/passport/driving license (without degree or
                special characters)
              </small>
            </div>

            <div className="pi-grid-2">
              <div className="pi-form-group">
                <label>Mobile Number*</label>
                <input
                  type="text"
                  value={contactForm.mobileNumber}
                  onChange={(e) =>
                    handleContactChange('mobileNumber', e.target.value)
                  }
                />
                <small>
                  Input phone number without the selected country/region code
                </small>
              </div>

              <div className="pi-form-group">
                <label>Email*</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) =>
                    handleContactChange('email', e.target.value)
                  }
                />
                <small>e.g. email@example.com</small>
              </div>
            </div>
          </div>

          <div className="pi-card">
            <div className="pi-card-title">Traveler Details</div>
            <div className="pi-subtitle">Adult 1</div>

            <div className="pi-alert">
              <strong>⚠ Please pay attention to the following:</strong>
              <p>
                The name has to match the passport. If the spelling or order is
                wrong, the airline may refuse you to board or charge fees for
                name change.
              </p>
            </div>

            <div className="pi-grid-3">
              <div className="pi-form-group">
                <label>Gender*</label>
                <select
                  value={travelerForm.gender}
                  onChange={(e) =>
                    handleTravelerChange('gender', e.target.value)
                  }
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="pi-grid-2">
              <div className="pi-form-group">
                <label>First & Middle Name*</label>
                <input
                  type="text"
                  placeholder="ex: JOHN MICHAEL"
                  value={travelerForm.firstMiddleName}
                  onChange={(e) =>
                    handleTravelerChange('firstMiddleName', e.target.value)
                  }
                />
                <small>(without title and punctuation)</small>
              </div>

              <div className="pi-form-group">
                <label>Last / Family Name*</label>
                <input
                  type="text"
                  placeholder="ex: DOE"
                  value={travelerForm.lastName}
                  onChange={(e) =>
                    handleTravelerChange('lastName', e.target.value)
                  }
                  disabled={travelerForm.noLastName}
                />
                <small>(without title and punctuation)</small>
              </div>
            </div>

            <label className="pi-checkbox">
              <input
                type="checkbox"
                checked={travelerForm.noLastName}
                onChange={(e) =>
                  handleTravelerChange('noLastName', e.target.checked)
                }
              />
              This passenger has no last name (surname)
            </label>

            <div className="pi-grid-birth">
              <div className="pi-form-group">
                <label>Date of Birth*</label>
                <div className="pi-birth-row">
                  <input
                    type="text"
                    placeholder="DD"
                    value={travelerForm.birthDay}
                    onChange={(e) =>
                      handleTravelerChange('birthDay', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="MMMM"
                    value={travelerForm.birthMonth}
                    onChange={(e) =>
                      handleTravelerChange('birthMonth', e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="YYYY"
                    value={travelerForm.birthYear}
                    onChange={(e) =>
                      handleTravelerChange('birthYear', e.target.value)
                    }
                  />
                </div>
                <small>adultTitle</small>
              </div>

              <div className="pi-form-group">
                <label>Nationality*</label>
                <select
                  value={travelerForm.nationality}
                  onChange={(e) =>
                    handleTravelerChange('nationality', e.target.value)
                  }
                >
                  <option value="">Select nationality</option>
                  <option value="Vietnamese">Vietnamese</option>
                  <option value="German">German</option>
                  <option value="French">French</option>
                  <option value="Italian">Italian</option>
                  <option value="American">American</option>
                </select>
              </div>
            </div>

            <label className="pi-checkbox">
              <input
                type="checkbox"
                checked={travelerForm.frequentFlyer}
                onChange={(e) =>
                  handleTravelerChange('frequentFlyer', e.target.checked)
                }
              />
              Add Frequent Flyer Account
            </label>
          </div>

          <div className="pi-card pi-essentials-card">
            <div className="pi-essentials-header">Flight Essentials</div>

            <div className="pi-essential-box">
              <div className="pi-essential-icon">🧳</div>

              <div className="pi-essential-content">
                <h4>Baggage</h4>
                <p>
                  You can bring 15 kg baggage per passenger. Need more? Tap
                  here.
                </p>

                <div className="pi-baggage-grid">
                  <div className="pi-baggage-option">
                    <strong>
                      1. {departureInfo.departure} → {departureInfo.arrival}
                    </strong>
                    <span>Cabin 7kg/pax</span>
                    <span>15kg/pax</span>
                  </div>

                  {isRoundTrip && returnInfo && (
                    <div className="pi-baggage-option">
                      <strong>
                        2. {returnInfo.departure} → {returnInfo.arrival}
                      </strong>
                      <span>Cabin 7kg/pax</span>
                      <span>15kg/pax</span>
                    </div>
                  )}
                </div>

                <div className="pi-essential-footer">
                  <span>
                    {selectedEssentials.baggage ? 'Added' : 'From'} € 3.81
                  </span>

                  <button
                    type="button"
                    className={selectedEssentials.baggage ? 'selected' : ''}
                    onClick={() => handleToggleEssential('baggage')}
                  >
                    {selectedEssentials.baggage ? 'Selected ✓' : 'Select ›'}
                  </button>
                </div>
              </div>
            </div>

            <div className="pi-essential-box">
              <div className="pi-essential-icon">💺</div>

              <div className="pi-essential-content">
                <h4>Seat Number</h4>
                <p>Don't want middle seat? Secure your seat now!</p>

                <div className="pi-essential-footer">
                  <span>
                    {selectedEssentials.seat ? 'Added' : 'From'} € 3.67
                  </span>

                  <button
                    type="button"
                    className={selectedEssentials.seat ? 'selected' : ''}
                    onClick={() => handleToggleEssential('seat')}
                  >
                    {selectedEssentials.seat ? 'Selected ✓' : 'Select ›'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pi-submit-row">
            <button
              type="button"
              className="pi-submit-btn"
              onClick={handleContinueToPayment}
            >
              Continue to Payment
            </button>
          </div>
        </section>

        <aside className="pi-right">
          <div className="pi-card">
            <div className="pi-side-title-row">
              <h3>Flight Summary</h3>
              <button type="button">Details</button>
            </div>

            <div className="pi-flight-summary-card">
              <div className="pi-flight-tag">Depart</div>

              <div className="pi-flight-route-row">
                <div>
                  <strong>
                    {departureInfo.departure} ({departureInfo.departure})
                  </strong>
                  <p>{formatDateDisplay(departureInfo.date)}</p>
                  <span>{formatTime(departureInfo.departureTime)}</span>
                </div>

                <div className="pi-flight-mid">
                  <span>{departureInfo.duration}</span>
                  <div className="pi-line"></div>
                  <small>Direct</small>
                </div>

                <div className="pi-flight-arrive">
                  <strong>
                    {departureInfo.arrival} ({departureInfo.arrival})
                  </strong>
                  <p>{formatDateDisplay(departureInfo.date)}</p>
                  <span>{formatTime(departureInfo.arrivalTime)}</span>
                </div>
              </div>

              <div className="pi-flight-extra">
                <p>
                  {departureInfo.airline}
                  {departureInfo.flightNumber
                    ? ` | ${departureInfo.flightNumber}`
                    : ''}
                </p>
                <p>
                  {ticketType?.name || searchInfo.cabinClass || 'Economy'}
                </p>
              </div>

              <div className="pi-summary-badges">
                <span>Reschedule Not Available</span>
                <span className="green">Refundable</span>
              </div>
            </div>

            {isRoundTrip && returnInfo && (
              <div className="pi-flight-summary-card">
                <div className="pi-flight-tag return">Return</div>

                <div className="pi-flight-route-row">
                  <div>
                    <strong>
                      {returnInfo.departure} ({returnInfo.departure})
                    </strong>
                    <p>{formatDateDisplay(returnInfo.date)}</p>
                    <span>{formatTime(returnInfo.departureTime)}</span>
                  </div>

                  <div className="pi-flight-mid">
                    <span>{returnInfo.duration}</span>
                    <div className="pi-line"></div>
                    <small>Direct</small>
                  </div>

                  <div className="pi-flight-arrive">
                    <strong>
                      {returnInfo.arrival} ({returnInfo.arrival})
                    </strong>
                    <p>{formatDateDisplay(returnInfo.date)}</p>
                    <span>{formatTime(returnInfo.arrivalTime)}</span>
                  </div>
                </div>

                <div className="pi-flight-extra">
                  <p>
                    {returnInfo.airline}
                    {returnInfo.flightNumber
                      ? ` | ${returnInfo.flightNumber}`
                      : ''}
                  </p>
                  <p>
                    {ticketType?.name || searchInfo.cabinClass || 'Economy'}
                  </p>
                </div>

                <div className="pi-summary-badges">
                  <span className="green">Reschedule Available</span>
                  <span>Non-Refundable</span>
                </div>
              </div>
            )}
          </div>

          <div className="pi-card">
            <h3 className="pi-side-title">Price Details</h3>

            <div className="pi-price-row">
              <span>Base flight price</span>
              <strong>
                {formatPrice(totalPrice, departureInfo.currency || 'USD')}
              </strong>
            </div>

            {selectedEssentials.baggage && (
              <div className="pi-price-row">
                <span>Baggage</span>
                <strong>
                  + {formatPrice(ESSENTIAL_PRICES.baggage, 'EUR')}
                </strong>
              </div>
            )}

            {selectedEssentials.seat && (
              <div className="pi-price-row">
                <span>Seat Number</span>
                <strong>
                  + {formatPrice(ESSENTIAL_PRICES.seat, 'EUR')}
                </strong>
              </div>
            )}

            <div className="pi-price-row total">
              <span>Price you pay</span>
              <strong>
                {formatPrice(finalPrice, departureInfo.currency || 'USD')}
              </strong>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default PassengerInfo;