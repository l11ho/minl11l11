import React from 'react';
import { Link } from 'react-router-dom';

const TourSelection = () => {
  return (
    <div className="tour-selection">
      <h2>Выберите тип тура</h2>
      <div className="tour-type">
        <div className="tour-card">
          <h3>Внутренние туры</h3>
          <p>Откройте для себя направления внутри страны.</p>
          <Link to="/domestic-tours">Выбрать тур</Link> {/* Ссылка на страницу внутренних туров */}
        </div>
        <div className="tour-card">
          <h3>Международные туры</h3>
          <p>Откройте для себя международные направления.</p>
          <Link to="/international-tours">Выбрать тур</Link> {/* Ссылка на страницу международных туров */}
        </div>
      </div>
    </div>
  );
};

export default TourSelection;