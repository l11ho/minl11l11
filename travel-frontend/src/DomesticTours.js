import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './pages/DomesticTours.css';

const TOURS_API_URL = 'http://127.0.0.1:8000/api/tours/';

const fallbackImages = [
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
];

const DomesticTours = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [departure, setDeparture] = useState(
    queryParams.get('departure') || 'Все'
  );

  const [destination, setDestination] = useState(
    queryParams.get('destination') || 'Все'
  );

  const [travelDate, setTravelDate] = useState(
    queryParams.get('date') || '2026-05-14'
  );

  const [selectedTourLines, setSelectedTourLines] = useState([]);
  const [selectedTransports, setSelectedTransports] = useState([]);
  const [sortType, setSortType] = useState('nearest');

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(TOURS_API_URL);

        if (!response.ok) {
          throw new Error('Не удалось загрузить список туров.');
        }

        const data = await response.json();

        const tourList = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : Array.isArray(data.data)
              ? data.data
              : [];

        setTours(tourList);
      } catch (err) {
        console.error('Domestic tours API error:', err);
        setError(err.message || 'Произошла ошибка при загрузке данных туров.');
        setTours([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  const normalizeText = (value = '') => {
    return String(value).trim().toLowerCase();
  };

  const parsePrice = (value) => {
    if (value === null || value === undefined) return 0;

    const cleaned = String(value).replace(/[^\d.]/g, '');
    return Number(cleaned || 0);
  };

  const formatPrice = (value, currency = 'VND') => {
    const number = parsePrice(value);

    if (String(currency).toUpperCase() === 'USD') {
      return `${number.toLocaleString('en-US')} USD`;
    }

    return `${number.toLocaleString('vi-VN')}đ`;
  };

  const formatDateVi = (dateString) => {
    if (!dateString) return 'Все';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTourName = (tour) => {
    return tour.name || tour.tour_name || tour.title || 'Внутренний тур';
  };

  const getTourDescription = (tour) => {
    return (
      tour.description ||
      tour.short_description ||
      tour.summary ||
      'Откройте для себя популярные направления вместе с BestPrice Travel.'
    );
  };

  const getTourImage = (tour, index) => {
    return (
      tour.image ||
      tour.image_url ||
      tour.thumbnail ||
      tour.cover ||
      fallbackImages[index % fallbackImages.length]
    );
  };

  const getTourDeparture = (tour) => {
    return (
      tour.departure ||
      tour.departure_point ||
      tour.start_location ||
      tour.from ||
      'Все'
    );
  };

  const getTourDestination = (tour) => {
    return (
      tour.destination ||
      tour.to ||
      tour.city ||
      tour.location ||
      'Вьетнам'
    );
  };

  const getTourDuration = (tour) => {
    return tour.duration || tour.trip_duration || tour.days || '3 дня 2 ночи';
  };

  const getTourCurrency = (tour) => {
    return tour.currency || 'VND';
  };

  const getTourLine = (tour, index) => {
    return (
      tour.tour_line ||
      tour.line ||
      tour.package_type ||
      tour.tour_class ||
      ['Эконом', 'Стандарт', 'Выгодная цена', 'Премиум'][index % 4]
    );
  };

  const getTourTransport = (tour, index) => {
    return (
      tour.transport ||
      tour.vehicle ||
      tour.transportation ||
      (index % 2 === 0 ? 'Самолет' : 'Автобус')
    );
  };

  const isDomesticTour = (tour) => {
    const text = normalizeText(
      `${tour.name || ''} ${tour.tour_name || ''} ${tour.title || ''} ${
        tour.destination || ''
      } ${tour.location || ''} ${tour.city || ''} ${tour.country || ''} ${
        tour.area || ''
      } ${tour.type || ''} ${tour.tour_type || ''} ${tour.category || ''}`
    );

    const internationalKeywords = [
      'nhat ban',
      'nhật bản',
      'japan',
      'han quoc',
      'hàn quốc',
      'korea',
      'chau au',
      'châu âu',
      'europe',
      'thai lan',
      'thái lan',
      'thailand',
      'singapore',
      'malaysia',
      'china',
      'trung quoc',
      'trung quốc',
      'hong kong',
      'taiwan',
      'đài loan',
      'dai loan',
      'uc',
      'úc',
      'australia',
      'my',
      'mỹ',
      'usa',
      'america',
      'phap',
      'pháp',
      'france',
    ];

    if (internationalKeywords.some((keyword) => text.includes(keyword))) {
      return false;
    }

    const domesticKeywords = [
      'da nang',
      'đà nẵng',
      'nha trang',
      'ha noi',
      'hà nội',
      'sapa',
      'sa pa',
      'phu quoc',
      'phú quốc',
      'can tho',
      'cần thơ',
      'ca mau',
      'cà mau',
      'chau doc',
      'châu đốc',
      'mien tay',
      'miền tây',
      'ha long',
      'hạ long',
      'quy nhon',
      'quy nhơn',
      'da lat',
      'đà lạt',
      'hue',
      'huế',
      'hoi an',
      'hội an',
      'viet nam',
      'việt nam',
      'vietnam',
      'domestic',
      'trong nước',
    ];

    return domesticKeywords.some((keyword) => text.includes(keyword));
  };

  const normalizedTours = useMemo(() => {
    return tours.filter(isDomesticTour).map((tour, index) => ({
      raw: tour,
      id: tour.id || tour.tour_id || index,
      name: getTourName(tour),
      description: getTourDescription(tour),
      image: getTourImage(tour, index),
      departure: getTourDeparture(tour),
      destination: getTourDestination(tour),
      duration: getTourDuration(tour),
      price: parsePrice(tour.price || tour.price_from || tour.min_price),
      currency: getTourCurrency(tour),
      tourLine: getTourLine(tour, index),
      transport: getTourTransport(tour, index),
      esg: tour.esg_score || tour.esg || 78 + (index % 9),
      lei: tour.lei_score || tour.lei || 70 + (index % 7),
      index,
    }));
  }, [tours]);

  const destinationOptions = useMemo(() => {
    const values = normalizedTours
      .map((tour) => tour.destination)
      .filter(Boolean);

    return ['Все', ...new Set(values)];
  }, [normalizedTours]);

  const tourLineOptions = useMemo(() => {
    const values = normalizedTours.map((tour) => tour.tourLine).filter(Boolean);
    return [...new Set(values)];
  }, [normalizedTours]);

  const transportOptions = useMemo(() => {
    const values = normalizedTours.map((tour) => tour.transport).filter(Boolean);
    return [...new Set(values)];
  }, [normalizedTours]);

  const filteredTours = useMemo(() => {
    let result = [...normalizedTours];

    if (destination && destination !== 'Все') {
      result = result.filter((tour) =>
        normalizeText(tour.destination).includes(normalizeText(destination))
      );
    }

    if (departure && departure !== 'Все') {
      result = result.filter((tour) =>
        normalizeText(tour.departure).includes(normalizeText(departure))
      );
    }

    if (selectedTourLines.length > 0) {
      result = result.filter((tour) =>
        selectedTourLines.includes(tour.tourLine)
      );
    }

    if (selectedTransports.length > 0) {
      result = result.filter((tour) =>
        selectedTransports.includes(tour.transport)
      );
    }

    if (sortType === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortType === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [
    normalizedTours,
    destination,
    departure,
    selectedTourLines,
    selectedTransports,
    sortType,
  ]);

  const handleToggleValue = (value, currentList, setList) => {
    if (currentList.includes(value)) {
      setList(currentList.filter((item) => item !== value));
    } else {
      setList([...currentList, value]);
    }
  };

  const handleResetFilter = () => {
    setDeparture('Все');
    setDestination('Все');
    setSelectedTourLines([]);
    setSelectedTransports([]);
    setSortType('nearest');
  };

  const handleViewDetail = (tour) => {
    navigate(`/tour-detail/${tour.id}`, {
      state: {
        tour: {
          ...tour.raw,
          id: tour.id,
          name: tour.name,
          price: tour.price,
          currency: tour.currency,
          image: tour.image,
          destination: tour.destination,
          departure: tour.departure,
          duration: tour.duration,
          esg_score: tour.esg,
          lei_score: tour.lei,
        },
      },
    });
  };

  const handleChangeSearch = () => {
    navigate('/');
  };

  return (
    <div className="domestic-tour-page">
      <aside className="dt-filter-sidebar">
        <div className="dt-filter-header">
          <strong>☷ Фильтр</strong>

          <button type="button" onClick={handleResetFilter}>
            Сбросить
          </button>
        </div>

        <div className="dt-filter-block">
          <label>Направление</label>

          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            {destinationOptions.map((item) => (
              <option key={item} value={item}>
                {item === 'Все' ? 'Выберите направление' : item}
              </option>
            ))}
          </select>
        </div>

        <div className="dt-filter-block">
          <div className="dt-filter-title-row">
            <label>Линия тура</label>
            <span>⌃</span>
          </div>

          {tourLineOptions.map((item) => (
            <label className="dt-checkbox-row" key={item}>
              <input
                type="checkbox"
                checked={selectedTourLines.includes(item)}
                onChange={() =>
                  handleToggleValue(
                    item,
                    selectedTourLines,
                    setSelectedTourLines
                  )
                }
              />
              <span>{item}</span>
            </label>
          ))}
        </div>

        <div className="dt-filter-block">
          <div className="dt-filter-title-row">
            <label>Транспорт</label>
            <span>⌃</span>
          </div>

          {transportOptions.map((item) => (
            <label className="dt-checkbox-row" key={item}>
              <input
                type="checkbox"
                checked={selectedTransports.includes(item)}
                onChange={() =>
                  handleToggleValue(
                    item,
                    selectedTransports,
                    setSelectedTransports
                  )
                }
              />
              <span>{item}</span>
            </label>
          ))}
        </div>

        <div className="dt-filter-block">
          <div className="dt-filter-title-row">
            <label>Бюджет</label>
            <span>⌃</span>
          </div>

          <input type="range" min="0" max="100" defaultValue="80" />

          <div className="dt-budget-row">
            <span>690.000</span>
            <span>85.990.000</span>
          </div>
        </div>
      </aside>

      <main className="dt-main">
        <section className="dt-search-summary">
          <div className="dt-summary-item dt-summary-type">
            <div className="dt-summary-icon">▾</div>

            <div>
              <label>Тип</label>
              <strong>Внутренний тур</strong>
            </div>
          </div>

          <div className="dt-summary-item">
            <label>Пункт отправления</label>
            <strong>{departure || 'Все'}</strong>
          </div>

          <div className="dt-summary-item">
            <label>Направление</label>
            <strong>{destination || 'Все'}</strong>
          </div>

          <div className="dt-summary-item">
            <label>Дата поездки</label>
            <strong>{formatDateVi(travelDate)}</strong>
          </div>

          <button
            type="button"
            className="dt-change-search-btn"
            onClick={handleChangeSearch}
          >
            🔍 Изменить поиск
          </button>
        </section>

        <section className="dt-result-header">
          <h2>
            Результаты: <span>{filteredTours.length} программ тура</span>
          </h2>

          <div className="dt-sort-row">
            <span>Сортировать по:</span>

            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
            >
              <option value="nearest">Ближайшая дата отправления</option>
              <option value="price-asc">Цена: от низкой к высокой</option>
              <option value="price-desc">Цена: от высокой к низкой</option>
            </select>

            <button type="button" className="dt-view-btn active">
              ▦
            </button>

            <button type="button" className="dt-view-btn">
              ☰
            </button>
          </div>
        </section>

        {loading ? (
          <div className="dt-state-card">Загрузка списка туров...</div>
        ) : error ? (
          <div className="dt-state-card">{error}</div>
        ) : filteredTours.length === 0 ? (
          <div className="dt-state-card">
            Не найдено внутренних туров, соответствующих текущему фильтру.
          </div>
        ) : (
          <section className="dt-tour-grid">
            {filteredTours.map((tour) => (
              <article className="dt-tour-card" key={tour.id}>
                <div className="dt-tour-image-wrap">
                  <img src={tour.image} alt={tour.name} />

                  <span
                    className={`dt-tour-badge ${
                      tour.tourLine === 'Выгодная цена' ? 'good' : ''
                    }`}
                  >
                    {tour.tourLine}
                  </span>

                  <div className="dt-score-badge">
                    <span>ESG: {tour.esg}</span>
                    <span>|</span>
                    <span>LEI: {tour.lei}</span>
                  </div>

                  <button type="button" className="dt-quick-btn">
                    ◎ Быстрый просмотр
                  </button>
                </div>

                <div className="dt-tour-body">
                  <h3>{tour.name}</h3>

                  <div className="dt-tour-meta">
                    <span>📍 {tour.departure}</span>
                    <span>⏱ {tour.duration}</span>
                  </div>

                  <p className="dt-tour-desc">{tour.description}</p>

                  <div className="dt-tour-footer">
                    <div className="dt-tour-price">
                      <span>Цена от:</span>
                      <strong>{formatPrice(tour.price, tour.currency)}</strong>
                    </div>

                    <button
                      type="button"
                      className="dt-detail-btn"
                      onClick={() => handleViewDetail(tour)}
                    >
                      Подробнее
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default DomesticTours;