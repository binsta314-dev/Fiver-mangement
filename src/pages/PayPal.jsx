import React, { useState, useEffect } from 'react';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

function PayPal() {
  const [paypalAccounts, setPaypalAccounts] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [formData, setFormData] = useState({ buyer_id: '', paypal_email: '', balance: '' });
  const [editingId, setEditingId] = useState(null);
  const [editBalance, setEditBalance] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: b } = await supabase.from('buyers').select('*').order('id');
    const { data: p } = await supabase
      .from('paypal_accounts')
      .select(`*, buyers(name)`)
      .order('id');
    setBuyers(b || []);
    setPaypalAccounts((p || []).map(acc => ({
      ...acc,
      buyer_name: acc.buyers?.name || 'Unknown'
    })));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.buyer_id || !formData.paypal_email) {
      alert('Please select a buyer and enter PayPal email.');
      return;
    }
    const { error } = await supabase.from('paypal_accounts').insert({
      buyer_id: parseInt(formData.buyer_id),
      paypal_email: formData.paypal_email.trim(),
      balance: parseFloat(formData.balance) || 0
    });
    if (error) { alert('Error: ' + error.message); return; }
    setFormData({ buyer_id: '', paypal_email: '', balance: '' });
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this PayPal account?')) return;
    await supabase.from('paypal_accounts').delete().eq('id', id);
    loadData();
  };

  const startEdit = (acc) => {
    setEditingId(acc.id);
    setEditBalance(acc.balance.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBalance('');
  };

  const saveEdit = async (id) => {
    const { error } = await supabase
      .from('paypal_accounts')
      .update({ balance: parseFloat(editBalance) || 0 })
      .eq('id', id);
    if (error) { alert('Error: ' + error.message); return; }
    setEditingId(null);
    loadData();
  };

  return (
    <div>
      <h1 className="page-title">PayPal Accounts</h1>

      {/* Add Form */}
      <div className="card">
        <h3>Link PayPal to Buyer</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Buyer Account</label>
            <select className="form-control" name="buyer_id" value={formData.buyer_id} onChange={handleChange} required>
              <option value="">Select Buyer</option>
              {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>PayPal Email</label>
            <input
              type="email"
              className="form-control"
              name="paypal_email"
              placeholder="paypal@example.com"
              value={formData.paypal_email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Balance ($)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              name="balance"
              placeholder="0.00"
              value={formData.balance}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn">Add</button>
        </form>
      </div>

      {/* Accounts Table */}
      <div className="card">
        <h3>All PayPal Accounts</h3>
        <table>
          <thead>
            <tr>
              <th>Buyer Account</th>
              <th>PayPal Email</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paypalAccounts.map(acc => (
              <tr key={acc.id}>
                <td><strong>{acc.buyer_name}</strong></td>
                <td style={{ color: '#1967d2' }}>{acc.paypal_email}</td>
                <td>
                  {editingId === acc.id ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        step="0.01"
                        value={editBalance}
                        onChange={e => setEditBalance(e.target.value)}
                        style={{ width: '110px', padding: '4px 8px', border: '1px solid var(--fiverr-green)', borderRadius: '4px', fontSize: '14px' }}
                        autoFocus
                      />
                      <button onClick={() => saveEdit(acc.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#137333' }}>
                        <Check size={18} />
                      </button>
                      <button onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e55850' }}>
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--fiverr-green)', fontSize: '16px' }}>
                        ${parseFloat(acc.balance).toFixed(2)}
                      </span>
                      <button onClick={() => startEdit(acc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#74767e' }}>
                        <Pencil size={15} />
                      </button>
                    </div>
                  )}
                </td>
                <td>
                  <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDelete(acc.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {paypalAccounts.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#74767e' }}>
                  No PayPal accounts added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PayPal;
