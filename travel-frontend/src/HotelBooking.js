import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HotelBooking = () => {
  const navigate = useNavigate();

  const [location, setLocation] = useState("Нячанг");
  const [checkIn, setCheckIn] = useState("2026-03-20");
  const [checkOut, setCheckOut] = useState("2026-03-28");
  const [guests, setGuests] = useState("2");

  const cities = [
    "Ханой",
    "Хошимин",
    "Дананг",
    "Нячанг",
    "Далат",
    "Фукуок",
    "Хюэ",
    "Кантхо",
    "Хайфон",
    "Вунгтау",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!location || !checkIn || !checkOut || !guests) {
      alert("Заполните все данные для поиска отеля.");
      return;
    }

    navigate("/hotel-results", {
      state: {
        location,
        checkIn,
        checkOut,
        guests,
      },
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "700px",
          background: "#fff",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            fontSize: "48px",
            marginBottom: "10px",
            fontWeight: "700",
          }}
        >
          Найти отель
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: "28px",
            marginBottom: "40px",
          }}
        >
          Введите данные о вашем пребывании
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              Место
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "18px",
                borderRadius: "12px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              Дата заезда
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "18px",
                borderRadius: "12px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              Дата выезда
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "18px",
                borderRadius: "12px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label
              style={{
                display: "block",
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              Количество гостей
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "18px",
                borderRadius: "12px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            >
              <option value="1">1 гость</option>
              <option value="2">2 гостя</option>
              <option value="3">3 гостя</option>
              <option value="4">4 гостя</option>
              <option value="5">5 гостей</option>
              <option value="6">6 гостей</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "18px",
              background: "#c96f0d",
              color: "#fff",
              fontSize: "22px",
              fontWeight: "700",
              border: "none",
              borderRadius: "14px",
              cursor: "pointer",
            }}
          >
            Найти отель
          </button>
        </form>
      </div>
    </div>
  );
};

export default HotelBooking;