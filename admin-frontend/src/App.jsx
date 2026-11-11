import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AdminLayout from './components/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminSellerApprovals from './pages/admin/AdminSellerApprovals';
import AdminLogin from './pages/admin/AdminLogin';

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1E293B',
          color: '#F8FAFC',
          border: '1px solid #334155'
        }
      }} />
      
      <Routes>
        <Route path="/login" element={<AdminLogin />} />

        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="seller-approvals" element={<AdminSellerApprovals />} />
          <Route path="analytics" element={<AdminDashboard />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
