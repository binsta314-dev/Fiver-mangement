import React, { useState, useEffect } from 'react';
import { isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`*, sellers(name), buyers(name)`)
      .order('order_date', { ascending: false });
    if (error) { console.error(error); return; }
    setOrders(data.map(o => ({
      ...o,
      seller_name: o.sellers?.name || 'Unknown',
      buyer_name: o.buyers?.name || 'Unknown'
    })));
  };

  const getFilteredOrders = () => {
    const now = new Date();
    return orders.filter(order => {
      const orderDate = parseISO(order.order_date);
      switch (filter) {
        case 'day': return isWithinInterval(orderDate, { start: startOfDay(now), end: endOfDay(now) });
        case 'week': return isWithinInterval(orderDate, { start: startOfWeek(now), end: endOfWeek(now) });
        case 'month': return isWithinInterval(orderDate, { start: startOfMonth(now), end: endOfMonth(now) });
        case 'year': return isWithinInterval(orderDate, { start: startOfYear(now), end: endOfYear(now) });
        default: return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();
  const totalOrders = filteredOrders.length;
  const totalOrderPrice = filteredOrders.reduce((sum, o) => sum + o.order_price, 0);
  const totalActualPrice = filteredOrders.reduce((sum, o) => sum + o.actual_price, 0);

  // Group by seller_id with status counts
  const sellerStats = filteredOrders.reduce((acc, order) => {
    if (!acc[order.seller_id]) {
      acc[order.seller_id] = {
        name: order.seller_name,
        count: 0,
        orderPrice: 0,
        actualPrice: 0,
        todo: 0,
        pending: 0,
        inProgress: 0,
        complete: 0
      };
    }
    acc[order.seller_id].count += 1;
    acc[order.seller_id].orderPrice += order.order_price;
    acc[order.seller_id].actualPrice += order.actual_price;
    const s = order.status || 'Pending';
    if (s === 'To Do') acc[order.seller_id].todo += 1;
    else if (s === 'Pending') acc[order.seller_id].pending += 1;
    else if (s === 'In Progress') acc[order.seller_id].inProgress += 1;
    else if (s === 'Complete') acc[order.seller_id].complete += 1;
    return acc;
  }, {});

  const filters = [
    { key: 'all', label: 'All Time' },
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
  ];

  const statusBadge = (count, bg, color, label) =>
    count > 0 ? (
      <span style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '20px',
        backgroundColor: bg,
        color,
        fontWeight: 'bold',
        fontSize: '11px',
        marginRight: '4px'
      }}>{label}: {count}</span>
    ) : null;

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      {/* Filter Buttons */}
      <div className="card" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
        {filters.map(f => (
          <button key={f.key} className="btn"
            style={{ backgroundColor: filter === f.key ? 'var(--fiverr-green)' : '#ccc' }}
            onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
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
          <span className="stat-title">Actual Order Price</span>
          <span className="stat-value">${totalActualPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Per-Seller Table */}
      <div className="card">
        <h3>Performance by Seller</h3>
        <table>
          <thead>
            <tr>
              <th>Seller Account</th>
              <th>Total Orders</th>
              <th>Order Value</th>
              <th>Actual Order Price</th>
              <th>Status</th>
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
                <td><strong>{stats.count}</strong></td>
                <td>${stats.orderPrice.toFixed(2)}</td>
                <td style={{ color: 'var(--fiverr-green)', fontWeight: 'bold' }}>${stats.actualPrice.toFixed(2)}</td>
                <td>
                  {statusBadge(stats.todo, '#f3e8fd', '#7b1fa2', 'To Do')}
                  {statusBadge(stats.pending, '#fef7e0', '#b06000', 'Pending')}
                  {statusBadge(stats.inProgress, '#e8f0fe', '#1967d2', 'In Progress')}
                  {statusBadge(stats.complete, '#e6f4ea', '#137333', 'Complete')}
                  {stats.todo === 0 && stats.pending === 0 && stats.inProgress === 0 && stats.complete === 0 && '—'}
                </td>
              </tr>
            ))}
            {Object.keys(sellerStats).length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No orders found for this period.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
