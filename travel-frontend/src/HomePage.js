import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AIRPORT_INFO = {
    SVO: {
    code: 'SVO',
    city: 'Moscow',
    cityVi: 'Moscow',
    cityRu: 'Москва',
    airport: 'Sheremetyevo International Airport',
    airportVi: 'Sân bay quốc tế Sheremetyevo',
    airportRu: 'Международный аэропорт Шереметьево',
    aliases: [
      'moscow',
      'moskva',
      'москва',
      'sheremetyevo',
      'sheremetyevo airport',
      'шереметьево',
      'aeroport sheremetyevo',
    ],
  },

  DME: {
    code: 'DME',
    city: 'Moscow',
    cityVi: 'Moscow',
    cityRu: 'Москва',
    airport: 'Domodedovo Airport',
    airportVi: 'Sân bay Domodedovo',
    airportRu: 'Аэропорт Домодедово',
    aliases: [
      'moscow',
      'moskva',
      'москва',
      'domodedovo',
      'domodedovo airport',
      'домодедово',
      'aeroport domodedovo',
    ],
  },

  VKO: {
    code: 'VKO',
    city: 'Moscow',
    cityVi: 'Moscow',
    cityRu: 'Москва',
    airport: 'Vnukovo International Airport',
    airportVi: 'Sân bay quốc tế Vnukovo',
    airportRu: 'Международный аэропорт Внуково',
    aliases: [
      'moscow',
      'moskva',
      'москва',
      'vnukovo',
      'vnukovo airport',
      'внуково',
      'aeroport vnukovo',
    ],
  },

  SGN: {
    code: 'SGN',
    city: 'Ho Chi Minh City',
    cityVi: 'TP. Hồ Chí Minh',
    cityRu: 'Хошимин',
    airport: 'Tan Son Nhat International Airport',
    airportVi: 'Sân bay Tân Sơn Nhất',
    airportRu: 'Международный аэропорт Таншоннят',
    aliases: ['saigon', 'sài gòn', 'ho chi minh', 'hồ chí minh', 'tan son nhat'],
  },
  HAN: {
    code: 'HAN',
    city: 'Hanoi',
    cityVi: 'Hà Nội',
    cityRu: 'Ханой',
    airport: 'Noi Bai International Airport',
    airportVi: 'Sân bay Nội Bài',
    airportRu: 'Международный аэропорт Нойбай',
    aliases: ['ha noi', 'hà nội', 'hanoi', 'noi bai', 'nội bài'],
  },
  DAD: {
    code: 'DAD',
    city: 'Da Nang',
    cityVi: 'Đà Nẵng',
    cityRu: 'Дананг',
    airport: 'Da Nang International Airport',
    airportVi: 'Sân bay Đà Nẵng',
    airportRu: 'Международный аэропорт Дананг',
    aliases: ['da nang', 'đà nẵng', 'danang'],
  },
  CXR: {
    code: 'CXR',
    city: 'Nha Trang',
    cityVi: 'Nha Trang',
    cityRu: 'Нячанг',
    airport: 'Cam Ranh International Airport',
    airportVi: 'Sân bay Cam Ranh',
    airportRu: 'Международный аэропорт Камрань',
    aliases: ['nha trang', 'cam ranh', 'khánh hòa', 'khanh hoa'],
  },
  PQC: {
    code: 'PQC',
    city: 'Phu Quoc',
    cityVi: 'Phú Quốc',
    cityRu: 'Фукуок',
    airport: 'Phu Quoc International Airport',
    airportVi: 'Sân bay Phú Quốc',
    airportRu: 'Международный аэропорт Фукуок',
    aliases: ['phu quoc', 'phú quốc'],
  },
  HUI: {
    code: 'HUI',
    city: 'Hue',
    cityVi: 'Huế',
    cityRu: 'Хюэ',
    airport: 'Phu Bai International Airport',
    airportVi: 'Sân bay Phú Bài',
    airportRu: 'Международный аэропорт Фубай',
    aliases: ['hue', 'huế', 'phu bai', 'phú bài'],
  },
  VCA: {
    code: 'VCA',
    city: 'Can Tho',
    cityVi: 'Cần Thơ',
    cityRu: 'Кантхо',
    airport: 'Can Tho International Airport',
    airportVi: 'Sân bay Cần Thơ',
    airportRu: 'Международный аэропорт Кантхо',
    aliases: ['can tho', 'cần thơ'],
  },
  BKK: {
    code: 'BKK',
    city: 'Bangkok',
    cityVi: 'Bangkok',
    cityRu: 'Бангкок',
    airport: 'Suvarnabhumi Airport',
    airportVi: 'Sân bay Suvarnabhumi',
    airportRu: 'Аэропорт Суварнабхуми',
    aliases: ['bangkok', 'thailand', 'thái lan', 'thai lan', 'suvarnabhumi'],
  },
  DPS: {
    code: 'DPS',
    city: 'Bali / Denpasar',
    cityVi: 'Bali / Denpasar',
    cityRu: 'Бали / Денпасар',
    airport: 'Ngurah Rai International Airport',
    airportVi: 'Sân bay quốc tế Ngurah Rai',
    airportRu: 'Международный аэропорт Нгурах-Рай',
    aliases: ['bali', 'denpasar', 'ngurah rai', 'indonesia'],
  },
  CGK: {
    code: 'CGK',
    city: 'Jakarta',
    cityVi: 'Jakarta',
    cityRu: 'Джакарта',
    airport: 'Soekarno-Hatta International Airport',
    airportVi: 'Sân bay Soekarno-Hatta',
    airportRu: 'Международный аэропорт Сукарно-Хатта',
    aliases: ['jakarta', 'soekarno', 'hatta', 'indonesia'],
  },
  ICN: {
    code: 'ICN',
    city: 'Seoul',
    cityVi: 'Seoul',
    cityRu: 'Сеул',
    airport: 'Incheon International Airport',
    airportVi: 'Sân bay Incheon',
    airportRu: 'Международный аэропорт Инчхон',
    aliases: ['seoul', 'incheon', 'korea', 'hàn quốc', 'han quoc'],
  },
  NRT: {
    code: 'NRT',
    city: 'Tokyo',
    cityVi: 'Tokyo',
    cityRu: 'Токио',
    airport: 'Narita International Airport',
    airportVi: 'Sân bay Narita',
    airportRu: 'Международный аэропорт Нарита',
    aliases: ['tokyo', 'narita', 'japan', 'nhật bản', 'nhat ban'],
  },
  HND: {
    code: 'HND',
    city: 'Tokyo',
    cityVi: 'Tokyo',
    cityRu: 'Токио',
    airport: 'Haneda Airport',
    airportVi: 'Sân bay Haneda',
    airportRu: 'Аэропорт Ханэда',
    aliases: ['tokyo', 'haneda', 'japan', 'nhật bản', 'nhat ban'],
  },
  SIN: {
    code: 'SIN',
    city: 'Singapore',
    cityVi: 'Singapore',
    cityRu: 'Сингапур',
    airport: 'Changi Airport',
    airportVi: 'Sân bay Changi',
    airportRu: 'Аэропорт Чанги',
    aliases: ['singapore', 'changi'],
  },
};

const normalizeAirportCode = (value = '') => {
  return String(value).trim().toUpperCase();
};

const getAirportInfo = (value = '') => {
  const rawValue = String(value).trim();

  if (!rawValue) {
    return {
      code: '',
      city: '',
      cityRu: '',
      airport: 'All Airports',
      airportRu: 'Все аэропорты',
      aliases: [],
    };
  }

  const upperValue = normalizeAirportCode(rawValue);

  if (AIRPORT_INFO[upperValue]) {
    return AIRPORT_INFO[upperValue];
  }

  const foundAirport = Object.values(AIRPORT_INFO).find((airport) => {
    const searchText = `
      ${airport.code}
      ${airport.city}
      ${airport.cityVi}
      ${airport.cityRu}
      ${airport.airport}
      ${airport.airportVi}
      ${airport.airportRu}
      ${(airport.aliases || []).join(' ')}
    `.toLowerCase();

    return searchText.includes(rawValue.toLowerCase());
  });

  return (
    foundAirport || {
      code: upperValue,
      city: rawValue,
      cityVi: rawValue,
      cityRu: rawValue,
      airport: 'All Airports',
      airportVi: 'Tất cả sân bay',
      airportRu: 'Все аэропорты',
      aliases: [],
    }
  );
};

const getAirportDisplayText = (value = '') => {
  const airport = getAirportInfo(value);

  if (!airport.code && !airport.city) return '';

  const cityName = airport.city || airport.cityRu || airport.cityVi || value;
  const code = airport.code ? ` (${airport.code})` : '';

  return `${cityName}${code}`;
};

const getAirportSubText = (value = '') => {
  const airport = getAirportInfo(value);
  return airport.airport || airport.airportRu || 'Все аэропорты';
};

const getAirportSearchText = (value = '') => {
  const airport = getAirportInfo(value);

  return `
    ${airport.code}
    ${airport.city}
    ${airport.cityVi}
    ${airport.cityRu}
    ${airport.airport}
    ${airport.airportVi}
    ${airport.airportRu}
    ${(airport.aliases || []).join(' ')}
  `.toLowerCase();
};

function HomePage() {
  const navigate = useNavigate();

  const flightDepartureInputRef = useRef(null);
  const flightReturnInputRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);

  const [activeService, setActiveService] = useState('hotels');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('2026-05-05');
  const [endDate, setEndDate] = useState('2026-05-06');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  // ===== FLIGHT SEARCH STATE =====
  const [flights, setFlights] = useState([]);
  const [flightTripType, setFlightTripType] = useState('roundtrip');
  const [directFlightsOnly, setDirectFlightsOnly] = useState(false);
  const [flightFrom, setFlightFrom] = useState('');
  const [flightTo, setFlightTo] = useState('');
  const [flightFromTyping, setFlightFromTyping] = useState(false);
  const [flightToTyping, setFlightToTyping] = useState(false);
  const [flightDepartDate, setFlightDepartDate] = useState('2026-05-08');
  const [flightReturnDate, setFlightReturnDate] = useState('2026-05-10');
  const [returnDateEnabled, setReturnDateEnabled] = useState(true);
  const [flightPassengers, setFlightPassengers] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [flightCabinClass, setFlightCabinClass] = useState('Economy');

  // ===== TOUR SEARCH STATE =====
  const [tourArea, setTourArea] = useState('international');
  const [tourDeparture, setTourDeparture] = useState('Все');
  const [tourDestination, setTourDestination] = useState('');
  const [tourDate, setTourDate] = useState('2026-05-11');

  const serviceConfig = {
    hotels: {
      label: 'Отели',
      placeholder: 'Город, отель, направление',
      path: '/hotel-results',
    },
    flights: {
      label: 'Авиабилеты',
      placeholder: 'Город отправления или прибытия, например HAN, SGN',
      path: '/flight-result',
    },
    tours: {
      label: 'Туры',
      placeholder: 'Название тура или направление',
      path: '/international-tours',
    },
  };

  const API_ENDPOINTS = {
    hotels: 'http://127.0.0.1:8000/api/hotels/',
    flights: 'http://127.0.0.1:8000/api/flights/',
    tours: 'http://127.0.0.1:8000/api/tours/',
  };

  useEffect(() => {
    const loadCurrentUser = () => {
      const savedUser = localStorage.getItem('currentUser');

      if (!savedUser) {
        setCurrentUser(null);
        return;
      }

      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Current user parse error:', error);
        setCurrentUser(null);
      }
    };

    loadCurrentUser();

    window.addEventListener('storage', loadCurrentUser);
    window.addEventListener('focus', loadCurrentUser);

    return () => {
      window.removeEventListener('storage', loadCurrentUser);
      window.removeEventListener('focus', loadCurrentUser);
    };
  }, []);

  const extractHotelCity = (location = '') => {
    const text = String(location).toLowerCase();

    const cityMap = [
      {
        keywords: ['nha trang', 'khanh hoa', 'khánh hòa'],
        name: 'Nha Trang',
        location: 'Кханьхоа, Вьетнам',
      },
      {
        keywords: ['hanoi', 'ha noi', 'hà nội'],
        name: 'Ханой',
        location: 'Вьетнам',
      },
      {
        keywords: ['ho chi minh', 'hồ chí minh', 'saigon', 'sài gòn'],
        name: 'Хошимин',
        location: 'Вьетнам',
      },
      {
        keywords: ['da nang', 'đà nẵng'],
        name: 'Дананг',
        location: 'Вьетнам',
      },
      {
        keywords: ['phu quoc', 'phú quốc'],
        name: 'Фукуок',
        location: 'Кьензянг, Вьетнам',
      },
      {
        keywords: ['vung tau', 'vũng tàu'],
        name: 'Вунгтау',
        location: 'Бариа — Вунгтау, Вьетнам',
      },
    ];

    const foundCity = cityMap.find((city) =>
      city.keywords.some((keywordItem) => text.includes(keywordItem))
    );

    if (foundCity) {
      return foundCity;
    }

    const parts = String(location)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const fallbackName =
      parts.length >= 2 ? parts[parts.length - 2] : parts[0] || 'Неизвестный город';

    return {
      name: fallbackName,
      location: parts[parts.length - 1] || '',
    };
  };

  const getFlightDeparture = (flight) => {
    return (
      flight.departure ||
      flight.from ||
      flight.origin ||
      flight.departure_city ||
      flight.departure_airport ||
      ''
    );
  };

  const getFlightArrival = (flight) => {
    return (
      flight.arrival ||
      flight.to ||
      flight.destination ||
      flight.arrival_city ||
      flight.arrival_airport ||
      ''
    );
  };

  const getUniqueFlightDepartures = () => {
    const values = flights
      .map((flight) => getFlightDeparture(flight))
      .filter(Boolean);

    const apiValues = values.map((value) => getAirportInfo(value));

    return [
      ...new Map(
        [...Object.values(AIRPORT_INFO), ...apiValues].map((airport) => [
          airport.code || airport.city,
          airport,
        ])
      ).values(),
    ];
  };

  const getUniqueFlightArrivals = () => {
    const values = flights
      .map((flight) => getFlightArrival(flight))
      .filter(Boolean);

    const apiValues = values.map((value) => getAirportInfo(value));

    return [
      ...new Map(
        [...Object.values(AIRPORT_INFO), ...apiValues].map((airport) => [
          airport.code || airport.city,
          airport,
        ])
      ).values(),
    ];
  };

  const normalizeSuggestions = (data, type) => {
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data.results)
        ? data.results
        : Array.isArray(data.data)
          ? data.data
          : [];

    if (type === 'hotels') {
      const cityGroups = {};

      list.forEach((hotel) => {
        const city = extractHotelCity(hotel.location || '');

        if (!cityGroups[city.name]) {
          cityGroups[city.name] = {
            name: city.name,
            location: city.location,
            type: 'Город',
            hotelCount: 0,
            value: city.name,
          };
        }

        cityGroups[city.name].hotelCount += 1;
      });

      return Object.values(cityGroups).map((city) => ({
        name: city.name,
        location: city.location,
        type: city.type,
        count: `${city.hotelCount} отелей`,
        value: city.value,
      }));
    }

    if (type === 'flights') {
      return list.map((flight) => {
        const departureInfo = getAirportInfo(getFlightDeparture(flight));
        const arrivalInfo = getAirportInfo(getFlightArrival(flight));

        return {
          name: `${getAirportDisplayText(departureInfo.code)} - ${getAirportDisplayText(
            arrivalInfo.code
          )}`,
          location: flight.flight_number
            ? `Рейс ${flight.flight_number}`
            : 'Рейс',
          type: 'Авиабилет',
          count: flight.price
            ? `${flight.price} ${flight.currency || 'USD'}`
            : 'Цена недоступна',
          value: departureInfo.code || getFlightDeparture(flight) || flight.flight_number || '',
          extra: {
            id: flight.id,
            flight_number: flight.flight_number,
            departure: departureInfo.code || getFlightDeparture(flight),
            arrival: arrivalInfo.code || getFlightArrival(flight),
            price: flight.price,
            currency: flight.currency,
          },
        };
      });
    }

    if (type === 'tours') {
      return list.map((tour) => ({
        name: tour.name || tour.tour_name || tour.title || 'Безымянный тур',
        location: tour.destination || tour.location || '',
        type: 'Тур',
        count: tour.price ? `$${tour.price}` : 'Цена недоступна',
        value: tour.name || tour.tour_name || tour.title || '',
        extra: {
          id: tour.id,
          price: tour.price,
          destination: tour.destination || tour.location,
        },
      }));
    }

    return [];
  };

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.flights);
        const data = await response.json();

        const flightList = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : Array.isArray(data.data)
              ? data.data
              : [];

        setFlights(flightList);

        if (flightList.length > 0) {
          const firstFlight = flightList[0];

          const firstDeparture = getFlightDeparture(firstFlight);
          const firstArrival = getFlightArrival(firstFlight);

          if (firstDeparture) {
            const departureInfo = getAirportInfo(firstDeparture);
            setFlightFrom((prev) => prev || departureInfo.code || firstDeparture);
          }

          if (firstArrival) {
            const arrivalInfo = getAirportInfo(firstArrival);
            setFlightTo((prev) => prev || arrivalInfo.code || firstArrival);
          }

          if (firstFlight.departure_date) {
            setFlightDepartDate(firstFlight.departure_date);
          }
        }
      } catch (error) {
        console.error('Flight API error:', error);
        setFlights([]);
      }
    };

    fetchFlights();
  }, []);

  useEffect(() => {
    if (!showSuggestions) return;

    const timer = setTimeout(async () => {
      try {
        setSuggestionLoading(true);

        const apiUrl = API_ENDPOINTS[activeService];
        const response = await fetch(apiUrl);
        const data = await response.json();

        let normalized = normalizeSuggestions(data, activeService);

        if (keyword.trim()) {
          normalized = normalized.filter((item) =>
            `${item.name} ${item.location}`
              .toLowerCase()
              .includes(keyword.toLowerCase())
          );
        }

        setSuggestions(normalized.slice(0, 10));
      } catch (error) {
        console.error('Suggestion API error:', error);
        setSuggestions([]);
      } finally {
        setSuggestionLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, activeService, showSuggestions]);

  const handleChangeService = (service) => {
    setActiveService(service);
    setKeyword('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const formatFlightDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    const months = [
      'янв',
      'фев',
      'мар',
      'апр',
      'май',
      'июн',
      'июл',
      'авг',
      'сен',
      'окт',
      'ноя',
      'дек',
    ];

    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const openDatePicker = (inputRef) => {
    if (!inputRef.current) return;

    if (typeof inputRef.current.showPicker === 'function') {
      inputRef.current.showPicker();
    } else {
      inputRef.current.focus();
    }
  };

  const handleSwapFlight = () => {
    const oldFrom = flightFrom;
    setFlightFrom(flightTo);
    setFlightTo(oldFrom);
  };

  const handleFlightSearch = () => {
    const fromInfo = getAirportInfo(flightFrom);
    const toInfo = getAirportInfo(flightTo);

    const normalizedFrom = fromInfo.code || flightFrom;
    const normalizedTo = toInfo.code || flightTo;

    const matchedFlights = flights.filter((flight) => {
      const departureValue = getFlightDeparture(flight);
      const arrivalValue = getFlightArrival(flight);

      const departureSearchText = getAirportSearchText(departureValue);
      const arrivalSearchText = getAirportSearchText(arrivalValue);

      const fromSearch = `${normalizedFrom} ${flightFrom}`.toLowerCase();
      const toSearch = `${normalizedTo} ${flightTo}`.toLowerCase();

      return (
        departureSearchText.includes(fromSearch.split(' ')[0]) ||
        departureSearchText.includes(flightFrom.toLowerCase())
      ) && (
        arrivalSearchText.includes(toSearch.split(' ')[0]) ||
        arrivalSearchText.includes(flightTo.toLowerCase())
      );
    });

    const searchInfo = {
      service: 'flights',
      fromAirport: normalizedFrom,
      toAirport: normalizedTo,
      from: normalizedFrom,
      to: normalizedTo,
      fromDisplay: getAirportDisplayText(normalizedFrom),
      toDisplay: getAirportDisplayText(normalizedTo),
      fromAirportName: getAirportSubText(normalizedFrom),
      toAirportName: getAirportSubText(normalizedTo),
      departure: normalizedFrom,
      arrival: normalizedTo,
      departureDate: flightDepartDate,
      returnDate: returnDateEnabled ? flightReturnDate : '',
      adults: flightPassengers.adults,
      children: flightPassengers.children,
      infants: flightPassengers.infants,
      passengers: String(
        flightPassengers.adults +
          flightPassengers.children +
          flightPassengers.infants
      ),
      cabinClass: flightCabinClass,
      tripType: flightTripType,
      directOnly: directFlightsOnly,
    };

    const params = new URLSearchParams({
      service: 'flights',
      from: normalizedFrom,
      to: normalizedTo,
      fromDisplay: getAirportDisplayText(normalizedFrom),
      toDisplay: getAirportDisplayText(normalizedTo),
      departureDate: flightDepartDate,
      returnDate: returnDateEnabled ? flightReturnDate : '',
      adults: String(flightPassengers.adults),
      children: String(flightPassengers.children),
      infants: String(flightPassengers.infants),
      cabinClass: flightCabinClass,
      tripType: flightTripType,
      directOnly: directFlightsOnly ? 'true' : 'false',
    });

    navigate(`/flight-result?${params.toString()}`, {
      state: {
        searchInfo,
        matchedFlights,
      },
    });
  };

  const handleTourAreaChange = (area) => {
    setTourArea(area);
  };

  const handleTourSearch = () => {
    const params = new URLSearchParams({
      service: 'tours',
      area: tourArea,
      departure: tourDeparture,
      destination: tourDestination,
      date: tourDate,
    });

    const targetPath =
      tourArea === 'domestic' ? '/domestic-tours' : '/international-tours';

    navigate(`${targetPath}?${params.toString()}`, {
      state: {
        service: 'tours',
        area: tourArea,
        departure: tourDeparture,
        destination: tourDestination,
        date: tourDate,
        keyword: tourDestination,
        startDate: tourDate,
      },
    });
  };

  const handleSearch = () => {
    const config = serviceConfig[activeService];

    const params = new URLSearchParams({
      service: activeService,
      keyword,
      startDate,
      endDate,
      adults: String(adults),
      children: String(children),
    });

    navigate(`${config.path}?${params.toString()}`, {
      state: {
        service: activeService,
        keyword,
        startDate,
        endDate,
        adults,
        children,
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/');
  };

  const currentUserName =
    currentUser?.fullName ||
    currentUser?.name ||
    currentUser?.username ||
    currentUser?.email ||
    'Выполнен вход';

  return (
    <div className="bp-home">
      <header className="bp-header">
        <div className="bp-header-inner">
          <Link to="/" className="bp-logo">
            BestPrice<span>✈</span>
          </Link>

          <div className="bp-top-menu">
            <span>🇷🇺 RUB | RU</span>
            <span>💚 Акции</span>
            <span>Сотрудничество</span>
            <span>Поддержка</span>
            <Link to="/my-bookings">Мои бронирования</Link>
          </div>

          <div className="bp-auth">
            {currentUser ? (
              <>
                <Link to="/my-bookings" className="bp-user-badge">
                  👤 {currentUserName}
                </Link>

                <button
                  type="button"
                  className="bp-logout-btn"
                  onClick={handleLogout}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="bp-login-btn">
                  Войти
                </Link>

                <Link to="/signup" className="bp-register-btn">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="bp-hero">
        <div className="bp-hero-content">
          <h1>Лучшее приложение для путешествий — куда угодно в один клик</h1>

          <div className="bp-search-panel">
            <div className="bp-service-tabs">
              <button
                type="button"
                className={activeService === 'hotels' ? 'active' : ''}
                onClick={() => handleChangeService('hotels')}
              >
                🏨 Отели
              </button>

              <button
                type="button"
                className={activeService === 'flights' ? 'active' : ''}
                onClick={() => handleChangeService('flights')}
              >
                ✈ Авиабилеты
              </button>

              <button
                type="button"
                className={activeService === 'tours' ? 'active' : ''}
                onClick={() => handleChangeService('tours')}
              >
                🌍 Туры
              </button>

              <Link to="/domestic-tours">🏝 Внутренние туры</Link>
              <Link to="/international-tours">🛫 Международные туры</Link>
              <Link to="/my-bookings">📋 Мои бронирования</Link>
            </div>

            <div className="bp-sub-tabs">
              <button
                type="button"
                className={activeService === 'hotels' ? 'active' : ''}
                onClick={() => handleChangeService('hotels')}
              >
                Отели
              </button>

              <button
                type="button"
                className={activeService === 'flights' ? 'active' : ''}
                onClick={() => handleChangeService('flights')}
              >
                Авиабилеты
              </button>

              <button
                type="button"
                className={activeService === 'tours' ? 'active' : ''}
                onClick={() => handleChangeService('tours')}
              >
                Туры
              </button>
            </div>

            {activeService === 'flights' ? (
              <div className="flight-search-pro">
                <div className="flight-search-control-row">
                  <div className="flight-trip-buttons">
                    <button
                      type="button"
                      className={flightTripType === 'roundtrip' ? 'active' : ''}
                      onClick={() => setFlightTripType('roundtrip')}
                    >
                      В одну сторону / Туда и обратно
                    </button>

                    <button
                      type="button"
                      className={flightTripType === 'multicity' ? 'active' : ''}
                      onClick={() => setFlightTripType('multicity')}
                    >
                      Несколько городов
                    </button>
                  </div>

                  <label className="flight-direct-check">
                    <input
                      type="checkbox"
                      checked={directFlightsOnly}
                      onChange={(e) => setDirectFlightsOnly(e.target.checked)}
                    />
                    <span>Только прямые рейсы</span>
                  </label>

                  <select
                    className="flight-top-select"
                    value={`${flightPassengers.adults}-${flightPassengers.children}-${flightPassengers.infants}`}
                    onChange={(e) => {
                      const [adultValue, childValue, infantValue] =
                        e.target.value.split('-');

                      setFlightPassengers({
                        adults: Number(adultValue),
                        children: Number(childValue),
                        infants: Number(infantValue),
                      });
                    }}
                  >
                    <option value="1-0-0">
                      👥 1 взрослый, 0 детей, 0 младенцев
                    </option>
                    <option value="2-0-0">
                      👥 2 взрослых, 0 детей, 0 младенцев
                    </option>
                    <option value="2-1-0">
                      👥 2 взрослых, 1 ребенок, 0 младенцев
                    </option>
                    <option value="2-1-1">
                      👥 2 взрослых, 1 ребенок, 1 младенец
                    </option>
                    <option value="3-0-0">
                      👥 3 взрослых, 0 детей, 0 младенцев
                    </option>
                  </select>

                  <select
                    className="flight-top-select economy"
                    value={flightCabinClass}
                    onChange={(e) => setFlightCabinClass(e.target.value)}
                  >
                    <option value="Economy">💺 Эконом</option>
                    <option value="Premium Economy">💺 Премиум-эконом</option>
                    <option value="Business">💺 Бизнес</option>
                    <option value="First Class">💺 Первый класс</option>
                  </select>
                </div>

                <div className="flight-search-label-row">
                  <label>Откуда</label>
                  <label>Куда</label>
                  <label>Дата вылета</label>

                  <label className="flight-return-label">
                    <input
                      type="checkbox"
                      checked={returnDateEnabled}
                      onChange={(e) => setReturnDateEnabled(e.target.checked)}
                    />
                    Дата возвращения
                  </label>
                </div>

                <div className="flight-search-main-row">
                  <div className="flight-route-card">
                    <div className="flight-route-field">
                      <span className="flight-field-icon">🛫</span>

                      <div>
                        <input
                          list="flight-from-options"
                          value={
                            flightFromTyping
                              ? flightFrom
                              : flightFrom
                                ? getAirportDisplayText(flightFrom)
                                : ''
                          }
                          onFocus={() => setFlightFromTyping(true)}
                          onBlur={() => {
                            const airport = getAirportInfo(flightFrom);
                            setFlightFrom(airport.code || flightFrom);
                            setFlightFromTyping(false);
                          }}
                          onChange={(e) => setFlightFrom(e.target.value)}
                          placeholder="Город или аэропорт"
                        />

                        <datalist id="flight-from-options">
                          {getUniqueFlightDepartures().map((airport) => (
                            <option
                              key={airport.code || airport.city}
                              value={airport.code || airport.city}
                              label={`${airport.city} - ${airport.airport}`}
                            />
                          ))}
                        </datalist>

                        <p>
                          {flightFrom
                            ? getAirportSubText(flightFrom)
                            : 'Все аэропорты'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="flight-swap-button"
                      onClick={handleSwapFlight}
                    >
                      ⇄
                    </button>

                    <div className="flight-route-field">
                      <span className="flight-field-icon">🛬</span>

                      <div>
                        <input
                          list="flight-to-options"
                          value={
                            flightToTyping
                              ? flightTo
                              : flightTo
                                ? getAirportDisplayText(flightTo)
                                : ''
                          }
                          onFocus={() => setFlightToTyping(true)}
                          onBlur={() => {
                            const airport = getAirportInfo(flightTo);
                            setFlightTo(airport.code || flightTo);
                            setFlightToTyping(false);
                          }}
                          onChange={(e) => setFlightTo(e.target.value)}
                          placeholder="Город или аэропорт"
                        />

                        <datalist id="flight-to-options">
                          {getUniqueFlightArrivals().map((airport) => (
                            <option
                              key={airport.code || airport.city}
                              value={airport.code || airport.city}
                              label={`${airport.city} - ${airport.airport}`}
                            />
                          ))}
                        </datalist>

                        <p>
                          {flightTo
                            ? getAirportSubText(flightTo)
                            : 'Аэропорт / Город'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flight-date-card">
                    <div
                      className="flight-date-field"
                      onClick={() => openDatePicker(flightDepartureInputRef)}
                    >
                      <span>🗓</span>
                      <strong>{formatFlightDate(flightDepartDate)}</strong>

                      <input
                        ref={flightDepartureInputRef}
                        type="date"
                        value={flightDepartDate}
                        onChange={(e) => setFlightDepartDate(e.target.value)}
                      />
                    </div>

                    <div
                      className={`flight-date-field ${
                        !returnDateEnabled ? 'disabled' : ''
                      }`}
                      onClick={() => {
                        if (returnDateEnabled) {
                          openDatePicker(flightReturnInputRef);
                        }
                      }}
                    >
                      <span>🗓</span>
                      <strong>
                        {returnDateEnabled
                          ? formatFlightDate(flightReturnDate)
                          : 'Без обратного рейса'}
                      </strong>

                      <input
                        ref={flightReturnInputRef}
                        type="date"
                        value={flightReturnDate}
                        disabled={!returnDateEnabled}
                        onChange={(e) => setFlightReturnDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="flight-search-orange-btn"
                    onClick={handleFlightSearch}
                  >
                    🔍
                  </button>
                </div>
              </div>
            ) : activeService === 'tours' ? (
              <div className="tour-search-pro">
                <div className="tour-radio-group">
                  <label className="tour-radio-item">
                    <input
                      type="radio"
                      name="tourArea"
                      value="domestic"
                      checked={tourArea === 'domestic'}
                      onChange={() => handleTourAreaChange('domestic')}
                    />
                    <span>По стране</span>
                  </label>

                  <label className="tour-radio-item">
                    <input
                      type="radio"
                      name="tourArea"
                      value="international"
                      checked={tourArea === 'international'}
                      onChange={() => handleTourAreaChange('international')}
                    />
                    <span>За границу</span>
                  </label>
                </div>

                <div className="tour-search-main-row">
                  <div className="tour-search-field tour-departure-field">
                    <div className="tour-field-icon">🛫</div>

                    <div className="tour-field-content">
                      <label>Пункт отправления</label>

                      <div className="tour-input-with-clear">
                        <input
                          type="text"
                          value={tourDeparture}
                          onChange={(e) => setTourDeparture(e.target.value)}
                          placeholder="Все"
                        />

                        {tourDeparture && (
                          <button
                            type="button"
                            onClick={() => setTourDeparture('')}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="tour-search-field">
                    <div className="tour-field-icon">🛬</div>

                    <div className="tour-field-content">
                      <label>Направление</label>

                      <input
                        type="text"
                        value={tourDestination}
                        onChange={(e) => setTourDestination(e.target.value)}
                        placeholder="Любое направление..."
                      />
                    </div>
                  </div>

                  <div className="tour-search-field tour-date-field">
                    <div className="tour-field-icon">📅</div>

                    <div className="tour-field-content">
                      <label>Дата поездки</label>

                      <input
                        type="date"
                        value={tourDate}
                        onChange={(e) => setTourDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="tour-search-btn"
                    onClick={handleTourSearch}
                  >
                    🔍 <span>Искать</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bp-search-box">
                <div className="bp-field bp-field-large">
                  <div className="bp-location-wrapper">
                    <div className="bp-input">
                      <span>📍</span>
                      <input
                        value={keyword}
                        onFocus={() => setShowSuggestions(true)}
                        onChange={(e) => {
                          setKeyword(e.target.value);
                          setShowSuggestions(true);
                        }}
                        placeholder={serviceConfig[activeService].placeholder}
                      />
                    </div>

                    {showSuggestions && (
                      <div className="bp-suggestion-box">
                        {suggestionLoading ? (
                          <div className="bp-suggestion-empty">
                            Загрузка подсказок...
                          </div>
                        ) : suggestions.length > 0 ? (
                          suggestions.map((item, index) => (
                            <button
                              type="button"
                              key={index}
                              className="bp-suggestion-item"
                              onMouseDown={() => {
                                setKeyword(item.value || item.name);
                                setShowSuggestions(false);
                              }}
                            >
                              <div className="bp-suggestion-left">
                                <strong>{item.name}</strong>
                                <span>{item.location}</span>
                              </div>

                              <div className="bp-suggestion-right">
                                <span>{item.type}</span>
                                <small>{item.count}</small>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="bp-suggestion-empty">
                            Подходящие варианты не найдены
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bp-field">
                  <label>
                    {activeService === 'hotels'
                      ? 'Заезд / Выезд'
                      : 'Дата поездки'}
                  </label>

                  <div className="bp-input bp-date-inputs">
                    <span>📅</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bp-field">
                  <label>
                    {activeService === 'hotels' ? 'Гости и номера' : 'Пассажиры'}
                  </label>

                  <div className="bp-input bp-guest-inputs">
                    <span>👥</span>

                    <input
                      type="number"
                      min="1"
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                    />

                    <span className="bp-small-text">Взрослые</span>

                    <input
                      type="number"
                      min="0"
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                    />

                    <span className="bp-small-text">Дети</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="bp-search-btn"
                  onClick={handleSearch}
                >
                  🔍
                </button>
              </div>
            )}

            <div className="bp-trusted">
              <span>Нам доверяют</span>
              <strong>BestPrice Travel</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="bp-promo-section">
        <div className="bp-promo-banner">
          <div className="bp-promo-left">
            <div className="bp-deal-badge">ГОРЯЧЕЕ ПРЕДЛОЖЕНИЕ</div>
            <h2>5.5 EPIC SALE</h2>
            <p>Мгновенные скидки на авиабилеты, отели и туры</p>
          </div>

          <div className="bp-promo-middle">
            <div className="bp-coupon">Авиабилеты от 999K</div>
            <div className="bp-coupon">Специальные предложения на отели и туры</div>
          </div>

          <div className="bp-promo-right">
            <div className="bp-qr-box">QR</div>
            <button type="button">Смотреть акции</button>
          </div>
        </div>
      </section>

      <section className="bp-guide-section">
        <div className="bp-section-title">
          <span>🧭</span>
          <h2>Туристический справочник</h2>
        </div>

        <div className="bp-guide-grid">
          <button
            type="button"
            className="bp-guide-card"
            onClick={() => navigate('/travel-guide/bali')}
          >
            <img
              src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80"
              alt="Bali"
            />
            <div className="bp-guide-overlay">
              <h3>Bali</h3>
              <p>Индонезия</p>
            </div>
          </button>

          <button
            type="button"
            className="bp-guide-card"
            onClick={() => navigate('/travel-guide/bangkok')}
          >
            <img
              src="https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80"
              alt="Bangkok"
            />
            <div className="bp-guide-overlay">
              <h3>Bangkok</h3>
              <p>Таиланд</p>
            </div>
          </button>

          <button
            type="button"
            className="bp-guide-card"
            onClick={() => navigate('/travel-guide/seoul')}
          >
            <img
              src="https://images.unsplash.com/photo-1538669715315-155098f0fb1d?auto=format&fit=crop&w=600&q=80"
              alt="Seoul"
            />
            <div className="bp-guide-overlay">
              <h3>Seoul</h3>
              <p>Южная Корея</p>
            </div>
          </button>

          <button
            type="button"
            className="bp-guide-card"
            onClick={() => navigate('/travel-guide/istanbul')}
          >
            <img
              src="https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=600&q=80"
              alt="Istanbul"
            />
            <div className="bp-guide-overlay">
              <h3>Istanbul</h3>
              <p>Турция</p>
            </div>
          </button>

          <button
            type="button"
            className="bp-guide-card"
            onClick={() => navigate('/travel-guide/liverpool')}
          >
            <img
              src="https://www.liverpool.ac.uk/media/livacuk/redbrick/globalliver-2.jpg"
              alt="Liverpool"
            />
            <div className="bp-guide-overlay">
              <h3>Liverpool</h3>
              <p>Англия</p>
            </div>
          </button>
        </div>

        <div className="bp-see-more">
          <button type="button">Смотреть больше ›</button>
        </div>
      </section>

      <section className="bp-why-section">
        <div className="bp-why-container">
          <div className="bp-why-left">
            <h2>Почему стоит бронировать через BestPrice?</h2>

            <div className="bp-download-info">
              <h3>
                Более 50 миллионов загрузок,
                <br />
                более 1 миллиона отзывов
              </h3>

              <div className="bp-rating-row">
                <div className="bp-rating-item">
                  <span>🅰️</span>
                  <strong>4.6 ★</strong>
                </div>
                <div className="bp-rating-item">
                  <span>▶️</span>
                  <strong>4.7 ★</strong>
                </div>
              </div>

              <button type="button" className="bp-download-btn">
                Скачать приложение BestPrice ↓
              </button>
            </div>
          </div>

          <div className="bp-why-cards">
            <div className="bp-why-card">
              <div className="bp-why-icon">🧳</div>
              <h3>Все для вашего путешествия</h3>
              <p>
                От авиабилетов и проживания до туристических туров — вы можете
                выбрать полный и удобный набор услуг для поездки.
              </p>
            </div>

            <div className="bp-why-card">
              <div className="bp-why-icon">🧾</div>
              <h3>Гибкие варианты бронирования</h3>
              <p>
                Планы изменились? Вы можете проверить информацию о бронировании
                и быстро получить поддержку.
              </p>
            </div>

            <div className="bp-why-card">
              <div className="bp-why-icon">🛡️</div>
              <h3>Безопасная и удобная оплата</h3>
              <p>
                Используйте разные безопасные и быстрые способы оплаты для всех
                туристических услуг.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;