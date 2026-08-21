import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Store } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Orders from './pages/Orders';
import SellerProfile from './pages/SellerProfile';
import BuyerHub from './pages/BuyerHub';

function App() {
  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-logo">
            Fiverr<span>Manager</span>
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} end>
              <LayoutDashboard size={20} />
              Dashboard
            </NavLink>

            <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <ShoppingCart size={20} />
              Orders
            </NavLink>

            <NavLink to="/buyer-management" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Users size={20} />
              Buyer Management
            </NavLink>

            <NavLink to="/sellers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Store size={20} />
              Seller Accounts
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/buyer-management" element={<BuyerHub />} />
            <Route path="/buyers" element={<Navigate to="/buyer-management?tab=buyers" replace />} />
            <Route path="/paypal" element={<Navigate to="/buyer-management?tab=paypal" replace />} />
            <Route path="/emails" element={<Navigate to="/buyer-management?tab=emails" replace />} />
            <Route path="/sellers" element={<Accounts />} />
            <Route path="/accounts" element={<Navigate to="/sellers" replace />} />
            <Route path="/seller/:id" element={<SellerProfile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
