import React from 'react';
import './styles.css';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import ChatBox from './ChatBox';
import HomePage from './HomePage';
import TourList from './TourList';
import TourDetail from './TourDetail';
import PaymentForm from './PaymentForm';
import Navbar from './Navbar';
import TourSelection from './TourSelection';
import DomesticTours from './DomesticTours';
import InternationalTours from './InternationalTours';
import Login from './Login';
import Signup from './Signup';
import MyBookings from './MyBookings';
import FlightBooking from './FlightBooking';
import FlightResult from './FlightResult';
import PassengerInfo from './PassengerInfo';
import HotelBooking from './HotelBooking';
import HotelResult from './HotelResult';
import HotelDetail from './HotelDetail';
import HotelCustomerInfo from './HotelCustomerInfo';
import SuccessPage from './SuccessPage';
import TravelGuideDetail from './TravelGuideDetail';

function AppContent() {
  const location = useLocation();

  // Những route KHÔNG muốn hiện thanh navbar màu cam cũ
  const hideNavbarRoutes = [
    '/',
    '/hotel-results',
    '/hotel-detail',
    '/hotel-customer-info',
    '/success',
    '/my-bookings',
    '/flight-result',
    '/passenger-info',
    '/payment',
    '/tour-detail',
    '/domestic-tours',
    '/international-tours',
    '/travel-guide/bali',
    '/travel-guide/seoul',
    '/travel-guide/bangkok',
    '/travel-guide/istanbul',
    '/travel-guide/liverpool',
  ];

  const shouldHideNavbar = hideNavbarRoutes.some((route) => {
    if (route === '/') {
      return location.pathname === '/';
    }

    return location.pathname.startsWith(route);
  });

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/travel-guide/:slug" element={<TravelGuideDetail />} />

        <Route path="/tour-list" element={<TourList />} />
        <Route path="/tour-selection" element={<TourSelection />} />
        <Route path="/domestic-tours" element={<DomesticTours />} />
        <Route path="/international-tours" element={<InternationalTours />} />
        <Route path="/tour-detail/:tourId" element={<TourDetail />} />


        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/my-bookings" element={<MyBookings />} />

        <Route path="/flight-booking" element={<FlightBooking />} />
        <Route path="/flight-result" element={<FlightResult />} />
        <Route path="/passenger-info" element={<PassengerInfo />} />

        <Route path="/hotel-booking" element={<HotelBooking />} />
        <Route path="/hotel-results" element={<HotelResult />} />
        <Route path="/hotel-detail" element={<HotelDetail />} />
        <Route path="/hotel-customer-info" element={<HotelCustomerInfo />} />

        <Route path="/payment" element={<PaymentForm />} />
        <Route path="/success" element={<SuccessPage />} />
      </Routes>

      <ChatBox />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;