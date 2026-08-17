import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, Wallet } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Orders from './pages/Orders';
import SellerProfile from './pages/SellerProfile';
import PayPal from './pages/PayPal';

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
            <NavLink to="/accounts" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Users size={20} />
              Accounts
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <ShoppingCart size={20} />
              Orders
            </NavLink>
            <NavLink to="/paypal" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Wallet size={20} />
              PayPal Accounts
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/seller/:id" element={<SellerProfile />} />
            <Route path="/paypal" element={<PayPal />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
