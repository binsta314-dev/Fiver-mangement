import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function Accounts() {
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  
  const [newSeller, setNewSeller] = useState('');
  const [newBuyer, setNewBuyer] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    if (window.electronAPI) {
      const s = await window.electronAPI.getSellers();
      const b = await window.electronAPI.getBuyers();
      setSellers(s);
      setBuyers(b);
    }
  };

  const handleAddSeller = async (e) => {
    e.preventDefault();
    if (!newSeller.trim()) return;
    if (window.electronAPI) {
      await window.electronAPI.addSeller(newSeller);
      setNewSeller('');
      loadAccounts();
    }
  };

  const handleDeleteSeller = async (id) => {
    if (window.confirm('Are you sure? This will delete all orders associated with this seller as well.')) {
      if (window.electronAPI) {
        await window.electronAPI.deleteSeller(id);
        loadAccounts();
      }
    }
  };

  const handleAddBuyer = async (e) => {
    e.preventDefault();
    if (!newBuyer.trim()) return;
    if (window.electronAPI) {
      await window.electronAPI.addBuyer(newBuyer);
      setNewBuyer('');
      loadAccounts();
    }
  };

  const handleDeleteBuyer = async (id) => {
    if (window.confirm('Are you sure? This will delete all orders associated with this buyer as well.')) {
      if (window.electronAPI) {
        await window.electronAPI.deleteBuyer(id);
        loadAccounts();
      }
    }
  };

  return (
    <div>
      <h1 className="page-title">Accounts Management</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Sellers Section */}
        <div className="card">
          <h3>Seller Accounts</h3>
          <form onSubmit={handleAddSeller} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="New Seller Name" 
              value={newSeller} 
              onChange={e => setNewSeller(e.target.value)} 
            />
            <button type="submit" className="btn">Add</button>
          </form>
          
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
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

        {/* Buyers Section */}
        <div className="card">
          <h3>Buyer Accounts</h3>
          <form onSubmit={handleAddBuyer} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="New Buyer Name" 
              value={newBuyer} 
              onChange={e => setNewBuyer(e.target.value)} 
            />
            <button type="submit" className="btn">Add</button>
          </form>
          
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
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
