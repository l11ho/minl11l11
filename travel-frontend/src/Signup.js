import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { fullName, email, phone, password, confirmPassword } = formData;

    if (!fullName || !email || !phone || !password || !confirmPassword) {
      alert('Пожалуйста, заполните всю информацию.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Подтверждение пароля не совпадает.');
      return;
    }

    const user = {
      fullName,
      email,
      phone,
      password,
    };

    localStorage.setItem('registeredUser', JSON.stringify(user));
    alert('Регистрация прошла успешно.');
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Регистрация</h2>
        <p>Создайте новый аккаунт</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            name="fullName"
            placeholder="Полное имя"
            value={formData.fullName}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Электронная почта"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="phone"
            placeholder="Номер телефона"
            value={formData.phone}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Повторите пароль"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit">Зарегистрироваться</button>
        </form>

        <p className="auth-switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;