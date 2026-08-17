import React, { useState, useEffect } from 'react';
import { isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from 'date-fns';

import { Link } from 'react-router-dom';

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // all, day, week, month, year
  
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (window.electronAPI) {
      const data = await window.electronAPI.getOrders();
      setOrders(data);
    }
  };

  const getFilteredOrders = () => {
    const now = new Date();
    return orders.filter(order => {
      const orderDate = parseISO(order.order_date);
      switch(filter) {
        case 'day':
          return isWithinInterval(orderDate, { start: startOfDay(now), end: endOfDay(now) });
        case 'week':
          return isWithinInterval(orderDate, { start: startOfWeek(now), end: endOfWeek(now) });
        case 'month':
          return isWithinInterval(orderDate, { start: startOfMonth(now), end: endOfMonth(now) });
        case 'year':
          return isWithinInterval(orderDate, { start: startOfYear(now), end: endOfYear(now) });
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();
  
  const totalOrders = filteredOrders.length;
  const totalOrderPrice = filteredOrders.reduce((sum, order) => sum + order.order_price, 0);
  const totalActualPrice = filteredOrders.reduce((sum, order) => sum + order.actual_price, 0);

  // Group by seller_id
  const sellerStats = filteredOrders.reduce((acc, order) => {
    if (!acc[order.seller_id]) {
      acc[order.seller_id] = { name: order.seller_name, count: 0, orderPrice: 0, actualPrice: 0 };
    }
    acc[order.seller_id].count += 1;
    acc[order.seller_id].orderPrice += order.order_price;
    acc[order.seller_id].actualPrice += order.actual_price;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      
      <div className="card" style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <button className={filter === 'all' ? 'btn' : 'btn'} style={{ backgroundColor: filter === 'all' ? 'var(--fiverr-green)' : '#ccc' }} onClick={() => setFilter('all')}>All Time</button>
        <button className={filter === 'day' ? 'btn' : 'btn'} style={{ backgroundColor: filter === 'day' ? 'var(--fiverr-green)' : '#ccc' }} onClick={() => setFilter('day')}>Today</button>
        <button className={filter === 'week' ? 'btn' : 'btn'} style={{ backgroundColor: filter === 'week' ? 'var(--fiverr-green)' : '#ccc' }} onClick={() => setFilter('week')}>This Week</button>
        <button className={filter === 'month' ? 'btn' : 'btn'} style={{ backgroundColor: filter === 'month' ? 'var(--fiverr-green)' : '#ccc' }} onClick={() => setFilter('month')}>This Month</button>
        <button className={filter === 'year' ? 'btn' : 'btn'} style={{ backgroundColor: filter === 'year' ? 'var(--fiverr-green)' : '#ccc' }} onClick={() => setFilter('year')}>This Year</button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-title">Total Orders</span>
          <span className="stat-value">{totalOrders}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Total Order Value</span>
          <span className="stat-value">${totalOrderPrice.toFixed(2)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Actual Earnings</span>
          <span className="stat-value">${totalActualPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="card">
        <h3>Performance by Seller</h3>
        <table>
          <thead>
            <tr>
              <th>Seller Account</th>
              <th>Orders</th>
              <th>Order Value</th>
              <th>Actual Earnings</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(sellerStats).map(([sellerId, stats]) => (
              <tr key={sellerId}>
                <td>
                  <Link to={`/seller/${sellerId}`} style={{ color: 'var(--fiverr-green)', textDecoration: 'none', fontWeight: 'bold' }}>
                    {stats.name}
                  </Link>
                </td>
                <td>{stats.count}</td>
                <td>${stats.orderPrice.toFixed(2)}</td>
                <td style={{ color: 'var(--fiverr-green)', fontWeight: 'bold' }}>${stats.actualPrice.toFixed(2)}</td>
              </tr>
            ))}
            {Object.keys(sellerStats).length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No orders found for this period.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
