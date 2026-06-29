import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './pages/TravelGuideDetail.css';

const guideData = {
  bali: {
    name: 'Bali',
    country: 'Индонезия',
    region: 'Азия',
    heroImages: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1400&q=80',
    ],
    intro: [
      'Остров Бали, жемчужина Индонезии, расположен посреди Индийского океана и славится теплым тропическим климатом круглый год. Он привлекает путешественников не только прекрасными пляжами, но и богатой культурой, гостеприимными людьми и разнообразной кухней.',
      'Бали также известен традиционными фестивалями, искусством резьбы по дереву и популярными водными видами спорта, такими как дайвинг и серфинг. Это направление подходит для отдыха, знакомства с культурой и природных впечатлений.',
    ],
    attractions: [
      {
        name: 'Пляж Кута',
        image:
          'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Пляж Семиньяк',
        image:
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Пляж Санур',
        image:
          'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80',
      },
    ],
    destinations: [
      {
        name: 'Район Бадунг',
        image:
          'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Kuta',
        image:
          'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Denpasar',
        image:
          'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=900&q=80',
      },
    ],
    articles: [
      {
        title: 'Бали в марте: полезный опыт для первой поездки',
        author: 'Thao Nguyen',
        image:
          'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Бали в сентябре: золотой сезон райского острова',
        author: 'Thao Nguyen',
        image:
          'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Как добраться из аэропорта Нгурах-Рай в центр',
        author: 'Nguyễn Thụy Mộc Nhiên',
        image:
          'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Полный гид: как удобно добраться с Бали до Гили Эйр',
        author: 'Traveloka Team',
        image:
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
      },
    ],
    tips: {
      title: 'Советы для поездки на Бали',
      subtitle: 'Что нужно знать перед путешествием',
      tabs: [
        {
          name: 'Автобус',
          content:
            'Это популярный и недорогой общественный транспорт для перемещения по острову. Однако качество сервиса и расписание могут быть не всегда стабильными.',
        },
        {
          name: 'Аренда скутера',
          content:
            'Аренда скутера — гибкий способ исследовать Бали. Рекомендуется проверить наличие международных водительских прав, носить шлем и не ездить далеко ночью.',
        },
        {
          name: 'Такси',
          content:
            'Такси удобно для поездок группой или перемещения по городу. Лучше выбирать надежные службы такси или приложения, чтобы избежать завышенных цен.',
        },
      ],
    },
  },

  bangkok: {
    name: 'Bangkok',
    country: 'Таиланд',
    region: 'Азия',
    heroImages: [
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1400&q=80',
    ],
    intro: [
      'Бангкок — оживленная столица Таиланда, известная золотыми храмами, крупными торговыми центрами, шумными ночными рынками и привлекательной уличной едой.',
      'Этот город подходит путешественникам, которые любят культуру, шопинг, ночную жизнь и тайскую кухню.',
    ],
    attractions: [
      {
        name: 'Grand Palace',
        image:
          'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Wat Arun',
        image:
          'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Ночной рынок Бангкока',
        image:
          'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80',
      },
    ],
    destinations: [
      {
        name: 'Siam',
        image:
          'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Sukhumvit',
        image:
          'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Chinatown',
        image:
          'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?auto=format&fit=crop&w=900&q=80',
      },
    ],
    articles: [
      {
        title: 'Что попробовать в Бангкоке? Список популярных блюд',
        author: 'BestPrice Team',
        image:
          'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Бангкок впервые: полезный опыт для новичков',
        author: 'Travel Guide',
        image:
          'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Самые известные ночные рынки Бангкока',
        author: 'BestPrice Team',
        image:
          'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Маршрут по Бангкоку на 4 дня и 3 ночи',
        author: 'Traveloka Team',
        image:
          'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80',
      },
    ],
    tips: {
      title: 'Советы для поездки в Бангкок',
      subtitle: 'Что нужно знать перед путешествием',
      tabs: [
        {
          name: 'BTS/MRT',
          content:
            'BTS и MRT — быстрый способ передвижения без пробок. Они удобны для поездок в основные торговые районы, такие как Siam, Sukhumvit или Chatuchak.',
        },
        {
          name: 'Такси',
          content:
            'Лучше попросить водителя включить счетчик или использовать приложение, чтобы цена была прозрачной.',
        },
        {
          name: 'Тук-тук',
          content:
            'Тук-тук подходит для коротких поездок в центре и как местный опыт. Стоимость лучше уточнять до посадки.',
        },
      ],
    },
  },

  seoul: {
    name: 'Seoul',
    country: 'Южная Корея',
    region: 'Азия',
    heroImages: [
      'https://images.unsplash.com/photo-1538669715315-155098f0fb1d?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1400&q=80',
    ],
    intro: [
      'Сеул — современная столица Южной Кореи, где традиционная культура сочетается с динамичной городской жизнью. Город известен древними дворцами, торговыми районами, уличной едой и волной K-pop.',
      'В Сеуле можно посетить дворец Кёнбоккун, башню Намсан, Мёндон, Хондэ и множество стильных корейских кафе.',
    ],
    attractions: [
      {
        name: 'Дворец Кёнбоккун',
        image:
          'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Башня Намсан',
        image:
          'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Myeongdong',
        image:
          'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=900&q=80',
      },
    ],
    destinations: [
      {
        name: 'Hongdae',
        image:
          'https://images.unsplash.com/photo-1538669715315-155098f0fb1d?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Gangnam',
        image:
          'https://images.unsplash.com/photo-1506816561089-5cc37b3aa9b0?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Bukchon Hanok Village',
        image:
          'https://images.unsplash.com/photo-1570259013788-7a0d4ee8f1ab?auto=format&fit=crop&w=900&q=80',
      },
    ],
    articles: [
      {
        title: 'Сеул на 5 дней и 4 ночи для первой поездки',
        author: 'BestPrice Team',
        image:
          'https://images.unsplash.com/photo-1538669715315-155098f0fb1d?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Что поесть в Сеуле? Корейские блюда, которые стоит попробовать',
        author: 'Travel Guide',
        image:
          'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Шопинг в Мёндоне: полезные советы',
        author: 'BestPrice Team',
        image:
          'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Лучшие места для фотографий в Сеуле',
        author: 'Traveloka Team',
        image:
          'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=900&q=80',
      },
    ],
    tips: {
      title: 'Советы для поездки в Сеул',
      subtitle: 'Что нужно знать перед путешествием',
      tabs: [
        {
          name: 'Метро',
          content:
            'Метро Сеула очень удобное, чистое и соединяет большинство крупных достопримечательностей. Для поездок лучше использовать карту T-money.',
        },
        {
          name: 'Автобус',
          content:
            'Автобус удобен для районов, которые находятся далеко от станций метро. Перед поездкой лучше проверить маршрут на карте.',
        },
        {
          name: 'Такси',
          content:
            'Такси в Сеуле достаточно безопасное. Но в часы пик поймать машину может быть сложно, а стоимость выше, чем у метро.',
        },
      ],
    },
  },

  istanbul: {
    name: 'Istanbul',
    country: 'Турция',
    region: 'Европа - Азия',
    heroImages: [
      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1589561454226-796a8aa89b05?auto=format&fit=crop&w=1400&q=80',
    ],
    intro: [
      'Стамбул — уникальный город между Европой и Азией, известный древней историей, великолепной исламской архитектурой, традиционными рынками и живописным проливом Босфор.',
      'Это идеальное направление для тех, кто любит культуру, историю, ближневосточную кухню и городские пейзажи, где старина сочетается с современностью.',
    ],
    attractions: [
      {
        name: 'Hagia Sophia',
        image:
          'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Blue Mosque',
        image:
          'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Grand Bazaar',
        image:
          'https://images.unsplash.com/photo-1589561454226-796a8aa89b05?auto=format&fit=crop&w=900&q=80',
      },
    ],
    destinations: [
      {
        name: 'Sultanahmet',
        image:
          'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Bosphorus',
        image:
          'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Taksim',
        image:
          'https://images.unsplash.com/photo-1589561454226-796a8aa89b05?auto=format&fit=crop&w=900&q=80',
      },
    ],
    articles: [
      {
        title: 'Стамбул: город между двумя континентами',
        author: 'BestPrice Team',
        image:
          'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Главные достопримечательности Стамбула',
        author: 'Travel Guide',
        image:
          'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Что попробовать в Стамбуле?',
        author: 'BestPrice Team',
        image:
          'https://images.unsplash.com/photo-1589561454226-796a8aa89b05?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Гранд-базар для первой поездки: полезные советы',
        author: 'Traveloka Team',
        image:
          'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=900&q=80',
      },
    ],
    tips: {
      title: 'Советы для поездки в Стамбул',
      subtitle: 'Что нужно знать перед путешествием',
      tabs: [
        {
          name: 'Трамвай',
          content:
            'Трамвай удобен для поездок к известным достопримечательностям, таким как Султанахмет, Айя-София и Гранд-базар.',
        },
        {
          name: 'Паром по Босфору',
          content:
            'Паром по Босфору — один из лучших способов увидеть Стамбул с воды.',
        },
        {
          name: 'Такси',
          content:
            'Такси может быть удобным, но лучше заранее проверить цену или пользоваться приложением, чтобы избежать завышенной стоимости.',
        },
      ],
    },
  },

  liverpool: {
    name: 'Liverpool',
    country: 'Англия',
    region: 'Европа',
    heroImages: [
      'https://www.liverpool.ac.uk/media/livacuk/redbrick/globalliver-2.jpg',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=1400&q=80',
    ],
    intro: [
      'Ливерпуль — известный портовый город Англии, связанный с музыкой, футболом и морским наследием. Это родина The Beatles и привлекательное направление для любителей британской культуры.',
      'Путешественники могут посетить Albert Dock, музей The Beatles Story, стадион Anfield и оживленные творческие районы города.',
    ],
    attractions: [
      {
        name: 'Albert Dock',
        image:
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/b5/a4/db/albert-dock-view-on-the.jpg?w=900&h=500&s=1',
      },
      {
        name: 'Anfield Stadium',
        image:
          'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'The Beatles Story',
        image:
          'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
      },
    ],
    destinations: [
      {
        name: 'Albert Dock',
        image:
          'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/08/b5/a4/db/albert-dock-view-on-the.jpg?w=900&h=500&s=1',
      },
      {
        name: 'City Centre',
        image:
          'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
      },
      {
        name: 'Anfield',
        image:
          'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=80',
      },
    ],
    articles: [
      {
        title: 'Ливерпуль: город футбола и музыки',
        author: 'BestPrice Team',
        image:
          'https://www.liverpool.ac.uk/media/livacuk/redbrick/globalliver-2.jpg',
      },
      {
        title: 'Посещение стадиона Anfield: полезные советы',
        author: 'Travel Guide',
        image:
          'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Места, связанные с The Beatles в Ливерпуле',
        author: 'BestPrice Team',
        image:
          'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80',
      },
      {
        title: 'Ливерпуль за 2 дня для первой поездки',
        author: 'Traveloka Team',
        image:
          'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=900&q=80',
      },
    ],
    tips: {
      title: 'Советы для поездки в Ливерпуль',
      subtitle: 'Что нужно знать перед путешествием',
      tabs: [
        {
          name: 'Автобус',
          content:
            'Автобус — популярный способ передвижения по Ливерпулю, удобный для коротких городских маршрутов.',
        },
        {
          name: 'Поезд',
          content:
            'Поезд подойдет, если вы хотите поехать из Ливерпуля в другие города, например Манчестер или Лондон.',
        },
        {
          name: 'Пешком',
          content:
            'Центр Ливерпуля удобно исследовать пешком, особенно район Albert Dock и достопримечательности вокруг центра.',
        },
      ],
    },
  },
};

const defaultGuide = guideData.bali;

function TravelGuideDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [activeTip, setActiveTip] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  const guide = useMemo(() => {
    return guideData[slug] || defaultGuide;
  }, [slug]);

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

  const currentUserName =
    currentUser?.fullName ||
    currentUser?.name ||
    currentUser?.username ||
    currentUser?.email ||
    'Выполнен вход';

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/');
  };

  const articles =
    guide.articles && guide.articles.length > 0
      ? guide.articles
      : defaultGuide.articles;

  return (
    <div className="travel-guide-page">
      <header className="tg-header">
        <Link to="/" className="tg-logo">
          BestPrice<span>✈</span>
        </Link>

        <div className="tg-header-spacer" />

        <div className="tg-actions">
          <span>🇷🇺 RUB | RU</span>
          <span>💚 Акции</span>
          <Link to="/my-bookings">Мои бронирования</Link>

          {currentUser ? (
            <>
              <Link to="/my-bookings" className="tg-user-badge">
                👤 {currentUserName}
              </Link>

              <button
                type="button"
                className="tg-logout-btn"
                onClick={handleLogout}
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="tg-login">
                Войти
              </Link>

              <Link to="/signup" className="tg-register">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="tg-hero-gallery">
        <div className="tg-hero-main">
          <img src={guide.heroImages[0]} alt={guide.name} />
        </div>

        <div className="tg-hero-side">
          <img src={guide.heroImages[1]} alt={guide.name} />

          <div className="tg-hero-bottom">
            <img src={guide.heroImages[2]} alt={guide.name} />
            <button type="button">Смотреть все фото</button>
          </div>
        </div>
      </section>

      <main className="tg-container">
        <section className="tg-intro">
          <div className="tg-title-row">
            <div>
              <h1>{guide.name}</h1>

              <div className="tg-breadcrumb">
                <Link to="/">{guide.region}</Link>
                <span>/</span>
                <Link to="/">{guide.country}</Link>
                <span>/</span>
                <strong>{guide.name}</strong>
              </div>
            </div>

            <div className="tg-search-box">
              🔍
              <input placeholder="Найти место, например Tokyo" />
            </div>
          </div>

          {guide.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          <button type="button" className="tg-see-less">
            Свернуть
          </button>
        </section>

        <section className="tg-section">
          <div className="tg-section-heading">
            <div className="tg-section-icon">💡</div>

            <div>
              <h2>Узнайте больше о {guide.name}</h2>
              <p>Посетите главные места этого направления</p>
            </div>
          </div>

          <h3>Популярные достопримечательности {guide.name}</h3>

          <div className="tg-card-grid tg-card-grid-3">
            {guide.attractions.map((item) => (
              <article className="tg-place-card" key={item.name}>
                <img src={item.image} alt={item.name} />
                <div>{item.name}</div>
              </article>
            ))}
          </div>

          <h3>Популярные районы и места в {guide.name}</h3>

          <div className="tg-card-grid tg-card-grid-3">
            {guide.destinations.map((item) => (
              <article className="tg-destination-card" key={item.name}>
                <img src={item.image} alt={item.name} />
                <strong>{item.name}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="tg-section">
          <h3>Вдохновляющие статьи о путешествии в {guide.name}</h3>

          <div className="tg-card-grid tg-card-grid-4">
            {articles.map((article) => (
              <article className="tg-article-card" key={article.title}>
                <img src={article.image} alt={article.title} />

                <div>
                  <h4>{article.title}</h4>
                  <p>{article.author}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <section className="tg-tips-section">
        <div className="tg-tips-inner">
          <div className="tg-section-heading dark">
            <div className="tg-section-icon blue">🧳</div>

            <div>
              <h2>{guide.tips.title}</h2>
              <p>{guide.tips.subtitle}</p>
            </div>
          </div>

          <div className="tg-tips-content">
            <div className="tg-tip-tabs">
              <h3>Путешествие по {guide.name}</h3>
              <p>
                Гид по местному транспорту в {guide.name}
              </p>

              {guide.tips.tabs.map((tab, index) => (
                <button
                  type="button"
                  key={tab.name}
                  className={activeTip === index ? 'active' : ''}
                  onClick={() => setActiveTip(index)}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            <div className="tg-tip-panel">
              {guide.tips.tabs[activeTip]?.content}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TravelGuideDetail;