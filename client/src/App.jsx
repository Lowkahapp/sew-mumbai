import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import CustomerSearch from './pages/CustomerSearch';
import TailorDetail from './pages/TailorDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import BecomeTailor from './pages/BecomeTailor';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerMeasurements from './pages/CustomerMeasurements';
import TailorDashboard from './pages/TailorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReviewForm from './pages/ReviewForm';
import ColorTrends from './pages/ColorTrends';
import DesignTrends from './pages/DesignTrends';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="tailors" element={<CustomerSearch />} />
            <Route path="search" element={<CustomerSearch />} />
            <Route path="tailors/:id" element={<TailorDetail />} />
            <Route path="trends/colors" element={<ColorTrends />} />
            <Route path="trends/design" element={<DesignTrends />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="become-tailor" element={<BecomeTailor />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute roles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="measurements"
              element={
                <ProtectedRoute roles={['customer']}>
                  <CustomerMeasurements />
                </ProtectedRoute>
              }
            />
            <Route
              path="tailor"
              element={
                <ProtectedRoute roles={['tailor']}>
                  <TailorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="reviews/:bookingId"
              element={
                <ProtectedRoute roles={['customer']}>
                  <ReviewForm />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

