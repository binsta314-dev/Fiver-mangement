import React, { useState, useEffect } from 'react';
import { Trash2, Pencil, Eye, EyeOff, Copy, Check, Plus, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

function Emails() {
  const [emails, setEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState({});
  const [copiedField, setCopiedField] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    recovery_info: '',
    linked_accounts: '',
    security_answer: ''
  });

  const [editingEmail, setEditingEmail] = useState(null);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    const { data, error } = await supabase
      .from('email_accounts')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error loading emails:', error);
      return;
    }
    setEmails(data || []);
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
    if (!formData.email.trim()) {
      alert('Email address is required.');
      return;
    }

    if (editingEmail) {
      const { error } = await supabase
        .from('email_accounts')
        .update({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          recovery_info: formData.recovery_info.trim(),
          linked_accounts: formData.linked_accounts.trim(),
          security_answer: formData.security_answer.trim()
        })
        .eq('id', editingEmail.id);

      if (error) {
        alert('Error updating email: ' + error.message);
        return;
      }
      setEditingEmail(null);
    } else {
      const { error } = await supabase
        .from('email_accounts')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          recovery_info: formData.recovery_info.trim(),
          linked_accounts: formData.linked_accounts.trim(),
          security_answer: formData.security_answer.trim()
        });

      if (error) {
        alert('Error adding email: ' + error.message);
        return;
      }
    }

    setFormData({
      name: '',
      email: '',
      password: '',
      recovery_info: '',
      linked_accounts: '',
      security_answer: ''
    });
    loadEmails();
  };

  const handleEdit = (item) => {
    setEditingEmail(item);
    setFormData({
      name: item.name || '',
      email: item.email || '',
      password: item.password || '',
      recovery_info: item.recovery_info || '',
      linked_accounts: item.linked_accounts || '',
      security_answer: item.security_answer || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingEmail(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      recovery_info: '',
      linked_accounts: '',
      security_answer: ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this email account?')) return;
    const { error } = await supabase.from('email_accounts').delete().eq('id', id);
    if (error) {
      alert('Error deleting: ' + error.message);
      return;
    }
    loadEmails();
  };

  const filteredEmails = emails.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.linked_accounts && item.linked_accounts.toLowerCase().includes(q)) ||
      (item.recovery_info && item.recovery_info.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Email Accounts Management</h1>
      </div>

      {/* Form Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
          <Mail size={20} color="var(--fiverr-green)" />
          <h3 style={{ margin: 0 }}>{editingEmail ? `Edit Email: ${editingEmail.email}` : 'Add New Email Account'}</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px' }}>
            <div className="form-group">
              <label>Name / Label</label>
              <input
                type="text"
                className="form-control"
                name="name"
                placeholder="e.g. John Doe / Work Email"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="text"
                className="form-control"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Recovery (Email / Phone Number)</label>
              <input
                type="text"
                className="form-control"
                name="recovery_info"
                placeholder="recovery@email.com or +123456789"
                value={formData.recovery_info}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Accounts on Email (PayPal, Fiverr, Upwork, etc.)</label>
              <input
                type="text"
                className="form-control"
                name="linked_accounts"
                placeholder="e.g. Fiverr, PayPal, Upwork, Facebook"
                value={formData.linked_accounts}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Security Answer / Custom Info</label>
              <input
                type="text"
                className="form-control"
                name="security_answer"
                placeholder="e.g. Q: First Pet? A: Max"
                value={formData.security_answer}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="btn">
              {editingEmail ? 'Update Email' : <><Plus size={16} /> Add Email</>}
            </button>
            {editingEmail && (
              <button type="button" className="btn" style={{ backgroundColor: '#74767e' }} onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0 }}>All Email Accounts ({filteredEmails.length})</h3>
          <input
            type="text"
            className="form-control"
            style={{ width: '280px' }}
            placeholder="Search by name, email, accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Password</th>
                <th>Recovery Info</th>
                <th>Accounts On Email</th>
                <th>Security Answer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmails.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.name || '—'}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#1967d2', fontWeight: '500' }}>{item.email}</span>
                      <button
                        onClick={() => handleCopy(item.email, `email-${item.id}`)}
                        title="Copy Email"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#74767e', padding: '2px' }}
                      >
                        {copiedField === `email-${item.id}` ? <Check size={14} color="#137333" /> : <Copy size={14} />}
                      </button>
                    </div>
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
                          onClick={() => handleCopy(item.password, `pass-${item.id}`)}
                          title="Copy Password"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#74767e', padding: '2px' }}
                        >
                          {copiedField === `pass-${item.id}` ? <Check size={14} color="#137333" /> : <Copy size={14} />}
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#aaa' }}>—</span>
                    )}
                  </td>
                  <td>{item.recovery_info || <span style={{ color: '#aaa' }}>—</span>}</td>
                  <td>
                    {item.linked_accounts ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {item.linked_accounts.split(',').map((acc, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: '#e8f0fe',
                              color: '#1967d2',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}
                          >
                            {acc.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#aaa' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '13px', color: '#404145' }}>
                      {item.security_answer || '—'}
                    </span>
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
              {filteredEmails.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#74767e' }}>
                    No email accounts found.
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

export default Emails;
