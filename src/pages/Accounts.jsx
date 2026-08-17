import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Accounts() {
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [newSeller, setNewSeller] = useState('');
  const [newBuyer, setNewBuyer] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const { data: s } = await supabase.from('sellers').select('*').order('id');
    const { data: b } = await supabase.from('buyers').select('*').order('id');
    setSellers(s || []);
    setBuyers(b || []);
  };

  const handleAddSeller = async (e) => {
    e.preventDefault();
    if (!newSeller.trim()) return;
    const { error } = await supabase.from('sellers').insert({ name: newSeller.trim() });
    if (error) { alert('Error: ' + error.message); return; }
    setNewSeller('');
    loadAccounts();
  };

  const handleDeleteSeller = async (id) => {
    if (!window.confirm('Are you sure? All orders for this seller will also be deleted.')) return;
    await supabase.from('sellers').delete().eq('id', id);
    loadAccounts();
  };

  const handleAddBuyer = async (e) => {
    e.preventDefault();
    if (!newBuyer.trim()) return;
    const { error } = await supabase.from('buyers').insert({ name: newBuyer.trim() });
    if (error) { alert('Error: ' + error.message); return; }
    setNewBuyer('');
    loadAccounts();
  };

  const handleDeleteBuyer = async (id) => {
    if (!window.confirm('Are you sure? All orders for this buyer will also be deleted.')) return;
    await supabase.from('buyers').delete().eq('id', id);
    loadAccounts();
  };

  return (
    <div>
      <h1 className="page-title">Accounts Management</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

        {/* Sellers */}
        <div className="card">
          <h3>Seller Accounts</h3>
          <form onSubmit={handleAddSeller} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input type="text" className="form-control" placeholder="New Seller Name" value={newSeller} onChange={e => setNewSeller(e.target.value)} />
            <button type="submit" className="btn">Add</button>
          </form>
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {sellers.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>
                    <Link to={`/seller/${s.id}`} style={{ color: 'var(--fiverr-green)', textDecoration: 'none', fontWeight: 'bold' }}>
                      {s.name}
                    </Link>
                  </td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDeleteSeller(s.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Buyers */}
        <div className="card">
          <h3>Buyer Accounts</h3>
          <form onSubmit={handleAddBuyer} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input type="text" className="form-control" placeholder="New Buyer Name" value={newBuyer} onChange={e => setNewBuyer(e.target.value)} />
            <button type="submit" className="btn">Add</button>
          </form>
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {buyers.map(b => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.name}</td>
                  <td>
                    <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDeleteBuyer(b.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default Accounts;
