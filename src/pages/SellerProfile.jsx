import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => { loadProfile(); }, [id]);

  const loadProfile = async () => {
    const { data: s } = await supabase.from('sellers').select('*').eq('id', id).single();
    setSeller(s);

    const { data: o } = await supabase
      .from('orders')
      .select(`*, sellers(name), buyers(name)`)
      .eq('seller_id', id)
      .order('order_date', { ascending: false });

    setOrders((o || []).map(order => ({
      ...order,
      seller_name: order.sellers?.name || 'Unknown',
      buyer_name: order.buyers?.name || 'Unknown'
    })));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    loadProfile();
  };

  if (!seller) return <div style={{ padding: '40px' }}>Loading...</div>;

  const totalOrders = orders.length;
  const totalOrderPrice = orders.reduce((sum, o) => sum + o.order_price, 0);
  const totalActualPrice = orders.reduce((sum, o) => sum + o.actual_price, 0);

  const statusStyle = (status) => {
    switch (status) {
      case 'To Do':
        return {
          padding: '4px 10px',
          borderRadius: '4px',
          border: '1px solid #e1bee7',
          backgroundColor: '#f3e8fd',
          color: '#7b1fa2',
          fontWeight: 'bold',
          fontSize: '12px',
          cursor: 'pointer'
        };
      case 'Complete':
        return {
          padding: '4px 10px',
          borderRadius: '4px',
          border: '1px solid #ceead6',
          backgroundColor: '#e6f4ea',
          color: '#137333',
          fontWeight: 'bold',
          fontSize: '12px',
          cursor: 'pointer'
        };
      case 'In Progress':
        return {
          padding: '4px 10px',
          borderRadius: '4px',
          border: '1px solid #d2e3fc',
          backgroundColor: '#e8f0fe',
          color: '#1967d2',
          fontWeight: 'bold',
          fontSize: '12px',
          cursor: 'pointer'
        };
      default: // Pending
        return {
          padding: '4px 10px',
          borderRadius: '4px',
          border: '1px solid #feefc3',
          backgroundColor: '#fef7e0',
          color: '#b06000',
          fontWeight: 'bold',
          fontSize: '12px',
          cursor: 'pointer'
        };
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Link to="/sellers" className="btn" style={{ backgroundColor: 'var(--fiverr-dark)', padding: '8px 12px' }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 className="page-title" style={{ margin: 0 }}>Seller: {seller.name}</h1>
      </div>

      {/* Stat Cards — Total Orders first, then Order Value, then Actual Order Price */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-title">Total Orders</span>
          <span className="stat-value">{totalOrders}</span>
        </div>
        <div className="stat-card">
          <span className="stat-title">Total Order Value</span>
          <span className="stat-value">${totalOrderPrice.toFixed(2)}</span>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid var(--fiverr-green)' }}>
          <span className="stat-title">Actual Order Price</span>
          <span className="stat-value" style={{ color: 'var(--fiverr-green)' }}>${totalActualPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <h3>Orders for <span style={{ color: 'var(--fiverr-green)' }}>{seller.name}</span></h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Buyer Account</th>
              <th>Order Price</th>
              <th>Actual Order Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{format(new Date(o.order_date), 'MMM dd, yyyy')}</td>
                <td><strong>{o.buyer_name}</strong></td>
                <td>${o.order_price.toFixed(2)}</td>
                <td style={{ color: 'var(--fiverr-green)', fontWeight: 'bold' }}>${o.actual_price.toFixed(2)}</td>
                <td>
                  <select
                    value={o.status || 'Pending'}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    style={statusStyle(o.status || 'Pending')}
                  >
                    <option value="To Do">To Do</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#74767e' }}>
                  No orders found for this seller.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SellerProfile;
