import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './pages/TourDetail.css';

const TOURS_API_URL = 'http://127.0.0.1:8000/api/tours/';
const BACKEND_URL = 'http://127.0.0.1:8000';

const fallbackImages = [
  'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
];

const defaultNoticeItems = [
  'Стоимость тура включает',
  'Стоимость тура не включает',
  'Правила стоимости для детей',
  'Условия оплаты',
  'Условия регистрации',
  'Правила изменения или отмены тура',
  'Условия отмены тура в обычные дни',
  'Условия отмены тура в праздничные дни',
  'Форс-мажорные обстоятельства',
  'Контакты',
];

const TourDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tourId } = useParams();

  const tourFromState = location.state?.tour || null;

  const [tour, setTour] = useState(tourFromState);
  const [loading, setLoading] = useState(!tourFromState);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [openNotice, setOpenNotice] = useState(null);

  const departureSectionRef = useRef(null);
  const [showDepartureSchedule, setShowDepartureSchedule] = useState(false);
  const [activeDepartureMonth, setActiveDepartureMonth] = useState('');
  const [selectedDeparture, setSelectedDeparture] = useState(null);

  useEffect(() => {
    const fetchTourDetail = async () => {
      if (tourFromState) return;

      try {
        setLoading(true);
        setError('');

        const response = await fetch(TOURS_API_URL);

        if (!response.ok) {
          throw new Error('Не удалось загрузить информацию о туре.');
        }

        const data = await response.json();

        const tourList = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : Array.isArray(data.data)
              ? data.data
              : [];

        const foundTour = tourList.find((item) => {
          return String(item.id || item.tour_id) === String(tourId);
        });

        if (!foundTour) {
          throw new Error('Подходящий тур не найден.');
        }

        setTour(foundTour);
      } catch (err) {
        console.error('Tour detail API error:', err);
        setError(err.message || 'Произошла ошибка при загрузке деталей тура.');
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetail();
  }, [tourId, tourFromState]);

  const normalizeImageUrl = (url) => {
    if (!url) return '';

    if (
      String(url).startsWith('http://') ||
      String(url).startsWith('https://')
    ) {
      return url;
    }

    if (String(url).startsWith('/')) {
      return `${BACKEND_URL}${url}`;
    }

    return url;
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

  const formatDateSlash = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateCode = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '000000';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return `${day}${month}${year}`;
  };

  const getMonthKey = (dateString) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'unknown';
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}`;
  };

  const getMonthLabel = (dateString) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'Другой месяц';
    }

    return `${date.toLocaleString('ru-RU', { month: 'long' })}\n${date.getFullYear()}`;
  };

  const addDays = (dateString, days) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      const fallback = new Date('2026-05-15');
      fallback.setDate(fallback.getDate() + days);
      return fallback.toISOString().slice(0, 10);
    }

    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  };

  const getTourName = (item) => {
    return item?.name || item?.tour_name || item?.title || 'Детали тура';
  };

  const getTourCode = (item) => {
    return (
      item?.program_code ||
      item?.tour_code ||
      item?.code ||
      (item?.id ? 'NDHAN150' : '') ||
      item?.tour_id ||
      '-'
    );
  };

  const getTourDuration = (item) => {
    return item?.duration || item?.trip_duration || item?.days || '3 дня 2 ночи';
  };

  const getTourPrice = (item) => {
    return item?.price || item?.price_from || item?.min_price || 0;
  };

  const getTourDeparture = (item) => {
    return (
      item?.departure ||
      item?.departure_point ||
      item?.start_location ||
      item?.from ||
      'Ханой'
    );
  };

  const getTourDestination = (item) => {
    return item?.destination || item?.to || item?.city || item?.location || '-';
  };

  const getTourType = (item) => {
    const text = String(
      `${item?.name || ''} ${item?.tour_name || ''} ${item?.title || ''} ${
        item?.destination || ''
      } ${item?.location || ''} ${item?.city || ''} ${item?.country || ''} ${
        item?.area || ''
      } ${item?.type || ''} ${item?.tour_type || ''} ${item?.category || ''}`
    ).toLowerCase();

    const internationalKeywords = [
      'international',
      'nước ngoài',
      'nuoc ngoai',
      'foreign',
      'oversea',
      'overseas',
      'nhat ban',
      'nhật bản',
      'japan',
      'tokyo',
      'osaka',
      'han quoc',
      'hàn quốc',
      'korea',
      'seoul',
      'chau au',
      'châu âu',
      'europe',
      'france',
      'paris',
      'italy',
      'rome',
      'switzerland',
      'thai lan',
      'thái lan',
      'thailand',
      'singapore',
      'malaysia',
      'china',
      'trung quoc',
      'trung quốc',
      'hong kong',
      'hongkong',
      'taiwan',
      'đài loan',
      'dai loan',
      'australia',
      'úc',
      'uc',
      'usa',
      'america',
      'mỹ',
      'my',
      'canada',
      'dubai',
      'uae',
    ];

    const isInternational = internationalKeywords.some((keyword) =>
      text.includes(keyword)
    );

    return isInternational ? 'Зарубежный тур' : 'Внутренний тур';
  };

  const getTourCurrency = (item) => {
    if (getTourType(item) === 'Зарубежный тур') {
      return 'USD';
    }

    return item?.currency || 'VND';
  };

  const getTourAttraction = (item) => {
    return item?.attraction || item?.sightseeing || item?.destination || '-';
  };

  const getTourCuisine = (item) => {
    return item?.cuisine || item?.food || 'По программе';
  };

  const getTourIdealTime = (item) => {
    return item?.ideal_time || item?.best_time || 'Круглый год';
  };

  const getTourTransport = (item) => {
    return (
      item?.transport ||
      item?.vehicle ||
      item?.transportation ||
      'Туристический автобус'
    );
  };

  const getTourPromotion = (item) => {
    return (
      item?.promotion ||
      item?.discount_note ||
      'Согласно действующим акциям компании'
    );
  };

  const getTourImages = (item) => {
    const apiImages =
      item?.images ||
      item?.gallery ||
      item?.image_list ||
      item?.photos ||
      [];

    const normalizedApiImages = Array.isArray(apiImages)
      ? apiImages
          .map((img) => {
            if (typeof img === 'string') return normalizeImageUrl(img);
            return normalizeImageUrl(img.image || img.url || img.src || '');
          })
          .filter(Boolean)
      : [];

    const mainImage = normalizeImageUrl(
      item?.image ||
        item?.image_url ||
        item?.thumbnail ||
        item?.cover ||
        normalizedApiImages[0] ||
        fallbackImages[0]
    );

    const images = [mainImage, ...normalizedApiImages, ...fallbackImages];

    return [...new Set(images)].slice(0, 6);
  };

  const getDepartureSchedules = (item) => {
    const apiSchedules =
      item?.departure_schedules ||
      item?.departureSchedules ||
      item?.departure_dates ||
      item?.departureDates ||
      item?.available_dates ||
      item?.schedules ||
      item?.dates ||
      [];

    if (Array.isArray(apiSchedules) && apiSchedules.length > 0) {
      return apiSchedules.map((schedule, index) => {
        const isStringSchedule = typeof schedule === 'string';

        const date = isStringSchedule
          ? schedule
          : schedule.date ||
            schedule.departure_date ||
            schedule.start_date ||
            schedule.travel_date ||
            '';

        const price = isStringSchedule
          ? getTourPrice(item)
          : schedule.price ||
            schedule.price_from ||
            schedule.sale_price ||
            getTourPrice(item);

        const code = isStringSchedule
          ? `${getTourCode(item)}-${index + 1}`
          : schedule.code ||
            schedule.schedule_code ||
            schedule.program_code ||
            `${getTourCode(item)}-${index + 1}`;

        const currency = isStringSchedule
          ? getTourCurrency(item)
          : schedule.currency || getTourCurrency(item);

        return {
          id: isStringSchedule
            ? `${getTourCode(item)}-${index}`
            : schedule.id || `${getTourCode(item)}-${index}`,
          date,
          code,
          price: parsePrice(price),
          currency,
          availableSeats: schedule.available_seats || schedule.seats_left || 4,
          monthKey: getMonthKey(date),
          monthLabel: getMonthLabel(date),
        };
      });
    }

    const baseDate =
      item?.departure_date ||
      item?.start_date ||
      item?.travel_date ||
      item?.date ||
      '2026-05-15';

    const basePrice = parsePrice(getTourPrice(item));
    const code = getTourCode(item);
    const offsets = [0, 7, 8, 14, 15];

    return offsets.map((offset, index) => {
      const date = addDays(baseDate, offset);

      return {
        id: `${code}-${index}`,
        date,
        code: `${code}-0${36 + index}-${formatDateCode(date)}XE-D`,
        price: basePrice,
        currency: getTourCurrency(item),
        availableSeats: index === 2 || index === 4 ? 3 : 4,
        monthKey: getMonthKey(date),
        monthLabel: getMonthLabel(date),
      };
    });
  };

  const getItinerary = (item) => {
    const apiItinerary =
      item?.itinerary ||
      item?.schedule ||
      item?.tour_schedule ||
      item?.program ||
      [];

    if (Array.isArray(apiItinerary) && apiItinerary.length > 0) {
      return apiItinerary.map((day, index) => {
        if (typeof day === 'string') {
          return {
            title: `День ${index + 1}: ${day}`,
            meals: 'Завтрак, обед, ужин',
          };
        }

        return {
          title:
            day.title ||
            day.name ||
            day.day_title ||
            `День ${index + 1}: Программа тура`,
          meals: day.meals || day.food || day.meal || 'Завтрак, обед, ужин',
        };
      });
    }

    const name = getTourName(item);
    const destination = getTourDestination(item);
    const departure = getTourDeparture(item);
    const text = `${name} ${destination}`.toLowerCase();

    if (
      text.includes('nhat ban') ||
      text.includes('nhật bản') ||
      text.includes('japan') ||
      text.includes('tokyo') ||
      text.includes('osaka')
    ) {
      return [
        { title: 'День 1: Ханой - Токио - Заселение в отель', meals: 'Ужин' },
        { title: 'День 2: Токио - Гора Фудзи - Деревня Ошино Хаккай', meals: 'Завтрак, обед, ужин' },
        { title: 'День 3: Токио - Асакуса - Акихабара - Шопинг', meals: 'Завтрак, обед, ужин' },
        { title: 'День 4: Токио - Свободное время для прогулок по городу', meals: 'Завтрак' },
        { title: 'День 5: Токио - Ханой', meals: 'Завтрак' },
      ];
    }

    if (
      text.includes('han quoc') ||
      text.includes('hàn quốc') ||
      text.includes('korea') ||
      text.includes('seoul')
    ) {
      return [
        { title: 'День 1: Ханой - Сеул - Остров Нами', meals: 'Ужин' },
        { title: 'День 2: Сеул - Дворец Кёнбоккун - Башня Намсан', meals: 'Завтрак, обед, ужин' },
        { title: 'День 3: Сеул - Парк Everland', meals: 'Завтрак, обед, ужин' },
        { title: 'День 4: Сеул - Мёндон - Шопинг', meals: 'Завтрак, обед' },
        { title: 'День 5: Сеул - Ханой', meals: 'Завтрак' },
      ];
    }

    if (
      text.includes('chau au') ||
      text.includes('châu âu') ||
      text.includes('europe') ||
      text.includes('france') ||
      text.includes('switzerland') ||
      text.includes('italy')
    ) {
      return [
        { title: 'День 1: Ханой - Париж', meals: 'Ужин на борту' },
        { title: 'День 2: Париж - Эйфелева башня - Триумфальная арка - Круиз по Сене', meals: 'Завтрак, обед, ужин' },
        { title: 'День 3: Париж - Дижон - Люцерн', meals: 'Завтрак, обед, ужин' },
        { title: 'День 4: Люцерн - Милан - Венеция', meals: 'Завтрак, обед, ужин' },
        { title: 'День 5: Венеция - Рим - Ханой', meals: 'Завтрак, обед' },
      ];
    }

    if (
      text.includes('sapa') ||
      text.includes('sa pa') ||
      text.includes('fansipan') ||
      text.includes('ô quy hồ') ||
      text.includes('o quy ho')
    ) {
      return [
        { title: 'День 1: Ханой - Лаокай - Сапа - Деревня Кат Кат', meals: 'Обед, ужин' },
        { title: 'День 2: Сапа - Фансипан - Небесные ворота О Куи Хо', meals: 'Завтрак, обед, ужин' },
        { title: 'День 3: Сапа - Лаокай - Ханой', meals: 'Завтрак, обед' },
      ];
    }

    if (text.includes('nha trang')) {
      return [
        { title: 'День 1: Отправление - Нячанг - Обзорная экскурсия по морскому городу', meals: 'Обед, ужин' },
        { title: 'День 2: VinWonders или островной тур в Нячанге', meals: 'Завтрак, обед, ужин' },
        { title: 'День 3: Рынок Дам - Покупка местных сувениров - Завершение тура', meals: 'Завтрак, обед' },
      ];
    }

    if (
      text.includes('hà nội') ||
      text.includes('ha noi') ||
      text.includes('hanoi')
    ) {
      return [
        { title: 'День 1: Озеро Хоанкьем - Старый квартал Ханоя - Большой собор', meals: 'Обед, ужин' },
        { title: 'День 2: Мавзолей Хо Ши Мина - Храм литературы - Пагода Чанкуок', meals: 'Завтрак, обед, ужин' },
        { title: 'День 3: Свободное время - Шопинг - Завершение тура', meals: 'Завтрак' },
      ];
    }

    if (
      text.includes('đà nẵng') ||
      text.includes('da nang') ||
      text.includes('hội an') ||
      text.includes('hoi an')
    ) {
      return [
        { title: 'День 1: Дананг - Сон Тра - Пляж Ми Кхе', meals: 'Обед, ужин' },
        { title: 'День 2: Бана Хиллс или Хойан', meals: 'Завтрак, обед, ужин' },
        { title: 'День 3: Рынок Хан - Шопинг - Завершение тура', meals: 'Завтрак, обед' },
      ];
    }

    if (text.includes('phú quốc') || text.includes('phu quoc')) {
      return [
        { title: 'День 1: Фукуок - Восточная часть острова - Динь Кау', meals: 'Обед, ужин' },
        { title: 'День 2: Южная часть острова - Канатная дорога Хон Тхом или VinWonders', meals: 'Завтрак, обед, ужин' },
        { title: 'День 3: Свободное время на пляже - Покупка сувениров - Завершение тура', meals: 'Завтрак' },
      ];
    }

    if (
      text.includes('cần thơ') ||
      text.includes('can tho') ||
      text.includes('cà mau') ||
      text.includes('ca mau') ||
      text.includes('miền tây') ||
      text.includes('mien tay')
    ) {
      return [
        { title: 'День 1: Отправление - Кантхо - Причал Нинь Киеу', meals: 'Обед, ужин' },
        { title: 'День 2: Плавучий рынок Кай Ранг - Камау - Мыс Дат Муи', meals: 'Завтрак, обед, ужин' },
        { title: 'День 3: Местная экскурсия - Завершение тура', meals: 'Завтрак, обед' },
      ];
    }

    return [
      {
        title: `День 1: ${departure} - ${destination}`,
        meals: 'Обед, ужин',
      },
      {
        title: `День 2: Экскурсия по ${destination}`,
        meals: 'Завтрак, обед, ужин',
      },
      {
        title: `День 3: ${destination} - ${departure}`,
        meals: 'Завтрак, обед',
      },
    ];
  };

  const getNoticeContent = (item, title) => {
    const apiMap = {
      'Стоимость тура включает':
        item?.included || item?.price_include || item?.include || '',
      'Стоимость тура не включает':
        item?.excluded || item?.price_exclude || item?.exclude || '',
      'Правила стоимости для детей':
        item?.children_policy || item?.child_policy || '',
      'Условия оплаты':
        item?.payment_terms || item?.payment_condition || '',
      'Условия регистрации':
        item?.registration_terms || item?.register_condition || '',
      'Правила изменения или отмены тура':
        item?.change_cancel_note || item?.cancel_note || '',
      'Условия отмены тура в обычные дни':
        item?.normal_cancel_policy || '',
      'Условия отмены тура в праздничные дни':
        item?.holiday_cancel_policy || '',
      'Форс-мажорные обстоятельства': item?.force_majeure || '',
      'Контакты': item?.contact || item?.hotline || '',
    };

    if (apiMap[title]) return apiMap[title];

    const fallbackMap = {
      'Стоимость тура включает': `• Туристический транспорт 16, 29, 35 или 45 мест в зависимости от количества гостей
• Русско-/вьетнамскоговорящий гид по маршруту
• Номера в отеле 3 или 4 звезды в зависимости от выбранного пакета
• Питание по программе
• Входные билеты по программе
• Подарки по программе
• Туристическая страховка
• Минеральная вода: 01 бутылка 0,5 л/день/гость
• НДС согласно действующим правилам.`,

      'Стоимость тура не включает': `• Личные расходы: питание вне программы, прачечная, доплата за одноместный номер...
• Дополнительные экскурсии вне программы.
• Доплата за одноместный номер.
• Чаевые гиду и водителю. Не являются обязательными.`,

      'Правила стоимости для детей': `- Дети до 5 лет: бесплатно, родители самостоятельно оплачивают возможные дополнительные расходы.
- Дети от 5 до 12 лет: 50% стоимости взрослого тура, без отдельной кровати.
- Дети от 12 лет: 100% стоимости как для взрослого.`,

      'Условия оплаты': `- При регистрации требуется предоплата 50% стоимости тура.
- Оставшаяся сумма оплачивается за 7-10 дней до отправления для обычных туров; за 20-25 дней до отправления для праздничных туров.`,

      'Условия регистрации': `- Все участники тура должны иметь действующий документ, удостоверяющий личность, или паспорт.
- Для зарубежных туров паспорт должен быть действителен в соответствии с требованиями страны назначения.`,

      'Правила изменения или отмены тура': `После оплаты, если клиент хочет отменить тур, необходимо обратиться в офис с документом и квитанцией об оплате. Отмена по телефону не принимается.
- Срок отмены рассчитывается по рабочим дням, без учета субботы, воскресенья и праздничных дней.
- Опоздание на рейс считается отменой тура за 1 день до отправления.`,

      'Условия отмены тура в обычные дни': `- Отмена после регистрации: штраф 10% стоимости тура.
- Отмена за 15 дней до отправления: штраф 50% стоимости тура.
- Отмена за 05 дней до отправления: штраф 70% стоимости тура.
- Отмена за 02 дня до отправления: штраф 100% стоимости тура.`,

      'Условия отмены тура в праздничные дни': `- Отмена после регистрации: штраф 10% стоимости тура.
- Отмена за 30 дней до отправления: штраф 50% стоимости тура.
- Отмена за 20 дней до отправления: штраф 70% стоимости тура.
- Отмена за 10 дней до отправления: штраф 100% стоимости тура.`,

      'Форс-мажорные обстоятельства': `ДОПОЛНИТЕЛЬНЫЕ ПРИМЕЧАНИЯ:
- Пожалуйста, возьмите с собой оригинал действующего документа или паспорта.
- Иностранным гражданам необходимо иметь все необходимые документы.
- Гостям от 70 до 75 лет необходимо подписать подтверждение состояния здоровья.
- Беременным клиентам необходимо сообщить об этом сотруднику при регистрации.
- В случае форс-мажора, включая погоду, стихийные бедствия, беспорядки, войну, эпидемии, задержку или отмену рейса, компания окажет поддержку в соответствии с фактической ситуацией и действующими правилами.`,

      'Контакты':
        'Пожалуйста, свяжитесь со службой поддержки BestPrice Travel для получения консультации по программе, стоимости тура и условиям бронирования.',
    };

    return fallbackMap[title] || 'Информация обновляется.';
  };

  const tourImages = useMemo(() => getTourImages(tour), [tour]);
  const itinerary = useMemo(() => getItinerary(tour), [tour]);
  const departureSchedules = useMemo(() => getDepartureSchedules(tour), [tour]);

  const departureMonths = useMemo(() => {
    const map = new Map();

    departureSchedules.forEach((schedule) => {
      if (!map.has(schedule.monthKey)) {
        map.set(schedule.monthKey, {
          key: schedule.monthKey,
          label: schedule.monthLabel,
        });
      }
    });

    return Array.from(map.values());
  }, [departureSchedules]);

  const visibleDepartureSchedules = useMemo(() => {
    if (!activeDepartureMonth) return departureSchedules;

    return departureSchedules.filter(
      (schedule) => schedule.monthKey === activeDepartureMonth
    );
  }, [departureSchedules, activeDepartureMonth]);

  useEffect(() => {
    if (departureMonths.length > 0 && !activeDepartureMonth) {
      setActiveDepartureMonth(departureMonths[0].key);
    }
  }, [departureMonths, activeDepartureMonth]);

  const handleChooseDate = () => {
    setShowDepartureSchedule(true);

    setTimeout(() => {
      departureSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  };

  const handleMoveMonth = (direction) => {
    if (departureMonths.length === 0) return;

    const currentIndex = departureMonths.findIndex(
      (month) => month.key === activeDepartureMonth
    );

    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= departureMonths.length) return;

    setActiveDepartureMonth(departureMonths[nextIndex].key);
  };

  const handleSelectDeparture = (schedule) => {
    setSelectedDeparture(schedule);

    setTimeout(() => {
      window.scrollTo({
        top: 180,
        behavior: 'smooth',
      });
    }, 100);
  };

  const handleBookSelectedDeparture = () => {
    if (!selectedDeparture) {
      alert('Пожалуйста, сначала выберите дату отправления.');
      return;
    }

    navigate('/payment', {
      state: {
        tour: {
          ...tour,
          id: tour?.id || tour?.tour_id,
          name: getTourName(tour),
          price: parsePrice(selectedDeparture.price),
          currency: selectedDeparture.currency || getTourCurrency(tour),
          image: tourImages[0],
          destination: getTourDestination(tour),
          departure: getTourDeparture(tour),
          duration: getTourDuration(tour),
          selectedDepartureDate: selectedDeparture.date,
          selectedDepartureCode: selectedDeparture.code,
          selectedAvailableSeats: selectedDeparture.availableSeats || 4,
          esg_score: tour?.esg_score || tour?.esg || 86,
          lei_score: tour?.lei_score || tour?.lei || 71,
        },
        bookingInfo: {
          departureDate: selectedDeparture.date,
          departureCode: selectedDeparture.code,
          price: selectedDeparture.price,
          currency: selectedDeparture.currency || getTourCurrency(tour),
          availableSeats: selectedDeparture.availableSeats || 4,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="tour-detail-page">
        <div className="tour-detail-state">Загрузка деталей тура...</div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="tour-detail-page">
        <div className="tour-detail-state">
          <p>{error || 'Информация о туре не найдена.'}</p>

          <button type="button" onClick={() => navigate('/')}>
            Вернуться к списку туров
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tour-detail-page">
      <div className="td-container">
        <div className="td-breadcrumb">
          Туризм / {getTourType(tour)} / {getTourDestination(tour)} /{' '}
          <span>{getTourName(tour)}</span>
        </div>

        <section className="td-title-card">
          <h1>🏆 {getTourName(tour)}</h1>
        </section>

        <section className="td-hero-grid">
          <div className="td-gallery-card">
            <div className="td-main-image-wrap">
              <img src={tourImages[activeImage]} alt={getTourName(tour)} />

              <div className="td-esg-logo">
                ESG
                <br />
                LEI
              </div>

              <div className="td-score-badge">
                <span>ESG: {tour?.esg_score || tour?.esg || 86}</span>
                <span>|</span>
                <span>LEI: {tour?.lei_score || tour?.lei || 71}</span>
              </div>
            </div>

            <div className="td-thumb-row">
              {tourImages.slice(0, 5).map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={activeImage === index ? 'active' : ''}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt={`${getTourName(tour)} ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          <aside className={`td-price-card ${selectedDeparture ? 'selected' : ''}`}>
            {selectedDeparture ? (
              <>
                <div className="td-selected-price-top">
                  <div>
                    <span>Цена:</span>
                    <strong>
                      {formatPrice(
                        selectedDeparture.price,
                        selectedDeparture.currency || getTourCurrency(tour)
                      )}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="td-selected-date-pill"
                    onClick={handleChooseDate}
                  >
                    {formatDateSlash(selectedDeparture.date)} ✎
                  </button>
                </div>

                <div className="td-selected-info-list">
                  <div className="td-selected-info-row">
                    <span>🎫 Код тура:</span>
                    <strong>{selectedDeparture.code}</strong>
                  </div>

                  <div className="td-selected-info-row">
                    <span>📍 Отправление:</span>
                    <strong>{getTourDeparture(tour)}</strong>
                  </div>

                  <div className="td-selected-info-row">
                    <span>⏱ Длительность:</span>
                    <strong>{getTourDuration(tour)}</strong>
                  </div>

                  <div className="td-selected-info-row">
                    <span>💺 Осталось мест:</span>
                    <strong>Осталось {selectedDeparture.availableSeats || 4} мест</strong>
                  </div>

                  <div className="td-selected-info-row">
                    <span>♻️ Индексы:</span>
                    <strong>
                      LEI: {tour?.lei_score || tour?.lei || 71}/100 | ESG:{' '}
                      {tour?.esg_score || tour?.esg || 86}/100
                    </strong>
                  </div>
                </div>

                <div className="td-selected-action-row">
                  <button type="button" className="td-call-btn">
                    📞
                  </button>

                  <button
                    type="button"
                    className="td-book-now-btn"
                    onClick={handleBookSelectedDeparture}
                  >
                    Забронировать
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="td-info-line">
                  <span>▣ Код программы:</span>
                  <strong>{getTourCode(tour)}</strong>
                </div>

                <div className="td-info-line">
                  <span>⏱ Длительность:</span>
                  <strong>{getTourDuration(tour)}</strong>
                </div>

                <div className="td-price-row">
                  <span>Цена от:</span>
                  <strong>
                    {formatPrice(getTourPrice(tour), getTourCurrency(tour))}
                  </strong>
                </div>

                <div className="td-action-row">
                  <button type="button" className="td-call-btn">
                    📞
                  </button>

                  <button
                    type="button"
                    className="td-choose-btn"
                    onClick={handleChooseDate}
                  >
                    Выбрать дату
                  </button>
                </div>
              </>
            )}
          </aside>
        </section>

        {showDepartureSchedule && (
          <section className="td-departure-section" ref={departureSectionRef}>
            <h2>График отправлений</h2>

            <div className="td-month-tabs">
              <button
                type="button"
                className="td-month-arrow"
                onClick={() => handleMoveMonth(-1)}
              >
                ‹
              </button>

              {departureMonths.map((month) => (
                <button
                  type="button"
                  key={month.key}
                  className={`td-month-tab ${
                    activeDepartureMonth === month.key ? 'active' : ''
                  }`}
                  onClick={() => setActiveDepartureMonth(month.key)}
                >
                  {month.label.split('\n').map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </button>
              ))}

              <button
                type="button"
                className="td-month-arrow active"
                onClick={() => handleMoveMonth(1)}
              >
                ›
              </button>
            </div>

            <div className="td-departure-list">
              {visibleDepartureSchedules.map((schedule) => (
                <div className="td-departure-row" key={schedule.id}>
                  <div className="td-departure-date">
                    {formatDateSlash(schedule.date)}
                  </div>

                  <div className="td-departure-code">🎫 {schedule.code}</div>

                  <div className="td-departure-price">
                    {formatPrice(schedule.price, schedule.currency)}
                  </div>

                  <button
                    type="button"
                    className="td-departure-select-btn"
                    onClick={() => handleSelectDeparture(schedule)}
                  >
                    Выбрать
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="td-extra-section">
          <h2>Дополнительная информация о поездке</h2>

          <div className="td-extra-grid">
            <div className="td-extra-card">
              <span>🫧</span>
              <div>
                <strong>Достопримечательности</strong>
                <p>{getTourAttraction(tour)}</p>
              </div>
            </div>

            <div className="td-extra-card">
              <span>🍽️</span>
              <div>
                <strong>Питание</strong>
                <p>{getTourCuisine(tour)}</p>
              </div>
            </div>

            <div className="td-extra-card">
              <span>🗓️</span>
              <div>
                <strong>Лучшее время</strong>
                <p>{getTourIdealTime(tour)}</p>
              </div>
            </div>

            <div className="td-extra-card">
              <span>✈️</span>
              <div>
                <strong>Транспорт</strong>
                <p>{getTourTransport(tour)}</p>
              </div>
            </div>

            <div className="td-extra-card">
              <span>🎁</span>
              <div>
                <strong>Акции</strong>
                <p>{getTourPromotion(tour)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="td-itinerary-section">
          <h2>Программа тура</h2>

          <div className="td-itinerary-card">
            {itinerary.map((item, index) => (
              <div className="td-itinerary-row" key={`${item.title}-${index}`}>
                <div>
                  <strong>{item.title}</strong>
                  <p>🍴 {item.meals}</p>
                </div>

                <span>›</span>
              </div>
            ))}
          </div>
        </section>

        <section className="td-notice-section">
          <h2>Важная информация</h2>

          <div className="td-notice-card">
            {defaultNoticeItems.map((title, index) => (
              <div className="td-notice-item" key={title}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenNotice(openNotice === index ? null : index)
                  }
                >
                  <strong>{title}</strong>
                  <span>{openNotice === index ? '⌃' : '⌄'}</span>
                </button>

                {openNotice === index && (
                  <p>{getNoticeContent(tour, title)}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TourDetail;