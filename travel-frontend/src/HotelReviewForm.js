import React, { useState } from 'react';

function HotelReviewForm({ hotelName, currentUser, onClose, onSave }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!comment.trim()) {
      alert('Введите отзыв');
      return;
    }

    const newReview = {
      id: Date.now(),
      hotelName,
      userName: currentUser?.name || currentUser?.fullName || 'Клиент',
      rating,
      comment,
      date: new Date().toLocaleDateString('ru-RU'),
    };

    const existingReviews =
      JSON.parse(localStorage.getItem('hotelReviews')) || [];

    const updatedReviews = [...existingReviews, newReview];
    localStorage.setItem('hotelReviews', JSON.stringify(updatedReviews));

    onSave(updatedReviews);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Оценить отель</h2>

        <label>Оценка:</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          style={styles.select}
        >
          <option value={5}>5</option>
          <option value={4}>4</option>
          <option value={3}>3</option>
          <option value={2}>2</option>
          <option value={1}>1</option>
        </select>

        <label>Отзыв:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Напишите ваш отзыв..."
          style={styles.textarea}
        />

        <div style={styles.actions}>
          <button onClick={onClose} style={styles.cancelBtn}>
            Отмена
          </button>
          <button onClick={handleSubmit} style={styles.saveBtn}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modal: {
    width: '400px',
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  select: {
    padding: '10px',
    fontSize: '16px',
  },
  textarea: {
    minHeight: '120px',
    padding: '10px',
    fontSize: '16px',
    resize: 'none',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
  },
  cancelBtn: {
    padding: '10px 18px',
    border: 'none',
    background: '#ccc',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 18px',
    border: 'none',
    background: '#ff7a45',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default HotelReviewForm;