import React from 'react';

function HotelReviewsList({ hotelName, onClose }) {
  const allReviews = JSON.parse(localStorage.getItem('hotelReviews')) || [];
  const hotelReviews = allReviews.filter(
    (review) => review.hotelName === hotelName
  );

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Все отзывы</h2>

        {hotelReviews.length === 0 ? (
          <p>Отзывы пока отсутствуют.</p>
        ) : (
          <div style={styles.list}>
            {hotelReviews.map((review) => (
              <div key={review.id} style={styles.card}>
                <h4>{review.userName}</h4>
                <p><strong>Оценка:</strong> {review.rating}/5</p>
                <p>{review.comment}</p>
                <small>{review.date}</small>
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} style={styles.closeBtn}>
          Закрыть
        </button>
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
    width: '500px',
    maxHeight: '80vh',
    overflowY: 'auto',
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '15px',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '12px',
  },
  closeBtn: {
    marginTop: '15px',
    padding: '10px 18px',
    border: 'none',
    background: '#ff7a45',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default HotelReviewsList;