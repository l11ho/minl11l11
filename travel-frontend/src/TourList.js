import React from 'react';
import { useNavigate } from 'react-router-dom'; // Для перехода на страницу при выборе тура

const TourList = () => {
  const tours = [
    {
      id: 1,
      name: "Тур в Дананг",
      price: 1000,
      description: "Откройте для себя Дананг с его красивыми достопримечательностями.",
      image: "https://storage.googleapis.com/blogvxr-uploads/2025/08/63d326e0-dia-diem-du-lich-da-nang-8676989-1250x715.jpg" // Иллюстрация для тура
    },
    {
      id: 2,
      name: "Тур в Нячанг",
      price: 900,
      description: "Откройте для себя Нячанг и его прекрасные пляжи.",
      image: "https://bomanhatrang.com/wp-content/uploads/2023/03/dia-diem-du-lich-nha-trang-thumbnail-1.jpg"
    },
    {
      id: 3,
      name: "Тур в Ханой",
      price: 1200,
      description: "Откройте для себя столицу Ханой и её исторические памятники.",
      image: "https://s-aicmscdn.vietnamhoinhap.vn/vnhn-media/25/12/30/dia-diem-du-lich-o-ha-noi-1_695338349873b.jpg"
    },
  ];

  const navigate = useNavigate(); // Инициализация navigate для перехода между страницами

  const handleSelectTour = (tourId) => {
    navigate(`/tour/${tourId}`); // Переход на страницу с деталями тура
  };

  return (
    <div className="tour-list">
      <h2>Выберите тур</h2>

      <div className="tour-cards">
        {tours.map((tour) => (
          <div key={tour.id} className="tour-card">
            <img src={tour.image} alt={tour.name} className="tour-image" />
            <div className="tour-details">
              <h3>{tour.name}</h3>
              <p>{tour.description}</p>
              <p><strong>Цена: {tour.price} USD</strong></p>
              <button onClick={() => handleSelectTour(tour.id)} className="btn-select">Выбрать тур</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TourList;