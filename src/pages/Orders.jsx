import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [formData, setFormData] = useState({
    seller_id: '',
    buyer_id: '',
    order_price: '',
    actual_price: '',
    order_date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: o } = await supabase
      .from('orders')
      .select(`*, sellers(name), buyers(name)`)
      .order('order_date', { ascending: false });
    const { data: s } = await supabase.from('sellers').select('*').order('id');
    const { data: b } = await supabase.from('buyers').select('*').order('id');

    setSellers(s || []);
    setBuyers(b || []);
    setOrders((o || []).map(order => ({
      ...order,
      seller_name: order.sellers?.name || 'Unknown',
      buyer_name: order.buyers?.name || 'Unknown'
    })));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    if (!formData.seller_id || !formData.buyer_id) { alert('Please select seller and buyer'); return; }
    const { error } = await supabase.from('orders').insert({
      seller_id: parseInt(formData.seller_id),
      buyer_id: parseInt(formData.buyer_id),
      order_price: parseFloat(formData.order_price),
      actual_price: parseFloat(formData.actual_price),
      order_date: new Date(formData.order_date).toISOString(),
      status: formData.status
    });
    if (error) { alert('Error: ' + error.message); return; }
    setFormData(prev => ({ ...prev, order_price: '', actual_price: '', order_date: new Date().toISOString().split('T')[0], status: 'Pending' }));
    loadData();
  };

  const handleStatusChange = async (id, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    loadData();
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    await supabase.from('orders').delete().eq('id', id);
    loadData();
  };

  const statusStyle = (status) => {
    switch (status) {
      case 'To Do':
        return {
          padding: '4px 8px',
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
          padding: '4px 8px',
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
          padding: '4px 8px',
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
          padding: '4px 8px',
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
      <h1 className="page-title">Orders Management</h1>

      <div className="card">
        <h3>Log New Order</h3>
        <form onSubmit={handleAddOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          <div className="form-group">
            <label>Seller Account</label>
            <select className="form-control" name="seller_id" value={formData.seller_id} onChange={handleChange} required>
              <option value="">Select Seller</option>
              {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Buyer Account</label>
            <select className="form-control" name="buyer_id" value={formData.buyer_id} onChange={handleChange} required>
              <option value="">Select Buyer</option>
              {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-control" name="status" value={formData.status} onChange={handleChange}>
              <option value="To Do">To Do</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
            </select>
          </div>
          <div className="form-group">
            <label>Order Price ($)</label>
            <input type="number" step="0.01" className="form-control" name="order_price" value={formData.order_price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Actual Order Price ($)</label>
            <input type="number" step="0.01" className="form-control" name="actual_price" value={formData.actual_price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" className="form-control" name="order_date" value={formData.order_date} onChange={handleChange} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn">Add Order</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Order History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Seller</th>
              <th>Buyer</th>
              <th>Order Price</th>
              <th>Actual Order Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>{format(new Date(o.order_date), 'MMM dd, yyyy')}</td>
                <td><strong>{o.seller_name}</strong></td>
                <td>{o.buyer_name}</td>
                <td>${o.order_price.toFixed(2)}</td>
                <td style={{ color: 'var(--fiverr-green)', fontWeight: 'bold' }}>${o.actual_price.toFixed(2)}</td>
                <td>
                  <select
                    value={o.status || 'Pending'}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    style={statusStyle(o.status)}
                  >
                    <option value="To Do">To Do</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete</option>
                  </select>
                </td>
                <td>
                  <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDeleteOrder(o.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No orders logged yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;
