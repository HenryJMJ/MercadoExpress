import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// User Pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Tracking from './pages/Tracking';
import Login from './pages/Login';
import SellProduct from './pages/SellProduct';
import MyProducts from './pages/MyProducts';
import MyPanel from './pages/MyPanel';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import InvoicePage from './pages/InvoicePage';

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
      
      <Navbar />
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/order/:id/invoice" element={<InvoicePage />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sell" element={<SellProduct />} />
          <Route path="/sell/:id" element={<SellProduct />} />
          <Route path="/my-products" element={<MyProducts />} />
          <Route path="/panel" element={<MyPanel />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      
      <Footer />
    </>
  );
}

export default App;
