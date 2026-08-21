import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Accounts() {
  const [sellers, setSellers] = useState([]);
  const [newSeller, setNewSeller] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    const { data: s, error } = await supabase.from('sellers').select('*').order('id');
    if (error) {
      console.error('Error loading sellers:', error);
      return;
    }
    setSellers(s || []);
  };

  const handleAddSeller = async (e) => {
    e.preventDefault();
    if (!newSeller.trim()) return;
    const { error } = await supabase.from('sellers').insert({ name: newSeller.trim() });
    if (error) {
      alert('Error: ' + error.message);
      return;
    }
    setNewSeller('');
    loadSellers();
  };

  const handleDeleteSeller = async (id) => {
    if (!window.confirm('Are you sure? All orders associated with this seller will also be deleted.')) return;
    const { error } = await supabase.from('sellers').delete().eq('id', id);
    if (error) {
      alert('Error deleting seller: ' + error.message);
      return;
    }
    loadSellers();
  };

  const filteredSellers = sellers.filter(s =>
    s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="page-title">Seller Accounts Management</h1>

      {/* Add Seller Card */}
      <div className="card" style={{ maxWidth: '600px', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
          <Store size={20} color="var(--fiverr-green)" />
          <h3 style={{ margin: 0 }}>Add New Seller Account</h3>
        </div>
        <form onSubmit={handleAddSeller} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Seller Profile Name (e.g. GraphicPro24)"
            value={newSeller}
            onChange={e => setNewSeller(e.target.value)}
            required
          />
          <button type="submit" className="btn">
            <Plus size={16} /> Add
          </button>
        </form>
      </div>

      {/* Sellers List Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0 }}>All Seller Profiles ({filteredSellers.length})</h3>
          <input
            type="text"
            className="form-control"
            style={{ width: '280px' }}
            placeholder="Search seller accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Seller Profile Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.map(s => (
                <tr key={s.id}>
                  <td style={{ color: '#74767e', width: '80px' }}>#{s.id}</td>
                  <td>
                    <Link
                      to={`/seller/${s.id}`}
                      style={{
                        color: 'var(--fiverr-green)',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        fontSize: '15px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {s.name}
                      <span style={{ fontSize: '12px', color: '#74767e', fontWeight: 'normal' }}>
                        (Click to open profile ↗)
                      </span>
                    </Link>
                  </td>
                  <td style={{ width: '100px' }}>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 10px' }}
                      onClick={() => handleDeleteSeller(s.id)}
                      title="Delete Seller"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSellers.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#74767e' }}>
                    No seller accounts found.
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

export default Accounts;
