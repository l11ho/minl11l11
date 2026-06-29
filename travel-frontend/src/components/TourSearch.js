import React, { useState, useEffect } from 'react';

const TourSearch = () => {
  const [tours, setTours] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/tours/')
      .then(response => response.json())
      .then(data => setTours(data));
  }, []);

  return (
    <div>
      <h1>Tour Search</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Destination</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {tours.map(tour => (
            <tr key={tour.id}>
              <td>{tour.name}</td>
              <td>{tour.price}</td>
              <td>{tour.destination}</td>
              <td>{tour.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TourSearch;