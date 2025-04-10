// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from '@mui/material';  // Material-UI container for responsive design
import HomePage from './pages/HomePage';
import StationListPage from './pages/StationListPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Container>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stations" element={<StationListPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
