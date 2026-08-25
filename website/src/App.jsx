import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import FaqPage from './pages/FaqPage';
import ServicesPage from './pages/ServicesPage';
import MovingPage from './pages/MovingPage';
import LaborPage from './pages/LaborPage';
import DeliveryPage from './pages/DeliveryPage';
import JunkPage from './pages/JunkPage';
import PriceListPage from './pages/PriceListPage';
import TermsPage from './pages/TermsPage';
import CancellationPage from './pages/CancellationPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="f-a-q" element={<FaqPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="moving" element={<MovingPage />} />
          <Route path="labor-only-moving" element={<LaborPage />} />
          <Route path="delivery-services" element={<DeliveryPage />} />
          <Route path="junk-removal" element={<JunkPage />} />
          <Route path="price-list" element={<PriceListPage />} />
          <Route path="terms-and-conditions" element={<TermsPage />} />
          <Route path="cancellation-policy" element={<CancellationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
