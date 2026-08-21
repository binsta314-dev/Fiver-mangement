import React, { useState, useEffect } from 'react';
import { Trash2, Pencil, Eye, EyeOff, Copy, Check, Plus, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

function Buyers() {
  const [buyers, setBuyers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState({});
  const [copiedField, setCopiedField] = useState(null);

  const [formData, setFormData] = useState({
    nord_server: '',
    name: '',
    email: '',
    password: '',
    country: '',
    status: 'Active'
  });

  const [editingBuyer, setEditingBuyer] = useState(null);

  useEffect(() => {
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
    const { data, error } = await supabase
      .from('buyers')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error loading buyers:', error);
      return;
    }
    setBuyers(data || []);
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
    if (!formData.name.trim()) {
      alert('Buyer name is required.');
      return;
    }

    const payload = {
      nord_server: formData.nord_server.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      country: formData.country.trim(),
      status: formData.status
    };

    if (editingBuyer) {
      const { error } = await supabase
        .from('buyers')
        .update(payload)
        .eq('id', editingBuyer.id);

      if (error) {
        alert('Error updating buyer: ' + error.message);
        return;
      }
      setEditingBuyer(null);
    } else {
      const { error } = await supabase
        .from('buyers')
        .insert(payload);

      if (error) {
        alert('Error adding buyer: ' + error.message);
        return;
      }
    }

    setFormData({
      nord_server: '',
      name: '',
      email: '',
      password: '',
      country: '',
      status: 'Active'
    });
    loadBuyers();
  };

  const handleEdit = (buyer) => {
    setEditingBuyer(buyer);
    setFormData({
      nord_server: buyer.nord_server || '',
      name: buyer.name || '',
      email: buyer.email || '',
      password: buyer.password || '',
      country: buyer.country || '',
      status: buyer.status || 'Active'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingBuyer(null);
    setFormData({
      nord_server: '',
      name: '',
      email: '',
      password: '',
      country: '',
      status: 'Active'
    });
  };

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from('buyers')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('Error updating status: ' + error.message);
      return;
    }
    loadBuyers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? All orders associated with this buyer will also be deleted.')) return;
    const { error } = await supabase.from('buyers').delete().eq('id', id);
    if (error) {
      alert('Error deleting buyer: ' + error.message);
      return;
    }
    loadBuyers();
  };

  const filteredBuyers = buyers.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.nord_server && item.nord_server.toLowerCase().includes(q)) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.country && item.country.toLowerCase().includes(q)) ||
      (item.status && item.status.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Buyer Accounts Management</h1>
      </div>

      {/* Form Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
          <UserCheck size={20} color="var(--fiverr-green)" />
          <h3 style={{ margin: 0 }}>{editingBuyer ? `Edit Buyer: ${editingBuyer.name}` : 'Add New Buyer Account'}</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
            <div className="form-group">
              <label>1. Nord Server / Time Zone</label>
              <input
                type="text"
                className="form-control"
                name="nord_server"
                placeholder="e.g. US #8121 / UK GMT"
                value={formData.nord_server}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>2. Buyer Name / Username *</label>
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="Buyer profile name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>3. Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="buyer@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>4. Password</label>
              <input
                type="text"
                className="form-control"
                name="password"
                placeholder="Account password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>5. Buyer Country</label>
              <input
                type="text"
                className="form-control"
                name="country"
                placeholder="e.g. United States, UK, Canada"
                value={formData.country}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>6. Buyer Profile Status</label>
              <select
                className="form-control"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="btn">
              {editingBuyer ? 'Update Buyer' : <><Plus size={16} /> Add Buyer</>}
            </button>
            {editingBuyer && (
              <button type="button" className="btn" style={{ backgroundColor: '#74767e' }} onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Buyers Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0 }}>All Buyer Accounts ({filteredBuyers.length})</h3>
          <input
            type="text"
            className="form-control"
            style={{ width: '280px' }}
            placeholder="Search buyers by name, country, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Nord Server / Timezone</th>
                <th>Buyer Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Country</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuyers.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.nord_server ? (
                      <span style={{ backgroundColor: '#f0f0f0', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                        {item.nord_server}
                      </span>
                    ) : (
                      <span style={{ color: '#aaa' }}>—</span>
                    )}
                  </td>
                  <td><strong>{item.name}</strong></td>
                  <td>
                    {item.email ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#1967d2' }}>{item.email}</span>
                        <button
                          onClick={() => handleCopy(item.email, `b-email-${item.id}`)}
                          title="Copy Email"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#74767e', padding: '2px' }}
                        >
                          {copiedField === `b-email-${item.id}` ? <Check size={14} color="#137333" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#aaa' }}>—</span>
                    )}
                  </td>
                  <td>
                    {item.password ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: showPassword[item.id] ? 'inherit' : 'monospace', fontSize: '13px' }}>
                          {showPassword[item.id] ? item.password : '••••••••'}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(item.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#74767e', padding: '2px' }}
                          title={showPassword[item.id] ? 'Hide' : 'Show'}
                        >
                          {showPassword[item.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => handleCopy(item.password, `b-pass-${item.id}`)}
                          title="Copy Password"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#74767e', padding: '2px' }}
                        >
                          {copiedField === `b-pass-${item.id}` ? <Check size={14} color="#137333" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#aaa' }}>—</span>
                    )}
                  </td>
                  <td>
                    {item.country ? (
                      <span style={{ fontWeight: '500' }}>{item.country}</span>
                    ) : (
                      <span style={{ color: '#aaa' }}>—</span>
                    )}
                  </td>
                  <td>
                    <select
                      value={item.status || 'Active'}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        cursor: 'pointer',
                        backgroundColor: (item.status === 'Blocked' || item.status === 'Block') ? '#fce8e6' : '#e6f4ea',
                        color: (item.status === 'Blocked' || item.status === 'Block') ? '#c5221f' : '#137333',
                        border: (item.status === 'Blocked' || item.status === 'Block') ? '1px solid #fad2cf' : '1px solid #ceead6'
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn"
                        style={{ padding: '6px 10px', backgroundColor: '#404145' }}
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 10px' }}
                        onClick={() => handleDelete(item.id)}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBuyers.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#74767e' }}>
                    No buyer accounts found.
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

export default Buyers;
