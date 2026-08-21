import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutDashboard, Store, UserCheck, ShoppingCart, Wallet, Mail } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Buyers from './pages/Buyers';
import Orders from './pages/Orders';
import SellerProfile from './pages/SellerProfile';
import PayPal from './pages/PayPal';
import Emails from './pages/Emails';

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
            <NavLink to="/sellers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Store size={20} />
              Sellers
            </NavLink>
            <NavLink to="/buyers" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <UserCheck size={20} />
              Buyers
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <ShoppingCart size={20} />
              Orders
            </NavLink>
            <NavLink to="/paypal" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Wallet size={20} />
              PayPal Accounts
            </NavLink>
            <NavLink to="/emails" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Mail size={20} />
              Emails
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sellers" element={<Accounts />} />
            <Route path="/accounts" element={<Navigate to="/sellers" replace />} />
            <Route path="/buyers" element={<Buyers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/seller/:id" element={<SellerProfile />} />
            <Route path="/paypal" element={<PayPal />} />
            <Route path="/emails" element={<Emails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
