import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem('registeredUser'));

    if (!savedUser) {
      alert('Аккаунт не найден. Пожалуйста, сначала зарегистрируйтесь.');
      return;
    }

    if (
      formData.email === savedUser.email &&
      formData.password === savedUser.password
    ) {
      localStorage.setItem(
        'currentUser',
        JSON.stringify({
          fullName: savedUser.fullName,
          email: savedUser.email,
        })
      );

      window.dispatchEvent(new Event('authChanged'));
      alert('Вход выполнен успешно.');
      navigate('/');
    } else {
      alert('Неверный email или пароль.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Вход</h2>
        <p>Пожалуйста, введите данные своей учетной записи</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Электронная почта"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
          />

          <button type="submit">Войти</button>
        </form>

        <p className="auth-switch">
          Нет аккаунта? <Link to="/signup">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;