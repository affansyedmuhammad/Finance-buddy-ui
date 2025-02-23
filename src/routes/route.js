import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FinancialBot from '../components/chat';

const RoutesComponent = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FinancialBot/>} />
      </Routes>
    </Router>
  );
};

export default RoutesComponent;