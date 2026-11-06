import React from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CalculatorPage } from './pages/CalculatorPage';

export const App: React.FC = () => {
  return (
    <div className="app-root">
      <Header />
      <CalculatorPage />
      <Footer />
    </div>
  );
};

export default App;
