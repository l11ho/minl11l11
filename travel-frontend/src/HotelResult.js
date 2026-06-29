import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api/hotels/";
const REVIEW_API_URL = "http://127.0.0.1:8000/api/hotel-reviews/";

const fallbackImages = {
  1: "https://theempyreanhotel.com/storage/1-5.jpg",
  2: "https://img.cdn.level.travel/hotels/9081529/73b69362eeb4d7872c77d7bd0c73827a.jpg",
  3: "https://ik.imagekit.io/tvlk/apr-asset/TzEv3ZUmG4-4Dz22hvmO9NUDzw1DGCIdWl4oPtKumOg=/lodging/94000000/93840000/93839700/93839633/142b3756_z.jpg?tr=q-80,c-at_max,w-740,h-500&_src=imagekit",
};

const defaultImage =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";

const HotelResult = () => {
  const navigate = useNavigate();
  const locationHook = useLocation();
  const state = locationHook.state || {};

  const searchParams = new URLSearchParams(locationHook.search);

  const selectedLocation =
    state.location ||
    state.keyword ||
    searchParams.get("location") ||
    searchParams.get("keyword") ||
    "";

  const checkIn =
    state.checkIn ||
    state.startDate ||
    searchParams.get("checkIn") ||
    searchParams.get("startDate") ||
    "";

  const checkOut =
    state.checkOut ||
    state.endDate ||
    searchParams.get("checkOut") ||
    searchParams.get("endDate") ||
    "";

  const adults =
    state.adults ||
    state.guests ||
    searchParams.get("adults") ||
    searchParams.get("guests") ||
    "2";

  const children =
    state.children ||
    searchParams.get("children") ||
    "0";

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const [hotels, setHotels] = useState([]);
  const [reviewsByHotel, setReviewsByHotel] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortBy, setSortBy] = useState("popular");
  const [priceFilter, setPriceFilter] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");

  const getHotelImage = (hotel) => {
    if (hotel.image && String(hotel.image).trim() !== "") {
      return hotel.image;
    }

    return fallbackImages[hotel.id] || defaultImage;
  };

  const getCityFromLocation = (location = "") => {
    const text = String(location).toLowerCase();

    if (
      text.includes("nha trang") ||
      text.includes("khanh hoa") ||
      text.includes("khánh hòa")
    ) {
      return "Nha Trang";
    }

    if (
      text.includes("hanoi") ||
      text.includes("ha noi") ||
      text.includes("hà nội")
    ) {
      return "Hà Nội";
    }

    if (text.includes("da lat") || text.includes("đà lạt")) {
      return "Đà Lạt";
    }

    if (text.includes("da nang") || text.includes("đà nẵng")) {
      return "Đà Nẵng";
    }

    if (
      text.includes("ho chi minh") ||
      text.includes("hồ chí minh") ||
      text.includes("saigon")
    ) {
      return "TP. Hồ Chí Minh";
    }

    return "";
  };

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Не удалось загрузить отели из API.");
        }

        const data = await response.json();
        const apiHotels = Array.isArray(data) ? data : [];

        const savedRoomData =
          JSON.parse(localStorage.getItem("hotelRoomAvailability")) || {};

        const hotelsWithAvailability = apiHotels.map((hotel) => ({
          ...hotel,
          city: getCityFromLocation(hotel.location),
          availableRooms:
            savedRoomData[hotel.id] !== undefined
              ? savedRoomData[hotel.id]
              : 10,
        }));

        setHotels(hotelsWithAvailability);
      } catch (err) {
        setError(err.message || "Произошла ошибка при загрузке отелей.");
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  useEffect(() => {
    const fetchHotelReviews = async () => {
      try {
        setReviewLoading(true);

        const response = await fetch(REVIEW_API_URL);

        if (!response.ok) {
          throw new Error("Cannot load hotel reviews.");
        }

        const data = await response.json();

        const reviews = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : [];

        const groupedReviews = reviews.reduce((acc, review) => {
          const hotelId = String(review.hotel);

          if (!acc[hotelId]) {
            acc[hotelId] = [];
          }

          acc[hotelId].push(review);
          return acc;
        }, {});

        setReviewsByHotel(groupedReviews);
      } catch (err) {
        console.error("Cannot load hotel reviews:", err);
        setReviewsByHotel({});
      } finally {
        setReviewLoading(false);
      }
    };

    fetchHotelReviews();
  }, []);

  const getReviewStats = (hotelId) => {
    const reviews = reviewsByHotel[String(hotelId)] || [];

    if (reviews.length === 0) {
      return {
        count: 0,
        average: null,
      };
    }

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    return {
      count: reviews.length,
      average: Number((total / reviews.length).toFixed(1)),
    };
  };

  const filteredHotels = useMemo(() => {
    let result = [...hotels];

    if (selectedLocation) {
      const keyword = selectedLocation.toLowerCase();

      result = result.filter((hotel) => {
        const name = String(hotel.name || "").toLowerCase();
        const location = String(hotel.location || "").toLowerCase();
        const city = String(hotel.city || "").toLowerCase();

        return (
          name.includes(keyword) ||
          location.includes(keyword) ||
          city.includes(keyword)
        );
      });
    }

    if (selectedArea !== "all") {
      result = result.filter((hotel) =>
        String(hotel.location || "")
          .toLowerCase()
          .includes(selectedArea.toLowerCase())
      );
    }

    if (priceFilter === "low") {
      result = result.filter((hotel) => Number(hotel.price || 0) <= 2000);
    }

    if (priceFilter === "medium") {
      result = result.filter(
        (hotel) =>
          Number(hotel.price || 0) > 2000 &&
          Number(hotel.price || 0) <= 4000
      );
    }

    if (priceFilter === "high") {
      result = result.filter((hotel) => Number(hotel.price || 0) > 4000);
    }

    if (sortBy === "price_low") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sortBy === "price_high") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sortBy === "rating") {
      result.sort((a, b) => {
        const aStats = getReviewStats(a.id);
        const bStats = getReviewStats(b.id);

        return Number(bStats.average || 0) - Number(aStats.average || 0);
      });
    }

    return result;
  }, [
    hotels,
    selectedLocation,
    selectedArea,
    priceFilter,
    sortBy,
    reviewsByHotel,
  ]);

  const destinationLabel = selectedLocation || "Все направления";

  const handleChooseRoom = (hotel) => {
    navigate("/hotel-detail", {
      state: {
        hotel,
        bookingInfo: {
          location: selectedLocation,
          checkIn,
          checkOut,
          guests: adults,
          children,
        },
      },
    });
  };

  const formatPrice = (price) => {
    const numberPrice = Number(price || 0);
    return numberPrice.toLocaleString("vi-VN");
  };

  const renderStars = (rating) => {
    const rounded = Math.round(Number(rating || 0));
    return "★".repeat(rounded) + "☆".repeat(5 - rounded);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    window.location.href = "/";
  };

  return (
    <div className="hotel-results-page">
      <header className="traveloka-header">
        <div className="traveloka-header-inner">
          <div className="traveloka-logo">BestPrice</div>

          <div className="traveloka-top-menu">
            <span>🇷🇺 RUB | RU</span>
            <span>Акции</span>
            <span>Сотрудничество</span>
            <span>Поддержка</span>
            <span>Мои бронирования</span>
          </div>

          <div className="traveloka-auth">
            {currentUser ? (
              <>
                <span className="traveloka-user-name">
                  Здравствуйте, {currentUser.fullName}
                </span>
                <button
                  className="traveloka-register-btn"
                  onClick={handleLogout}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="traveloka-login-btn">
                  Войти
                </Link>
                <Link to="/signup" className="traveloka-register-btn">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="traveloka-nav-row">
          <div className="traveloka-nav-inner">
            <span className="active">Отели</span>
          </div>
        </div>
      </header>

      <div className="hotel-top-search">
        <div className="hotel-top-search-inner">
          <div className="hotel-search-input">
            <span>📍</span>
            <input value={destinationLabel} readOnly />
          </div>

          <div className="hotel-search-input">
            <span>🗓️</span>
            <input
              value={
                checkIn && checkOut
                  ? `${checkIn} - ${checkOut}`
                  : "Выберите даты"
              }
              readOnly
            />
          </div>

          <div className="hotel-search-input">
            <span>👥</span>
            <input
              value={`${adults} взрослых, ${children} детей, 1 номер`}
              readOnly
            />
          </div>

          <button
            type="button"
            className="hotel-search-button"
            onClick={() => navigate("/")}
          >
            Найти отель 🔍
          </button>
        </div>
      </div>

      <div className="hotel-results-wrapper">
        <aside className="hotel-filter-sidebar">
          <div className="hotel-map-card">
            <div className="hotel-map-icon">🗺️</div>
            <button type="button">Открыть на карте</button>
          </div>

          <div className="hotel-filter-card">
            <div className="hotel-filter-header">
              <h3>Последние фильтры</h3>
              <button type="button">Очистить</button>
            </div>

            <div className="hotel-filter-chip">Отели ×</div>
          </div>

          <div className="hotel-filter-card">
            <div className="hotel-filter-header">
              <h3>Диапазон цен</h3>
              <button type="button" onClick={() => setPriceFilter("all")}>
                Сбросить
              </button>
            </div>

            <label className="hotel-check-row">
              <input
                type="radio"
                name="price"
                checked={priceFilter === "all"}
                onChange={() => setPriceFilter("all")}
              />
              Все цены
            </label>

            <label className="hotel-check-row">
              <input
                type="radio"
                name="price"
                checked={priceFilter === "low"}
                onChange={() => setPriceFilter("low")}
              />
              До 2,000 USD
            </label>

            <label className="hotel-check-row">
              <input
                type="radio"
                name="price"
                checked={priceFilter === "medium"}
                onChange={() => setPriceFilter("medium")}
              />
              2,000 - 4,000 USD
            </label>

            <label className="hotel-check-row">
              <input
                type="radio"
                name="price"
                checked={priceFilter === "high"}
                onChange={() => setPriceFilter("high")}
              />
              Более 4,000 USD
            </label>
          </div>

          <div className="hotel-filter-card">
            <div className="hotel-filter-header">
              <h3>Популярные фильтры</h3>
            </div>

            <label className="hotel-check-row">
              <input type="checkbox" />
              Завтрак включен
            </label>

            <label className="hotel-check-row">
              <input type="checkbox" />
              Хорошее расположение
            </label>

            <label className="hotel-check-row">
              <input type="checkbox" />
              Подходит для семьи
            </label>

            <label className="hotel-check-row">
              <input type="checkbox" />
              4-5 звезд
            </label>
          </div>

          <div className="hotel-filter-card">
            <div className="hotel-filter-header">
              <h3>Район</h3>
            </div>

            <label className="hotel-check-row">
              <input
                type="radio"
                name="area"
                checked={selectedArea === "all"}
                onChange={() => setSelectedArea("all")}
              />
              Все районы
            </label>

            <label className="hotel-check-row">
              <input
                type="radio"
                name="area"
                checked={selectedArea === "nha trang"}
                onChange={() => setSelectedArea("nha trang")}
              />
              Nha Trang
            </label>

            <label className="hotel-check-row">
              <input
                type="radio"
                name="area"
                checked={selectedArea === "hanoi"}
                onChange={() => setSelectedArea("hanoi")}
              />
              Hà Nội
            </label>
          </div>
        </aside>

        <main className="hotel-results-main">
          <div className="hotel-results-title-row">
            <div>
              <h2>{destinationLabel}</h2>
              <p>{filteredHotels.length} вариантов размещения найдено</p>
            </div>

            <div className="hotel-sort-row">
              <span>Сортировать по:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="popular">Популярность</option>
                <option value="rating">Самая высокая оценка</option>
                <option value="price_low">Самая низкая цена</option>
                <option value="price_high">Самая высокая цена</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="hotel-status-card">
              Загрузка списка отелей...
            </div>
          )}

          {!loading && error && (
            <div className="hotel-status-card hotel-error">{error}</div>
          )}

          {!loading && !error && filteredHotels.length === 0 && (
            <div className="hotel-status-card">
              Не найдено отелей, соответствующих{" "}
              <strong>{destinationLabel}</strong>.
            </div>
          )}

          {!loading &&
            !error &&
            filteredHotels.map((hotel) => {
              const stats = getReviewStats(hotel.id);

              return (
                <div className="hotel-result-card" key={hotel.id}>
                  <div className="hotel-card-image-area">
                    <img
                      src={getHotelImage(hotel)}
                      alt={hotel.name}
                      onError={(e) => {
                        e.currentTarget.src = defaultImage;
                      }}
                    />

                    <div className="hotel-mini-images">
                      <img src={getHotelImage(hotel)} alt="" />
                      <img src={getHotelImage(hotel)} alt="" />
                      <div className="hotel-view-photo">Фото</div>
                    </div>
                  </div>

                  <div className="hotel-card-content">
                    <h3>{hotel.name}</h3>

                    <div className="hotel-rating-line">
                      <span className="hotel-badge">Отель</span>
                      <span className="hotel-stars">
                        {renderStars(hotel.rating)}
                      </span>
                    </div>

                    <p className="hotel-location">📍 {hotel.location}</p>

                    <div className="hotel-tags">
                      <span>Детская игровая зона</span>
                      <span>Аренда автомобиля</span>
                      <span>Фитнес-центр</span>
                      <span>3+</span>
                    </div>

                    <div className="hotel-benefit">
                      🎁 Для некоторых номеров доступны дополнительные преимущества!
                    </div>
                  </div>

                  <div className="hotel-card-price">
                    <div className="hotel-review">
                      {reviewLoading ? (
                        <span>Загрузка отзывов...</span>
                      ) : stats.count > 0 ? (
                        <>
                          <strong>{stats.average}/10</strong>
                          <span>Очень хорошо</span>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginTop: "4px",
                            }}
                          >
                            {stats.count} реальных отзывов
                          </div>
                        </>
                      ) : (
                        <span>Пока нет отзывов</span>
                      )}
                    </div>

                    <div className="hotel-room-count">
                      {hotel.availableRooms} свободных номеров
                    </div>

                    <div className="hotel-price">
                      {formatPrice(hotel.price)} USD
                    </div>

                    <div className="hotel-price-note">
                      Общая цена за номер за ночь
                    </div>

                    <button
                      type="button"
                      className="hotel-choose-button"
                      onClick={() => handleChooseRoom(hotel)}
                      disabled={hotel.availableRooms <= 0}
                    >
                      {hotel.availableRooms <= 0 ? "Нет номеров" : "Выбрать номер"}
                    </button>
                  </div>
                </div>
              );
            })}
        </main>
      </div>
    </div>
  );
};

export default HotelResult;