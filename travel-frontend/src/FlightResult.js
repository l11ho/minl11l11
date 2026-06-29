import React, { useEffect, useMemo, useState } from 'react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import './pages/FlightResult.css';

const FLIGHT_API = 'http://127.0.0.1:8000/api/flights/';
const CURRENT_USER_API = 'http://127.0.0.1:8000/api/auth/me/';

const TICKET_TYPES = [
  {
    id: 'economy',
    name: 'Economy',
    addon: 0,
    cabinBaggage: '7 kg',
    checkedBaggage: '15 kg',
    refundable: false,
    reschedule: false,
    protection: false,
  },
  {
    id: 'economy_baggage_secure',
    name: 'Economy | Baggage Secure',
    addon: 0.8,
    cabinBaggage: '7 kg',
    checkedBaggage: '15 kg',
    refundable: false,
    reschedule: false,
    protection: true,
    recommended: true,
  },
  {
    id: 'economy_baggage_plus',
    name: 'Economy | Baggage+',
    addon: 14.65,
    cabinBaggage: '7 kg',
    checkedBaggage: '20 kg',
    refundable: false,
    reschedule: false,
    protection: false,
  },
];

const getValue = (object, keys, fallback = '') => {
  for (const key of keys) {
    const value = object?.[key];

    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }

  return fallback;
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const normalizeCode = (value) => String(value || '').trim().toUpperCase();

const normalizeDate = (value) => {
  if (!value) return '';
  return String(value).split('T')[0].trim();
};

const formatTime = (time) => {
  if (!time) return '--:--';
  return String(time).slice(0, 5);
};

const getStorageUser = () => {
  const possibleKeys = ['currentUser', 'user', 'authUser', 'profile'];

  for (const key of possibleKeys) {
    try {
      const value = localStorage.getItem(key);
      if (value) return JSON.parse(value);
    } catch {
      // Ignore invalid JSON
    }
  }

  return null;
};

const getAccessToken = () => {
  return (
    localStorage.getItem('accessToken') ||
    localStorage.getItem('access') ||
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    ''
  );
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

const priceNumber = (price) => {
  const cleaned = String(price || '0').replace(/[^\d.]/g, '');
  return Number(cleaned || 0);
};

const formatPrice = (price, currency = 'USD') => {
  const number = priceNumber(price);

  if (currency === 'EUR') {
    return `€ ${number.toFixed(2)}`;
  }

  if (currency === 'VND') {
    return `${number.toLocaleString('vi-VN')} VND`;
  }

  return `$ ${number.toFixed(2)}`;
};

const FlightResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const stateSearchInfo = location.state?.searchInfo || location.state || {};

  const searchInfo = useMemo(() => {
    return {
      fromAirport:
        searchParams.get('from') ||
        stateSearchInfo.fromAirport ||
        stateSearchInfo.from ||
        stateSearchInfo.departure ||
        '',
      toAirport:
        searchParams.get('to') ||
        stateSearchInfo.toAirport ||
        stateSearchInfo.to ||
        stateSearchInfo.arrival ||
        '',
      departureDate:
        searchParams.get('departureDate') ||
        stateSearchInfo.departureDate ||
        '',
      returnDate:
        searchParams.get('returnDate') ||
        stateSearchInfo.returnDate ||
        '',
      adults: Number(searchParams.get('adults') || stateSearchInfo.adults || 1),
      children: Number(
        searchParams.get('children') || stateSearchInfo.children || 0
      ),
      infants: Number(
        searchParams.get('infants') || stateSearchInfo.infants || 0
      ),
      cabinClass:
        searchParams.get('cabinClass') ||
        stateSearchInfo.cabinClass ||
        'Economy',
      tripType:
        searchParams.get('tripType') ||
        stateSearchInfo.tripType ||
        'roundtrip',
      directOnly:
        searchParams.get('directOnly') === 'true' ||
        stateSearchInfo.directOnly === true,
    };
  }, [searchParams, stateSearchInfo]);

  const isRoundTrip =
    searchInfo.tripType === 'roundtrip' && Boolean(searchInfo.returnDate);

  const totalPassengers =
    searchInfo.adults + searchInfo.children + searchInfo.infants;

  const [user, setUser] = useState(null);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sortMode, setSortMode] = useState('recommended');
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [directOnlyFilter, setDirectOnlyFilter] = useState(
    searchInfo.directOnly
  );

  const [selectionStep, setSelectionStep] = useState('departure');
  const [selectedDepartureFlight, setSelectedDepartureFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);

  const [drawerStep, setDrawerStep] = useState('review');
  const [selectedTicketType, setSelectedTicketType] = useState(null);

  useEffect(() => {
    setDirectOnlyFilter(searchInfo.directOnly);
  }, [searchInfo.directOnly]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const storedUser = getStorageUser();

      if (storedUser) {
        setUser(storedUser);
      }

      const token = getAccessToken();

      if (!token) {
        return;
      }

      try {
        const response = await fetch(CURRENT_USER_API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setUser(data);
      } catch {
        // Keep stored user if API is not ready
      }
    };

    loadCurrentUser();
  }, []);

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(FLIGHT_API);

        if (!response.ok) {
          throw new Error('Cannot load flights from API.');
        }

        const data = await response.json();

        const apiFlights = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : Array.isArray(data.data)
              ? data.data
              : [];

        const savedSeatData =
          JSON.parse(localStorage.getItem('flightSeatAvailability')) || {};

        const flightsWithSeats = apiFlights.map((flight) => {
          const flightKey = flight.id || flight.flight_number;

          return {
            ...flight,
            availableSeats:
              savedSeatData[flightKey] !== undefined
                ? savedSeatData[flightKey]
                : Number(flight.availableSeats || flight.available_seats || 10),
          };
        });

        setFlights(flightsWithSeats);
      } catch (err) {
        setError(err.message || 'Cannot load flights.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, []);

  const normalizedFlights = useMemo(() => {
    return flights.map((flight) => {
      const airline = getValue(flight, ['airline', 'airline_name'], 'Airline');

      const departureCity = getValue(flight, [
        'departure',
        'from',
        'origin',
        'departure_city',
      ]);

      const arrivalCity = getValue(flight, [
        'arrival',
        'to',
        'destination',
        'arrival_city',
      ]);

      const departureAirport = getValue(
        flight,
        ['departure_airport', 'from_airport', 'origin_airport'],
        departureCity
      );

      const arrivalAirport = getValue(
        flight,
        ['arrival_airport', 'to_airport', 'destination_airport'],
        arrivalCity
      );

      const departureDate = normalizeDate(
        getValue(flight, ['departure_date', 'date', 'flight_date'])
      );

      const departureTime = getValue(
        flight,
        [
          'departure_time',
          'departureTime',
          'flight_time',
          'flightTime',
          'depart_time',
          'departTime',
          'time',
          'start_time',
          'startTime',
        ],
        '--:--'
      );

      const arrivalTime = getValue(
        flight,
        [
          'arrival_time',
          'arrivalTime',
          'arrive_time',
          'arriveTime',
          'landing_time',
          'landingTime',
          'end_time',
          'endTime',
        ],
        '--:--'
      );

      const duration = getValue(
        flight,
        ['duration', 'flight_duration'],
        '1h 50m'
      );

      const transit = getValue(
        flight,
        ['transit', 'stop_type', 'stops'],
        'Direct'
      );

      const price = getValue(flight, ['price', 'ticket_price'], 0);
      const currency = getValue(flight, ['currency'], 'USD');
      const baggage = getValue(flight, ['baggage', 'luggage'], '20kg');

      const direct =
        Number(transit) === 0 ||
        normalizeText(transit).includes('direct') ||
        normalizeText(transit).includes('nonstop') ||
        normalizeText(transit) === '0';

      return {
        raw: flight,
        id: flight.id || flight.flight_number,
        flightNumber: getValue(flight, ['flight_number', 'code'], ''),
        airline,
        departureCity,
        arrivalCity,
        departureAirport,
        arrivalAirport,
        departureDate,
        departureTime,
        arrivalTime,
        duration,
        transit: direct ? 'Direct' : transit,
        direct,
        price,
        currency,
        baggage,
        availableSeats: flight.availableSeats,
      };
    });
  }, [flights]);

  const airlines = useMemo(() => {
    return [...new Set(normalizedFlights.map((flight) => flight.airline))];
  }, [normalizedFlights]);

  const matchLeg = (flight, fromCode, toCode, date) => {
    const flightFrom = normalizeCode(
      flight.departureAirport || flight.departureCity
    );

    const flightTo = normalizeCode(flight.arrivalAirport || flight.arrivalCity);

    const searchFrom = normalizeCode(fromCode);
    const searchTo = normalizeCode(toCode);
    const searchDate = normalizeDate(date);

    const matchesFrom = !searchFrom || flightFrom === searchFrom;
    const matchesTo = !searchTo || flightTo === searchTo;
    const matchesDate =
      !searchDate ||
      !flight.departureDate ||
      flight.departureDate === searchDate;

    return matchesFrom && matchesTo && matchesDate;
  };

  const applyCommonFiltersAndSort = (list) => {
    let result = [...list];

    if (selectedAirlines.length > 0) {
      result = result.filter((flight) =>
        selectedAirlines.includes(flight.airline)
      );
    }

    if (directOnlyFilter) {
      result = result.filter((flight) => flight.direct);
    }

    if (sortMode === 'price') {
      result = [...result].sort(
        (a, b) => priceNumber(a.price) - priceNumber(b.price)
      );
    }

    if (sortMode === 'duration') {
      result = [...result].sort((a, b) =>
        String(a.duration).localeCompare(String(b.duration))
      );
    }

    return result;
  };

  const departureFlights = useMemo(() => {
    const result = normalizedFlights.filter((flight) =>
      matchLeg(
        flight,
        searchInfo.fromAirport,
        searchInfo.toAirport,
        searchInfo.departureDate
      )
    );

    return applyCommonFiltersAndSort(result);
  }, [
    normalizedFlights,
    searchInfo,
    selectedAirlines,
    directOnlyFilter,
    sortMode,
  ]);

  const returnFlights = useMemo(() => {
    if (!isRoundTrip) return [];

    const result = normalizedFlights.filter((flight) =>
      matchLeg(
        flight,
        searchInfo.toAirport,
        searchInfo.fromAirport,
        searchInfo.returnDate
      )
    );

    return applyCommonFiltersAndSort(result);
  }, [
    normalizedFlights,
    isRoundTrip,
    searchInfo,
    selectedAirlines,
    directOnlyFilter,
    sortMode,
  ]);

  const displayedFlights = useMemo(() => {
    if (!isRoundTrip) return departureFlights;

    return selectionStep === 'departure' ? departureFlights : returnFlights;
  }, [isRoundTrip, selectionStep, departureFlights, returnFlights]);

  const cheapestFlight = displayedFlights[0];

  const canContinue = isRoundTrip
    ? selectedDepartureFlight && selectedReturnFlight
    : selectedDepartureFlight;

  const totalSelectedPrice =
    priceNumber(selectedDepartureFlight?.price || 0) +
    priceNumber(selectedReturnFlight?.price || 0);

  const shouldShowReviewPanel = Boolean(
    selectedDepartureFlight || selectedReturnFlight
  );

  const displayName =
    user?.first_name ||
    user?.username ||
    user?.email ||
    user?.name ||
    '';

  const selectedFlightId = (flight) => flight?.id || flight?.flightNumber;

  const handleToggleAirline = (airline) => {
    setSelectedAirlines((prev) =>
      prev.includes(airline)
        ? prev.filter((item) => item !== airline)
        : [...prev, airline]
    );
  };

  const handleResetFilter = () => {
    setSelectedAirlines([]);
    setDirectOnlyFilter(searchInfo.directOnly);
    setSortMode('recommended');
  };

  const handleChooseFlight = (flight) => {
    if ((flight.availableSeats ?? 10) <= 0) {
      alert('No available seats.');
      return;
    }

    setDrawerStep('review');

    if (!isRoundTrip) {
      setSelectedDepartureFlight(flight);
      return;
    }

    if (selectionStep === 'departure') {
      setSelectedDepartureFlight(flight);
      setSelectionStep('return');
      return;
    }

    setSelectedReturnFlight(flight);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    setDrawerStep('ticketType');
  };

  const handleSelectTicketType = (ticketType) => {
    setSelectedTicketType(ticketType);

    navigate('/passenger-info', {
      state: {
        flight: selectedDepartureFlight?.raw || null,
        searchInfo,
        departureFlight: selectedDepartureFlight?.raw || null,
        returnFlight: selectedReturnFlight?.raw || null,
        selectedFlights: {
          departure: selectedDepartureFlight?.raw || null,
          return: selectedReturnFlight?.raw || null,
        },
        ticketType,
        totalPrice: totalSelectedPrice + Number(ticketType.addon || 0),
      },
    });
  };

  const handleBackToDeparture = () => {
    setSelectionStep('departure');
    setDrawerStep('review');
  };

  const handleCloseReview = () => {
    setSelectedDepartureFlight(null);
    setSelectedReturnFlight(null);
    setSelectedTicketType(null);
    setSelectionStep('departure');
    setDrawerStep('review');
  };

  return (
    <div className="tr-flight-page">
      <header className="tr-header">
        <div className="tr-header-top">
          <Link to="/" className="tr-logo">
            BestPrice<span>✈</span>
          </Link>

          <div className="tr-header-actions">
            <span>🌐 EUR | EN</span>
            <span>🌈 Deals</span>
            <span>Partnership</span>
            <span>Support</span>
            <Link to="/my-bookings">Bookings</Link>

            {displayName ? (
              <div className="tr-user-menu">👤 {displayName}</div>
            ) : (
              <>
                <Link to="/login" className="tr-login-btn">
                  Log In
                </Link>
                <Link to="/signup" className="tr-register-btn">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        <nav className="tr-nav">
          <Link to="/hotel-booking">Hotels</Link>
          <Link to="/flight-booking">Flights</Link>
          <Link to="/airport-transfer">Airport Transfer</Link>
          <Link to="/car-rental">Car Rental</Link>
          <Link to="/tour-selection">Things to Do</Link>
          <span>More⌄</span>
        </nav>
      </header>

      <main className="tr-main">
        <aside className="tr-sidebar">
          <div className="tr-card tr-trip-card">
            <h3>✈ Your Flights</h3>

            <div
              className={`tr-trip-step ${
                selectionStep === 'departure' ? 'active' : ''
              }`}
            >
              <div className="tr-step-number">1</div>

              <div>
                <strong>{formatDateDisplay(searchInfo.departureDate)}</strong>
                <p>
                  {searchInfo.fromAirport} → {searchInfo.toAirport}
                </p>

                {selectedDepartureFlight && (
                  <div className="tr-selected-mini">
                    <span>{selectedDepartureFlight.airline}</span>
                    <small>
                      {formatTime(selectedDepartureFlight.departureTime)} -{' '}
                      {formatTime(selectedDepartureFlight.arrivalTime)} |{' '}
                      {selectedDepartureFlight.duration}
                    </small>
                  </div>
                )}
              </div>
            </div>

            {isRoundTrip && (
              <div
                className={`tr-trip-step ${
                  selectionStep === 'return' ? 'active' : ''
                }`}
              >
                <div className="tr-step-number">2</div>

                <div>
                  <strong>{formatDateDisplay(searchInfo.returnDate)}</strong>
                  <p>
                    {searchInfo.toAirport} → {searchInfo.fromAirport}
                  </p>

                  {selectedReturnFlight && (
                    <div className="tr-selected-mini">
                      <span>{selectedReturnFlight.airline}</span>
                      <small>
                        {formatTime(selectedReturnFlight.departureTime)} -{' '}
                        {formatTime(selectedReturnFlight.arrivalTime)} |{' '}
                        {selectedReturnFlight.duration}
                      </small>
                    </div>
                  )}

                  {selectedDepartureFlight && !selectedReturnFlight && (
                    <button
                      type="button"
                      className="tr-change-step-btn"
                      onClick={handleBackToDeparture}
                    >
                      Change departure flight
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="tr-filter-header">
            <strong>Filter:</strong>
            <button type="button" onClick={handleResetFilter}>
              Reset
            </button>
          </div>

          <div className="tr-filter-section">
            <div className="tr-filter-title">
              <span>No. of Transit</span>
              <span>⌃</span>
            </div>

            <label>
              <input
                type="checkbox"
                checked={directOnlyFilter}
                onChange={(event) => setDirectOnlyFilter(event.target.checked)}
              />
              Direct
            </label>

            <label className="disabled">
              <input type="checkbox" disabled />
              1 transit(s)
            </label>

            <label className="disabled">
              <input type="checkbox" disabled />
              2+ transits
            </label>
          </div>

          <div className="tr-filter-section">
            <div className="tr-filter-title">
              <span>Airline</span>
              <span>⌃</span>
            </div>

            {airlines.length === 0 ? (
              <p className="tr-muted">No airline data</p>
            ) : (
              airlines.map((airline) => (
                <label key={airline}>
                  <input
                    type="checkbox"
                    checked={selectedAirlines.includes(airline)}
                    onChange={() => handleToggleAirline(airline)}
                  />
                  {airline}
                </label>
              ))
            )}
          </div>

          <div className="tr-filter-section">
            <div className="tr-filter-title">
              <span>Time</span>
              <span>⌃</span>
            </div>

            <button className="tr-time-chip" type="button">
              Night to Morning
              <br />
              <strong>00:00 - 06:00</strong>
            </button>

            <button className="tr-time-chip" type="button">
              Morning to Noon
              <br />
              <strong>06:00 - 12:00</strong>
            </button>
          </div>
        </aside>

        <section className="tr-content">
          <div className="tr-blue-search-box">
            <div>
              <h2>
                {selectionStep === 'departure'
                  ? `${searchInfo.fromAirport} → ${searchInfo.toAirport}`
                  : `${searchInfo.toAirport} → ${searchInfo.fromAirport}`}
              </h2>

              <p>
                {selectionStep === 'departure'
                  ? formatDateDisplay(searchInfo.departureDate)
                  : formatDateDisplay(searchInfo.returnDate)}{' '}
                | {totalPassengers} passenger(s) | {searchInfo.cabinClass}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="tr-small-search-btn"
            >
              🔍
            </button>
          </div>

          <div className="tr-date-tabs">
            <button type="button">
              7 May 9
              <br />
              <span>See Price</span>
            </button>

            <button type="button" className="active">
              {selectionStep === 'departure'
                ? formatDateDisplay(searchInfo.departureDate)
                : formatDateDisplay(searchInfo.returnDate)}
              <br />
              <span>
                {cheapestFlight
                  ? formatPrice(cheapestFlight.price, cheapestFlight.currency)
                  : 'See Price'}
              </span>
            </button>

            <button type="button">
              9 May 11
              <br />
              <span>See Price</span>
            </button>

            <button type="button">
              10 May 12
              <br />
              <span>See Price</span>
            </button>
          </div>

          <div className="tr-sort-row">
            <button
              type="button"
              className={sortMode === 'price' ? 'active' : ''}
              onClick={() => setSortMode('price')}
            >
              <strong>Lowest price</strong>
              <span>
                {cheapestFlight
                  ? formatPrice(cheapestFlight.price, cheapestFlight.currency)
                  : 'No price'}
              </span>
            </button>

            <button
              type="button"
              className={sortMode === 'duration' ? 'active' : ''}
              onClick={() => setSortMode('duration')}
            >
              <strong>Shortest duration</strong>
              <span>Fastest flight</span>
            </button>

            <button
              type="button"
              className={sortMode === 'recommended' ? 'active' : ''}
              onClick={() => setSortMode('recommended')}
            >
              <strong>Direct flights first</strong>
              <span>Recommended</span>
            </button>
          </div>

          <p className="tr-price-view">Round-trip price view ⓘ</p>

          <h3 className="tr-result-title">
            {!isRoundTrip
              ? 'Best flight from your search!'
              : selectionStep === 'departure'
                ? 'Select your departure flight'
                : 'Select your return flight'}
          </h3>

          {loading ? (
            <div className="tr-card tr-message-card">Loading flights...</div>
          ) : error ? (
            <div className="tr-card tr-message-card error">{error}</div>
          ) : displayedFlights.length === 0 ? (
            <div className="tr-card tr-message-card">
              No suitable flights found.
              <br />
              <button type="button" onClick={() => navigate('/')}>
                Search again
              </button>
            </div>
          ) : (
            <div className="tr-flight-list">
              {displayedFlights.map((flight, index) => {
                const isSelected =
                  selectionStep === 'departure'
                    ? selectedFlightId(selectedDepartureFlight) ===
                      selectedFlightId(flight)
                    : selectedFlightId(selectedReturnFlight) ===
                      selectedFlightId(flight);

                return (
                  <div
                    key={flight.id || `${flight.airline}-${index}`}
                    className={`tr-card tr-flight-card ${
                      index === 0 ? 'best' : ''
                    } ${isSelected ? 'selected' : ''}`}
                  >
                    {index === 0 && (
                      <div className="tr-best-badge">
                        Cheapest direct flight
                      </div>
                    )}

                    <div className="tr-flight-main">
                      <div className="tr-airline">
                        <div className="tr-airline-logo">
                          {flight.airline.charAt(0)}
                        </div>

                        <div>
                          <h4>{flight.airline}</h4>
                          <span className="tr-bag">🧳 {flight.baggage}</span>
                        </div>
                      </div>

                      <div className="tr-time-box">
                        <div>
                          <strong>{formatTime(flight.departureTime)}</strong>
                          <span>{flight.departureAirport}</span>
                        </div>

                        <div className="tr-duration">
                          <small>{flight.duration}</small>
                          <div></div>
                          <small>{flight.transit}</small>
                        </div>

                        <div>
                          <strong>{formatTime(flight.arrivalTime)}</strong>
                          <span>{flight.arrivalAirport}</span>
                        </div>
                      </div>

                      <div className="tr-price">
                        <strong>
                          {formatPrice(flight.price, flight.currency)}
                        </strong>
                        <span>/pax</span>
                        <small>Round-trip price</small>
                      </div>

                      <button
                        type="button"
                        className="tr-choose-btn"
                        onClick={() => handleChooseFlight(flight)}
                        disabled={flight.availableSeats <= 0}
                      >
                        {flight.availableSeats <= 0
                          ? 'Sold out'
                          : isSelected
                            ? 'Selected'
                            : isRoundTrip && selectionStep === 'departure'
                              ? 'Choose departure'
                              : isRoundTrip && selectionStep === 'return'
                                ? 'Choose return'
                                : 'Choose'}
                      </button>
                    </div>

                    <div className="tr-flight-bottom">
                      <button type="button">Flight Details</button>
                      <button type="button">Additional Benefit</button>
                      <button type="button">Refund</button>
                      <button type="button">Reschedule</button>
                      <span>{flight.availableSeats} seats left</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {shouldShowReviewPanel && (
        <>
          <div className="tr-review-backdrop" onClick={handleCloseReview} />

          <aside className="tr-review-drawer">
            {drawerStep === 'review' ? (
              <>
                <div className="tr-review-header">
                  <button
                    type="button"
                    className="tr-review-close"
                    onClick={handleCloseReview}
                  >
                    ×
                  </button>

                  <h3>Review your flight</h3>
                </div>

                <div className="tr-review-content">
                  {selectedDepartureFlight && (
                    <div className="tr-review-card">
                      <div className="tr-review-top">
                        <span className="tag">Departure</span>
                        <strong>
                          {searchInfo.fromAirport} → {searchInfo.toAirport}
                        </strong>
                        <span>{formatDateDisplay(searchInfo.departureDate)}</span>
                      </div>

                      <div className="tr-review-body">
                        <div className="tr-review-airline">
                          <strong>{selectedDepartureFlight.airline}</strong>
                          <p>{searchInfo.cabinClass}</p>
                        </div>

                        <div className="tr-review-time">
                          <strong>
                            {formatTime(selectedDepartureFlight.departureTime)}
                          </strong>
                          <span>{selectedDepartureFlight.departureAirport}</span>
                        </div>

                        <div className="tr-review-middle">
                          <span>{selectedDepartureFlight.duration}</span>
                          <div className="line"></div>
                          <span>{selectedDepartureFlight.transit}</span>
                        </div>

                        <div className="tr-review-time">
                          <strong>
                            {formatTime(selectedDepartureFlight.arrivalTime)}
                          </strong>
                          <span>{selectedDepartureFlight.arrivalAirport}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="tr-review-details"
                        onClick={handleBackToDeparture}
                      >
                        Change departure flight
                      </button>
                    </div>
                  )}

                  {isRoundTrip &&
                    selectedDepartureFlight &&
                    !selectedReturnFlight && (
                      <div className="tr-review-empty">
                        Please choose your return flight
                      </div>
                    )}

                  {isRoundTrip && selectedReturnFlight && (
                    <div className="tr-review-card">
                      <div className="tr-review-top">
                        <span className="tag return">Return</span>
                        <strong>
                          {searchInfo.toAirport} → {searchInfo.fromAirport}
                        </strong>
                        <span>{formatDateDisplay(searchInfo.returnDate)}</span>
                      </div>

                      <div className="tr-review-body">
                        <div className="tr-review-airline">
                          <strong>{selectedReturnFlight.airline}</strong>
                          <p>{searchInfo.cabinClass}</p>
                        </div>

                        <div className="tr-review-time">
                          <strong>
                            {formatTime(selectedReturnFlight.departureTime)}
                          </strong>
                          <span>{selectedReturnFlight.departureAirport}</span>
                        </div>

                        <div className="tr-review-middle">
                          <span>{selectedReturnFlight.duration}</span>
                          <div className="line"></div>
                          <span>{selectedReturnFlight.transit}</span>
                        </div>

                        <div className="tr-review-time">
                          <strong>
                            {formatTime(selectedReturnFlight.arrivalTime)}
                          </strong>
                          <span>{selectedReturnFlight.arrivalAirport}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="tr-review-details"
                        onClick={() => setSelectionStep('return')}
                      >
                        Change return flight
                      </button>
                    </div>
                  )}
                </div>

                <div className="tr-review-footer">
                  <div className="tr-review-price">
                    <strong>{formatPrice(totalSelectedPrice || 0, 'USD')}</strong>
                    <span>/pax</span>
                  </div>

                  <button
                    type="button"
                    className="tr-continue-btn"
                    disabled={!canContinue}
                    onClick={handleContinue}
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="tr-ticket-header">
                  <button
                    type="button"
                    className="tr-ticket-back"
                    onClick={() => setDrawerStep('review')}
                  >
                    ←
                  </button>

                  <div>
                    <h3>Select ticket type (Departure)</h3>
                    <p>
                      {isRoundTrip ? 'Round-trip price' : 'One-way price'}:{' '}
                      <strong>
                        {formatPrice(totalSelectedPrice || 0, 'USD')}
                      </strong>
                      /pax
                    </p>
                  </div>

                  <button
                    type="button"
                    className="tr-review-close"
                    onClick={handleCloseReview}
                  >
                    ×
                  </button>
                </div>

                <div className="tr-ticket-content">
                  <div className="tr-ticket-route">
                    <span className="tag">Departure</span>
                    <strong>
                      {searchInfo.fromAirport} → {searchInfo.toAirport}
                    </strong>
                    <span>{formatDateDisplay(searchInfo.departureDate)}</span>
                  </div>

                  <div className="tr-ticket-options">
                    {TICKET_TYPES.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`tr-ticket-card ${
                          ticket.recommended ? 'recommended' : ''
                        }`}
                      >
                        <div className="tr-ticket-name">{ticket.name}</div>

                        <div className="tr-ticket-price">
                          {ticket.addon > 0 ? '+' : ''}
                          {formatPrice(ticket.addon, 'USD')}
                          <span>/pax</span>
                        </div>

                        <ul className="tr-ticket-benefits">
                          <li>🧳 Cabin baggage {ticket.cabinBaggage}</li>
                          <li>💼 Checked baggage {ticket.checkedBaggage}</li>
                          <li className={!ticket.reschedule ? 'disabled' : ''}>
                            🔁{' '}
                            {ticket.reschedule
                              ? 'Reschedule available'
                              : 'Reschedule not available'}
                          </li>
                          <li className={!ticket.refundable ? 'disabled' : ''}>
                            💵{' '}
                            {ticket.refundable
                              ? 'Refund available'
                              : 'Refund fee starts from $54.99'}
                          </li>

                          {ticket.protection && (
                            <li className="success">
                              🛡 Baggage Loss Tracking & Protection
                            </li>
                          )}
                        </ul>

                        {ticket.recommended && (
                          <div className="tr-ticket-note">
                            Must be purchased for all flights in your trip.
                          </div>
                        )}

                        <div className="tr-ticket-actions">
                          <button type="button" className="tr-learn-more">
                            Learn more
                          </button>

                          <button
                            type="button"
                            className="tr-ticket-select-btn"
                            onClick={() => handleSelectTicketType(ticket)}
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </aside>
        </>
      )}
    </div>
  );
};

export default FlightResult;