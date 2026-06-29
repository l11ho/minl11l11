import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const REVIEW_API_URL = "http://127.0.0.1:8000/api/hotel-reviews/";

const fallbackImages = {
  1: "https://theempyreanhotel.com/storage/1-5.jpg",
  2: "https://img.cdn.level.travel/hotels/9081529/73b69362eeb4d7872c77d7bd0c73827a.jpg",
  3: "https://ik.imagekit.io/tvlk/apr-asset/TzEv3ZUmG4-4Dz22hvmO9NUDzw1DGCIdWl4oPtKumOg=/lodging/94000000/93840000/93839700/93839633/142b3756_z.jpg?tr=q-80,c-at_max,w-740,h-500&_src=imagekit",
};

const defaultImage =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";

const HotelDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const hotel = location.state?.hotel;
  const bookingInfo = location.state?.bookingInfo;

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  useEffect(() => {
    if (!hotel?.id) return;

    const fetchHotelReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewsError("");

        const response = await fetch(`${REVIEW_API_URL}?hotel_id=${hotel.id}`);

        if (!response.ok) {
          throw new Error("Cannot load hotel reviews.");
        }

        const data = await response.json();

        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Cannot load hotel reviews:", error);
        setReviews([]);
        setReviewsError("Не удалось загрузить реальные отзывы об отеле.");
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchHotelReviews();
  }, [hotel?.id]);

  if (!hotel || !bookingInfo) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Нет данных об отеле.</h2>

        <button
          onClick={() => navigate("/hotel-results")}
          style={{
            marginTop: "16px",
            padding: "12px 20px",
            border: "none",
            borderRadius: "10px",
            background: "#ff6b1a",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "700",
          }}
        >
          Вернуться к списку отелей
        </button>
      </div>
    );
  }

  const getHotelImage = () => {
    if (hotel.image && String(hotel.image).trim() !== "") {
      return hotel.image;
    }

    return fallbackImages[hotel.id] || defaultImage;
  };

  const availableRooms = hotel.availableRooms ?? 10;
  const hasAvailableRooms = availableRooms > 0;

  const checkIn = bookingInfo.checkIn || bookingInfo.startDate || "";
  const checkOut = bookingInfo.checkOut || bookingInfo.endDate || "";
  const guests = bookingInfo.guests || bookingInfo.adults || "2";
  const children = bookingInfo.children || "0";
  const destination = bookingInfo.location || bookingInfo.keyword || "Нячанг";

  const price = Number(hotel.price || 0).toLocaleString("vi-VN");
  const ratingFive = Number(hotel.rating || 0);
  const hotelRatingTen = ratingFive ? ratingFive * 2 : 0;

  const reviewCount = reviews.length;

  const averageReviewRating =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        reviewCount
      : null;

  const overallRating = averageReviewRating || hotelRatingTen;
  const overallRatingDisplay = overallRating
    ? Number(overallRating).toFixed(1)
    : "N/A";

  const firstReview = reviews.length > 0 ? reviews[0] : null;

  const images = [
    getHotelImage(),
    getHotelImage(),
    getHotelImage(),
    getHotelImage(),
    getHotelImage(),
  ];

  const renderStars = (rating) => {
    const fullStars = Math.round(Number(rating || 0));
    return "★".repeat(fullStars) + "☆".repeat(5 - fullStars);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("ru-RU");
    } catch (error) {
      return dateString;
    }
  };

  const getScoreAverage = (fieldName) => {
    const values = reviews
      .map((review) => Number(review[fieldName]))
      .filter((value) => !Number.isNaN(value) && value > 0);

    if (values.length === 0) return null;

    const total = values.reduce((sum, value) => sum + value, 0);
    return Number((total / values.length).toFixed(1));
  };

  const reviewScores = [
    ["Чистота", getScoreAverage("cleanliness")],
    ["Комфорт номера", getScoreAverage("room_comfort")],
    ["Питание", getScoreAverage("food")],
    ["Расположение", getScoreAverage("location_score")],
    ["Сервис и удобства", getScoreAverage("service_score")],
  ];

  const amenityGroups = [
    {
      title: "Услуги отеля",
      icon: "🛎️",
      items: [
        "Услуги носильщика",
        "Бесплатный приветственный напиток",
        "Консьерж-сервис / помощь гостям",
        "Обмен валюты",
        "Швейцар",
        "Экспресс-регистрация заезда",
        "Экспресс-регистрация выезда",
        "Стойка регистрации",
        "Круглосуточная стойка регистрации",
        "Прачечная",
        "Камера хранения багажа",
        "Многоязычный персонал",
      ],
    },
    {
      title: "Питание",
      icon: "🍽️",
      items: [
        "Ресторан с кондиционером",
        "Ужин по меню",
        "Бар",
        "Завтрак «шведский стол»",
        "Завтрак с обслуживанием за столом",
        "Континентальный завтрак",
        "Фудкорт",
        "Вегетарианское меню",
      ],
    },
    {
      title: "Общественные удобства",
      icon: "🏢",
      items: [
        "Парковка",
        "Кофе/чай в холле",
        "Кафе",
        "Ранний заезд",
        "Лифт",
        "Поздний выезд",
        "Ресторан",
        "Сейф",
        "WiFi в общественных зонах",
      ],
    },
    {
      title: "Удобства в номере",
      icon: "🚪",
      items: [
        "Халат",
        "Кабельное телевидение",
        "Рабочий стол",
        "Фен",
        "Сейф в номере",
        "Мини-бар",
        "Собственная ванная комната",
        "Душ",
      ],
    },
    {
      title: "Интернет",
      icon: "📶",
      items: [
        "Международная телефонная связь",
        "Доступ в интернет",
        "Бесплатный WiFi",
      ],
    },
    {
      title: "Дети и питомцы",
      icon: "👶",
      items: ["Детские кроватки", "Детские стульчики", "Детская игровая зона"],
    },
    {
      title: "Трансфер",
      icon: "🚐",
      items: ["Трансфер из аэропорта", "Платный трансфер из аэропорта"],
    },
    {
      title: "Общие удобства",
      icon: "🏨",
      items: [
        "Семейные номера",
        "Номера для некурящих",
        "Зона для курения",
        "Отель для некурящих",
        "Терраса",
      ],
    },
    {
      title: "Удобства поблизости",
      icon: "🏪",
      items: ["Банкомат/банк", "Магазин у дома", "Кафе"],
    },
  ];

  const policyRows = [
    {
      title: "Время заезда/выезда",
      content: "Заезд: с 14:00 · Выезд: до 12:00",
    },
    {
      title: "Общие правила регистрации",
      content:
        "При заезде гостям необходимо предъявить действительный документ, удостоверяющий личность. Для детей могут применяться отдельные правила в зависимости от возраста и типа номера.",
    },
    {
      title: "Дополнительный завтрак",
      content:
        "Объект размещения может взимать дополнительную плату за завтрак в соответствии с политикой отеля.",
    },
  ];

  const generalInfoRows = [
    ["Общие удобства", "Ресторан, круглосуточная стойка регистрации, парковка, лифт, WiFi"],
    ["Время заезда/выезда", "С 14:00 - до 12:00"],
    ["Расстояние до центра города", "1.48 км"],
    ["Популярные места", "Рынок Далата, Университет Далата, железнодорожный вокзал Далата"],
    ["Есть завтрак", "Да, в отеле подают завтрак"],
    ["Количество свободных номеров", `${availableRooms} номеров`],
    ["Количество этажей в отеле", "7"],
    [
      "Другие удобства",
      "Услуги носильщика, бесплатный приветственный напиток, консьерж-сервис / помощь гостям",
    ],
  ];

  const reviewTags = [
    "Все",
    "Маршрут",
    "Пространство номера",
    "Подходит для семьи",
    "Атмосфера",
    "Звукоизоляция",
    "Спальня",
    "Ванная комната",
    "Расстояние до центра",
    "WiFi",
  ];

  const handleMainAction = () => {
    if (hasAvailableRooms) {
      navigate("/hotel-customer-info", {
        state: {
          hotel,
          bookingInfo,
        },
      });
    } else {
      navigate("/hotel-booking", {
        state: {
          location: destination,
          checkIn,
          checkOut,
          guests,
          children,
        },
      });
    }
  };

  return (
    <div
      style={{
        background: "#f5f7fa",
        minHeight: "100vh",
        paddingBottom: "40px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            minHeight: "70px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              fontSize: "28px",
              fontWeight: "800",
              color: "#111827",
            }}
          >
            BestPrice<span style={{ color: "#0ea5ff" }}>✈</span>
          </Link>

          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "center",
              fontSize: "14px",
              color: "#333",
            }}
          >
            <span>🇷🇺 RUB | RU</span>
            <span>Акции</span>
            <span>Поддержка</span>
            <Link
              to="/my-bookings"
              style={{
                textDecoration: "none",
                color: "#333",
              }}
            >
              Мои бронирования
            </Link>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "14px 20px",
              color: "#0d6efd",
              fontWeight: "700",
            }}
          >
            Отели
          </div>
        </div>
      </header>

      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "14px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              height: "44px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              gap: "8px",
              background: "#fff",
            }}
          >
            <span>📍</span>
            <input
              value={hotel.name}
              readOnly
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
              }}
            />
          </div>

          <div
            style={{
              height: "44px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              gap: "8px",
              background: "#fff",
            }}
          >
            <span>🗓️</span>
            <input
              value={
                checkIn && checkOut
                  ? `${checkIn} - ${checkOut}`
                  : "Выберите даты"
              }
              readOnly
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
              }}
            />
          </div>

          <div
            style={{
              height: "44px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              gap: "8px",
              background: "#fff",
            }}
          >
            <span>👥</span>
            <input
              value={`${guests} взрослых, ${children} детей, 1 номер`}
              readOnly
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => navigate("/hotel-results")}
            style={{
              height: "44px",
              border: "none",
              borderRadius: "22px",
              background: "#0ea5ff",
              color: "#fff",
              fontWeight: "800",
              padding: "0 22px",
              cursor: "pointer",
            }}
          >
            Найти отель 🔍
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 20px" }}>
        <div
          style={{
            fontSize: "14px",
            color: "#4b5563",
            marginBottom: "18px",
            lineHeight: "1.6",
          }}
        >
          Отели / Вьетнам / {destination} /{" "}
          <strong>{hotel.name}</strong>
        </div>

        <div
          style={{
            display: "flex",
            gap: "32px",
            borderBottom: "1px solid #e5e7eb",
            marginBottom: "24px",
            paddingBottom: "10px",
            fontWeight: "700",
            color: "#4b5563",
          }}
        >
          <span
            style={{
              color: "#0d6efd",
              borderBottom: "3px solid #0d6efd",
              paddingBottom: "8px",
            }}
          >
            Обзор
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gap: "8px",
            marginBottom: "18px",
          }}
        >
          <div style={{ gridRow: "span 2" }}>
            <img
              src={images[0]}
              alt={hotel.name}
              style={{
                width: "100%",
                height: "340px",
                objectFit: "cover",
                borderRadius: "16px 0 0 16px",
                display: "block",
              }}
              onError={(e) => {
                e.currentTarget.src = defaultImage;
              }}
            />
          </div>

          {images.slice(1, 5).map((img, index) => (
            <div key={index} style={{ position: "relative" }}>
              <img
                src={img}
                alt={`hotel-${index}`}
                style={{
                  width: "100%",
                  height: "166px",
                  objectFit: "cover",
                  display: "block",
                  borderRadius:
                    index === 1
                      ? "0 16px 0 0"
                      : index === 3
                      ? "0 0 16px 0"
                      : "0",
                }}
                onError={(e) => {
                  e.currentTarget.src = defaultImage;
                }}
              />

              {index === 3 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    borderRadius: "0 0 16px 0",
                  }}
                >
                  Посмотреть все фото
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "24px",
              alignItems: "flex-start",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            <div style={{ flex: 1, minWidth: "280px" }}>
              <h1
                style={{
                  fontSize: "34px",
                  fontWeight: "800",
                  margin: "0 0 10px 0",
                  color: "#111827",
                }}
              >
                {hotel.name}
              </h1>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "14px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    background: "#e8f3ff",
                    color: "#0d6efd",
                    padding: "6px 12px",
                    borderRadius: "999px",
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  Отель
                </span>

                <span
                  style={{
                    color: "#f59e0b",
                    fontSize: "20px",
                    fontWeight: "700",
                  }}
                >
                  {renderStars(hotel.rating)}
                </span>
              </div>

              <div
                style={{
                  fontSize: "16px",
                  color: "#374151",
                  lineHeight: "1.7",
                  marginBottom: "12px",
                }}
              >
                📍 {hotel.location}
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  background: "#eef7ff",
                  borderRadius: "16px",
                  padding: "12px 18px",
                }}
              >
                <span
                  style={{
                    fontSize: "38px",
                    fontWeight: "800",
                    color: "#0d6efd",
                    lineHeight: 1,
                  }}
                >
                  {overallRatingDisplay}
                </span>

                <div>
                  <div style={{ fontWeight: "700", color: "#111827" }}>
                    {overallRating ? "Очень хорошо" : "Пока нет оценки"}
                  </div>
                  <div style={{ color: "#2563eb", fontWeight: "600" }}>
                    {reviewCount} реальных отзывов
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                width: "300px",
                minWidth: "280px",
                background: "#fff7f2",
                border: "1px solid #fde1cf",
                borderRadius: "18px",
                padding: "20px",
                textAlign: "right",
              }}
            >
              {hasAvailableRooms ? (
                <>
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#16a34a",
                      fontWeight: "700",
                      marginBottom: "8px",
                    }}
                  >
                    {availableRooms} свободных номеров
                  </div>

                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: "800",
                      color: "#ff5a1f",
                      marginBottom: "6px",
                    }}
                  >
                    {price} USD
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      marginBottom: "18px",
                    }}
                  >
                    Цена за номер за ночь
                  </div>

                  <button
                    onClick={handleMainAction}
                    style={{
                      background: "#ff6b1a",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      padding: "14px 22px",
                      fontWeight: "800",
                      fontSize: "18px",
                      cursor: "pointer",
                    }}
                  >
                    Выбрать номер
                  </button>
                </>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "800",
                      color: "#ef4444",
                      marginBottom: "8px",
                    }}
                  >
                    НЕТ СВОБОДНЫХ НОМЕРОВ
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      marginBottom: "18px",
                      lineHeight: "1.5",
                    }}
                  >
                    Попробуйте изменить даты проживания, чтобы найти свободные номера
                  </div>

                  <button
                    onClick={handleMainAction}
                    style={{
                      background: "#ff8a3d",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      padding: "14px 22px",
                      fontWeight: "800",
                      fontSize: "18px",
                      cursor: "pointer",
                    }}
                  >
                    Изменить даты
                  </button>
                </>
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1fr",
              gap: "18px",
            }}
          >
            <div
              style={{
                background: "#fbfdff",
                border: "1px solid #e5eef8",
                borderRadius: "16px",
                padding: "18px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "22px",
                  fontWeight: "800",
                }}
              >
                Что гости говорят о своем отдыхе
              </h3>

              {reviewsLoading ? (
                <div style={{ color: "#6b7280" }}>Загрузка отзывов...</div>
              ) : firstReview ? (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    border: "1px solid #e5e7eb",
                    padding: "14px",
                  }}
                >
                  <div style={{ fontWeight: "700", marginBottom: "6px" }}>
                    {firstReview.user_name}
                  </div>
                  <div
                    style={{
                      color: "#0d6efd",
                      fontWeight: "700",
                      marginBottom: "8px",
                    }}
                  >
                    {firstReview.rating}/10
                  </div>
                  <div style={{ color: "#374151", lineHeight: "1.6" }}>
                    {firstReview.comment}
                  </div>
                </div>
              ) : (
                <div style={{ color: "#6b7280" }}>
                  Пока нет реальных отзывов об этом отеле.
                </div>
              )}
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "18px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "22px",
                  fontWeight: "800",
                }}
              >
                В районе отеля
              </h3>

              <div style={{ color: "#374151", lineHeight: "1.8" }}>
                <div>📍 {hotel.location}</div>
                <div>📍 Рядом с развлекательной зоной</div>
                <div>📍 Рынок / центр района</div>
                <div>📍 Удобное транспортное сообщение</div>
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "18px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "22px",
                  fontWeight: "800",
                }}
              >
                Основные удобства
              </h3>

              <div style={{ color: "#374151", lineHeight: "2" }}>
                <div>🍽 Ресторан</div>
                <div>📶 WiFi</div>
                <div>🕒 Круглосуточная стойка регистрации</div>
                <div>🅿 Парковка</div>
                <div>🛗 Лифт</div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            padding: "24px",
            marginTop: "22px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "800",
              marginBottom: "20px",
              color: "#111827",
            }}
          >
            Все удобства в {hotel.name}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "14px",
              marginBottom: "28px",
            }}
          >
            {[
              ["Спортивный центр", images[1]],
              ["Лобби", images[2]],
              ["Снаружи", images[3]],
              ["Спальня", images[0]],
              ["Другое", images[4]],
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  height: "110px",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={item[1]}
                  alt={item[0]}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = defaultImage;
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                    color: "#fff",
                    fontWeight: "800",
                    fontSize: "13px",
                    padding: "24px 8px 8px",
                    textAlign: "center",
                  }}
                >
                  {item[0]}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "28px 50px",
            }}
          >
            {amenityGroups.map((group, index) => (
              <div key={index}>
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: "800",
                    marginBottom: "14px",
                    color: "#111827",
                  }}
                >
                  <span style={{ marginRight: "8px" }}>{group.icon}</span>
                  {group.title}
                </h3>

                <ul
                  style={{
                    paddingLeft: "20px",
                    margin: 0,
                    color: "#111827",
                    lineHeight: "2",
                    fontSize: "14px",
                  }}
                >
                  {group.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            marginTop: "22px",
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #dff3ff, #c8ecff)",
              padding: "28px",
              fontSize: "22px",
              fontWeight: "800",
              lineHeight: "1.35",
              color: "#111827",
            }}
          >
            Правила и важная информация об {hotel.name}
          </div>

          <div style={{ padding: "24px" }}>
            {policyRows.map((row, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "230px 1fr",
                  gap: "20px",
                  paddingBottom: "18px",
                  marginBottom: "18px",
                  borderBottom:
                    index !== policyRows.length - 1
                      ? "1px solid #e5e7eb"
                      : "none",
                }}
              >
                <div
                  style={{
                    fontWeight: "800",
                    color: "#111827",
                  }}
                >
                  {row.title}
                </div>
                <div
                  style={{
                    color: "#374151",
                    lineHeight: "1.6",
                    fontSize: "14px",
                  }}
                >
                  {row.content}
                </div>
              </div>
            ))}

            <h3
              style={{
                color: "#0076d7",
                fontSize: "17px",
                fontWeight: "800",
                margin: "10px 0 16px",
              }}
            >
              Общая информация
            </h3>

            <div
              style={{
                borderRadius: "10px",
                overflow: "hidden",
                border: "1px solid #eef2f7",
              }}
            >
              {generalInfoRows.map((row, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "260px 1fr",
                    background: index % 2 === 0 ? "#f8fafc" : "#fff",
                    padding: "13px 16px",
                    fontSize: "14px",
                    color: "#111827",
                  }}
                >
                  <div style={{ color: "#64748b" }}>{row[0]}</div>
                  <div style={{ fontWeight: "700" }}>{row[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            padding: "24px",
            marginTop: "22px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "800",
              marginBottom: "24px",
              color: "#111827",
            }}
          >
            Другие отзывы гостей об {hotel.name}
          </h2>

          <h3
            style={{
              fontSize: "18px",
              fontWeight: "800",
              marginBottom: "16px",
              color: "#111827",
            }}
          >
            Общая оценка и отзывы об {hotel.name}
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.5fr",
              gap: "40px",
              alignItems: "center",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "28px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <div
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "18px",
                  border: "6px solid #dff3ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0ea5ff",
                  fontSize: "42px",
                  fontWeight: "900",
                }}
              >
                {overallRatingDisplay}
              </div>

              <div>
                <div
                  style={{
                    color: "#0ea5ff",
                    fontSize: "34px",
                    fontWeight: "900",
                    marginBottom: "8px",
                  }}
                >
                  {overallRating ? "Очень хорошо" : "Пока нет отзывов"}
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    marginBottom: "8px",
                  }}
                >
                  На основе {reviewCount} реальных отзывов
                </div>
                <div style={{ color: "#64748b" }}>
                  От путешественников BestPrice
                </div>
              </div>
            </div>

            <div>
              {reviewScores.map((score, index) => {
                const scoreValue = score[1];

                return (
                  <div
                    key={index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "140px 1fr 48px",
                      alignItems: "center",
                      gap: "14px",
                      marginBottom: "14px",
                      fontSize: "15px",
                      color: "#111827",
                    }}
                  >
                    <div>{score[0]}</div>
                    <div
                      style={{
                        height: "10px",
                        background: "#eef2f7",
                        borderRadius: "999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${scoreValue ? scoreValue * 10 : 0}%`,
                          height: "100%",
                          background: "#0ea5ff",
                          borderRadius: "999px",
                        }}
                      />
                    </div>
                    <strong style={{ color: "#0ea5ff" }}>
                      {scoreValue || "N/A"}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "18px",
              marginBottom: "26px",
            }}
          >
            <div
              style={{
                color: "#64748b",
                marginBottom: "14px",
              }}
            >
              Гости часто упоминают {hotel.name}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {reviewTags.map((tag, index) => (
                <button
                  key={index}
                  type="button"
                  style={{
                    width: "auto",
                    marginTop: 0,
                    border: "1px solid #cbd5e1",
                    borderRadius: "10px",
                    padding: "9px 14px",
                    background: index === 0 ? "#e8f4ff" : "#fff",
                    color: index === 0 ? "#0076d7" : "#111827",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  ✓ {tag}
                </button>
              ))}
            </div>
          </div>

          <h3
            style={{
              fontSize: "24px",
              fontWeight: "800",
              marginBottom: "18px",
              color: "#111827",
            }}
          >
            Отзывы клиентов
          </h3>

          {reviewsLoading && (
            <div style={{ color: "#64748b", marginBottom: "14px" }}>
              Загрузка реальных отзывов...
            </div>
          )}

          {reviewsError && (
            <div style={{ color: "#dc2626", marginBottom: "14px" }}>
              {reviewsError}
            </div>
          )}

          {!reviewsLoading && reviews.length === 0 ? (
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "18px",
                color: "#64748b",
                background: "#fff",
              }}
            >
              Пока нет реальных отзывов об этом отеле.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "14px",
              }}
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px",
                    padding: "16px",
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>{review.user_name}</strong>
                    <span
                      style={{
                        background: "#e8f4ff",
                        color: "#0076d7",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        fontWeight: "800",
                      }}
                    >
                      {review.rating}/10
                    </span>
                  </div>

                  <p
                    style={{
                      color: "#374151",
                      lineHeight: "1.6",
                      margin: "0 0 8px",
                    }}
                  >
                    {review.comment}
                  </p>

                  <small style={{ color: "#64748b" }}>
                    {formatDate(review.created_at)}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: "22px", textAlign: "center" }}>
          <button
            onClick={handleMainAction}
            style={{
              background: hasAvailableRooms ? "#ff6b1a" : "#ff8a3d",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              padding: "16px 28px",
              fontSize: "18px",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            {hasAvailableRooms ? "Продолжить выбор номера" : "Изменить даты для поиска номера"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;