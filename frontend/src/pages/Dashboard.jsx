import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItems, createItem, updateItem, deleteItem, logout } from '../api';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const data = await getItems();
      setItems(data);
    } catch (err) {
      setApiError(err.message);
      if (err.message.includes('login')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  function validate() {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title must be under 100 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    try {
      if (editingId) {
        await updateItem(editingId, title, description);
      } else {
        await createItem(title, description);
      }
      setTitle('');
      setDescription('');
      setEditingId(null);
      fetchItems();
    } catch (err) {
      setApiError(err.message);
    }
  }

  function handleEdit(item) {
    setEditingId(item._id);
    setTitle(item.title);
    setDescription(item.description || '');
    setErrors({});
  }

  function handleCancel() {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setErrors({});
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem(id);
      fetchItems();
    } catch (err) {
      setApiError(err.message);
    }
  }

  return (
    <div className="dashboard">
      <div className="header">
        <div>
          <h2>Welcome, {user.name || 'User'}!</h2>
          <p style={{ color: '#666' }}>{user.email}</p>
        </div>
        <button className="btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {apiError && <div className="error-box">{apiError}</div>}

      <div className="add-form">
        <h2>{editingId ? 'Edit Item' : 'Add New Item'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter item title"
            />
            {errors.title && <div className="error">{errors.title}</div>}
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-success">
              {editingId ? 'Update' : 'Add Item'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h2>My Items</h2>
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <div className="no-items">No items yet. Add your first item above!</div>
      ) : (
        items.map((item) => (
          <div className="item-card" key={item._id}>
            <h3>{item.title}</h3>
            <p>{item.description || 'No description'}</p>
            <div className="item-actions">
              <button onClick={() => handleEdit(item)}>Edit</button>
              <button className="btn-danger" onClick={() => handleDelete(item._id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;
