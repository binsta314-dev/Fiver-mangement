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

  const statusStyle = (status) => ({
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid var(--fiverr-border)',
    backgroundColor: status === 'Complete' ? '#e6f4ea' : status === 'In Progress' ? '#e8f0fe' : '#fef7e0',
    color: status === 'Complete' ? '#137333' : status === 'In Progress' ? '#1967d2' : '#b06000',
    fontWeight: 'bold',
    fontSize: '12px',
    cursor: 'pointer'
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Link to="/accounts" className="btn" style={{ backgroundColor: 'var(--fiverr-dark)', padding: '8px 12px' }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 className="page-title" style={{ margin: 0 }}>Seller: {seller.name}</h1>
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
        <h3>Order History for {seller.name}</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Buyer Account</th>
              <th>Order Price</th>
              <th>Actual Earnings</th>
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
                    style={statusStyle(o.status)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No orders found for this seller.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SellerProfile;
