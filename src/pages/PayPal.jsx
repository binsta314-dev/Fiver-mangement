import React, { useState, useEffect } from 'react';
import { Trash2, Pencil, Eye, EyeOff, Copy, Check, Plus, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';

function PayPal() {
  const [paypalAccounts, setPaypalAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState({});
  const [copiedField, setCopiedField] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    nord_server: '',
    email: '',
    password: '',
    security_info: '',
    status: 'In Use',
    balance: ''
  });

  const [editingAccount, setEditingAccount] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data, error } = await supabase
      .from('paypal_accounts')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error loading paypal accounts:', error);
      return;
    }
    setPaypalAccounts(data || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopy = (text, fieldId) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Name and Email are required.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      nord_server: formData.nord_server.trim(),
      email: formData.email.trim(),
      password: formData.password,
      security_info: formData.security_info.trim(),
      status: formData.status,
      balance: parseFloat(formData.balance) || 0
    };

    if (editingAccount) {
      const { error } = await supabase
        .from('paypal_accounts')
        .update(payload)
        .eq('id', editingAccount.id);

      if (error) {
        alert('Error updating PayPal account: ' + error.message);
        return;
      }
      setEditingAccount(null);
    } else {
      const { error } = await supabase
        .from('paypal_accounts')
        .insert(payload);

      if (error) {
        alert('Error adding PayPal account: ' + error.message);
        return;
      }
    }

    setFormData({
      name: '',
      nord_server: '',
      email: '',
      password: '',
      security_info: '',
      status: 'In Use',
      balance: ''
    });
    loadData();
  };

  const handleEdit = (item) => {
    setEditingAccount(item);
    setFormData({
      name: item.name || '',
      nord_server: item.nord_server || '',
      email: item.email || item.paypal_email || '',
      password: item.password || '',
      security_info: item.security_info || '',
      status: item.status || 'In Use',
      balance: item.balance !== undefined ? item.balance : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
    setFormData({
      name: '',
      nord_server: '',
      email: '',
      password: '',
      security_info: '',
      status: 'In Use',
      balance: ''
    });
  };

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from('paypal_accounts')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('Error updating status: ' + error.message);
      return;
    }
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this PayPal account?')) return;
    const { error } = await supabase.from('paypal_accounts').delete().eq('id', id);
    if (error) {
      alert('Error deleting: ' + error.message);
      return;
    }
    loadData();
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'In Use':
        return { backgroundColor: '#e6f4ea', color: '#137333', border: '1px solid #ceead6' };
      case 'Blocked':
        return { backgroundColor: '#fce8e6', color: '#c5221f', border: '1px solid #fad2cf' };
      case 'Card Decline':
        return { backgroundColor: '#fef7e0', color: '#b06000', border: '1px solid #feefc3' };
      case 'Suspended':
        return { backgroundColor: '#f1f3f4', color: '#5f6368', border: '1px solid #dadce0' };
      default:
        return { backgroundColor: '#e8f0fe', color: '#1967d2', border: '1px solid #d2e3fc' };
    }
  };

  const filteredAccounts = paypalAccounts.filter(item => {
    const q = searchTerm.toLowerCase();
    const emailVal = item.email || item.paypal_email || '';
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.nord_server && item.nord_server.toLowerCase().includes(q)) ||
      emailVal.toLowerCase().includes(q) ||
      (item.status && item.status.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>PayPal Accounts Management</h1>
      </div>

      {/* Add / Edit Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
          <Wallet size={20} color="var(--fiverr-green)" />
          <h3 style={{ margin: 0 }}>{editingAccount ? `Edit PayPal: ${editingAccount.name}` : 'Add New PayPal Account'}</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
            <div className="form-group">
              <label>1. Name *</label>
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Account Name / Holder"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>2. Nord Server / Time Zone</label>
              <input
                type="text"
                className="form-control"
                name="nord_server"
                placeholder="e.g. US #9182 / EST UTC-5"
                value={formData.nord_server}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>3. PayPal Email *</label>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="paypal@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>4. Password</label>
              <input
                type="text"
                className="form-control"
                name="password"
                placeholder="PayPal Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>5. Security Questions / Answers</label>
              <input
                type="text"
                className="form-control"
                name="security_info"
                placeholder="Custom security Q/A or notes"
                value={formData.security_info}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>6. Status</label>
              <select
                className="form-control"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="In Use">In Use</option>
                <option value="Blocked">Blocked</option>
                <option value="Card Decline">Card Decline</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div className="form-group">
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
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="btn">
              {editingAccount ? 'Update PayPal Account' : <><Plus size={16} /> Add PayPal Account</>}
            </button>
            {editingAccount && (
              <button type="button" className="btn" style={{ backgroundColor: '#74767e' }} onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0 }}>All PayPal Accounts ({filteredAccounts.length})</h3>
          <input
            type="text"
            className="form-control"
            style={{ width: '280px' }}
            placeholder="Search PayPal accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Nord Server / Timezone</th>
                <th>Email</th>
                <th>Password</th>
                <th>Security Info</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map(acc => {
                const emailVal = acc.email || acc.paypal_email || '—';
                return (
                  <tr key={acc.id}>
                    <td><strong>{acc.name || '—'}</strong></td>
                    <td>
                      {acc.nord_server ? (
                        <span style={{ backgroundColor: '#f0f0f0', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                          {acc.nord_server}
                        </span>
                      ) : (
                        <span style={{ color: '#aaa' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#1967d2', fontWeight: '500' }}>{emailVal}</span>
                        {emailVal !== '—' && (
                          <button
                            onClick={() => handleCopy(emailVal, `email-${acc.id}`)}
                            title="Copy Email"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#74767e', padding: '2px' }}
                          >
                            {copiedField === `email-${acc.id}` ? <Check size={14} color="#137333" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      {acc.password ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: showPassword[acc.id] ? 'inherit' : 'monospace', fontSize: '13px' }}>
                            {showPassword[acc.id] ? acc.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(acc.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#74767e', padding: '2px' }}
                            title={showPassword[acc.id] ? 'Hide' : 'Show'}
                          >
                            {showPassword[acc.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => handleCopy(acc.password, `pass-${acc.id}`)}
                            title="Copy Password"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#74767e', padding: '2px' }}
                          >
                            {copiedField === `pass-${acc.id}` ? <Check size={14} color="#137333" /> : <Copy size={14} />}
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#aaa' }}>—</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: '#404145' }}>
                        {acc.security_info || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 'bold', color: 'var(--fiverr-green)', fontSize: '15px' }}>
                        ${acc.balance !== undefined && acc.balance !== null ? parseFloat(acc.balance).toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={acc.status || 'In Use'}
                        onChange={(e) => handleStatusChange(acc.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                          ...getStatusBadgeStyle(acc.status || 'In Use')
                        }}
                      >
                        <option value="In Use">In Use</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Card Decline">Card Decline</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn"
                          style={{ padding: '6px 10px', backgroundColor: '#404145' }}
                          onClick={() => handleEdit(acc)}
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '6px 10px' }}
                          onClick={() => handleDelete(acc.id)}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#74767e' }}>
                    No PayPal accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PayPal;
