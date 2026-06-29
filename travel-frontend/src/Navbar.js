import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/" style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold', fontSize: '24px' }}>
          Travel
        </Link>
      </div>

      <ul className="navbar-links">
        <li><Link to="/">Главная</Link></li>
        <li><Link to="/tour-selection">Туры</Link></li>
        <li><Link to="/flight-result">Авиабилеты</Link></li>
        <li><Link to="/hotel-booking">Отели</Link></li>
        <li><Link to="/my-bookings">Мои бронирования</Link></li>

        {currentUser ? (
          <>
            <li><span>Здравствуйте, {currentUser.fullName}</span></li>
            <li><button className="logout-btn" onClick={handleLogout}>Выйти</button></li>
          </>
        ) : null}
      </ul>
    </nav>
  );
};

export default Navbar;