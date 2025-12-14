import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getSweets,
  createSweet,
  updateSweet,
  deleteSweet,
  restockSweet,
  Sweet,
  CreateSweetData,
} from '../api/sweets';
import { formatPrice } from '../utils/format';
import toast from 'react-hot-toast';
import './AdminPanel.css';

const AdminPanel = () => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AdminPanel.tsx:15', message: 'AdminPanel component rendered', data: { timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
  // #endregion
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [restockSweetId, setRestockSweetId] = useState<string | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('');

  const queryClient = useQueryClient();

  const { data: sweets = [], isLoading, error: queryError } = useQuery<Sweet[]>('sweets', getSweets, {
    onError: (error: any) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AdminPanel.tsx:24', message: 'Query error occurred', data: { error: error?.message, status: error?.response?.status, code: error?.code }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion
      console.error('Query error:', error);
      toast.error('Failed to load sweets. Please refresh the page.');
    },
    retry: 1,
  });
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AdminPanel.tsx:29', message: 'Query state after useQuery', data: { isLoading, hasError: !!queryError, dataLength: sweets?.length || 0 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
  // #endregion

  const createMutation = useMutation(createSweet, {
    onSuccess: async () => {
      try {
        await queryClient.invalidateQueries('sweets');
        toast.success('Sweet created successfully!');
        setIsModalOpen(false);
        setEditingSweet(null);
      } catch (error) {
        console.error('Error invalidating queries:', error);
        toast.error('Sweet created but failed to refresh list. Please refresh the page.');
        setIsModalOpen(false);
        setEditingSweet(null);
      }
    },
    onError: (error: any) => {
      console.error('Create sweet error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || error.message || 'Failed to create sweet';
      toast.error(errorMessage);
      // Don't close modal on error so user can fix and retry
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<CreateSweetData> }) => updateSweet(id, data),
    {
      onSuccess: async () => {
        try {
          await queryClient.invalidateQueries('sweets');
          toast.success('Sweet updated successfully!');
          setIsModalOpen(false);
          setEditingSweet(null);
        } catch (error) {
          console.error('Error invalidating queries:', error);
          toast.error('Sweet updated but failed to refresh list. Please refresh the page.');
          setIsModalOpen(false);
          setEditingSweet(null);
        }
      },
      onError: (error: any) => {
        console.error('Update sweet error:', error);
        const errorMessage = error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || error.message || 'Failed to update sweet';
        toast.error(errorMessage);
      },
    }
  );

  const deleteMutation = useMutation(deleteSweet, {
    onSuccess: async () => {
      try {
        await queryClient.invalidateQueries('sweets');
        toast.success('Sweet deleted successfully!');
      } catch (error) {
        console.error('Error invalidating queries:', error);
        toast.error('Sweet deleted but failed to refresh list. Please refresh the page.');
      }
    },
    onError: (error: any) => {
      console.error('Delete sweet error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete sweet';
      toast.error(errorMessage);
    },
  });

  const restockMutation = useMutation(
    ({ id, quantity }: { id: string; quantity: number }) => restockSweet(id, quantity),
    {
      onSuccess: async () => {
        try {
          await queryClient.invalidateQueries('sweets');
          toast.success('Sweet restocked successfully!');
          setRestockSweetId(null);
          setRestockQuantity('');
        } catch (error) {
          console.error('Error invalidating queries:', error);
          toast.error('Sweet restocked but failed to refresh list. Please refresh the page.');
          setRestockSweetId(null);
          setRestockQuantity('');
        }
      },
      onError: (error: any) => {
        console.error('Restock sweet error:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Failed to restock sweet';
        toast.error(errorMessage);
      },
    }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const data: CreateSweetData = {
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        price: parseFloat(formData.get('price') as string),
        quantity: parseInt(formData.get('quantity') as string),
      };

      // Validate data
      if (!data.name || !data.category || isNaN(data.price) || isNaN(data.quantity)) {
        toast.error('Please fill in all fields with valid values');
        return;
      }

      if (editingSweet) {
        updateMutation.mutate({ id: editingSweet.id, data });
      } else {
        createMutation.mutate(data);
      }
    } catch (error) {
      console.error('Form submit error:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sweet?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockSweetId && restockQuantity) {
      restockMutation.mutate({
        id: restockSweetId,
        quantity: parseInt(restockQuantity),
      });
    }
  };

  const openEditModal = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingSweet(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSweet(null);
  };

  // Always render the page structure, even during loading or errors
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c49dae96-4ee7-4b7f-a49b-2dc2505269f5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'AdminPanel.tsx:177', message: 'Render decision point', data: { isLoading, hasError: !!queryError }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
  // #endregion

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button onClick={openCreateModal} className="btn-primary">
          Add New Sweet
        </button>
      </div>

      {isLoading && (
        <div className="loading">Loading...</div>
      )}
      {!!queryError && (
        <div className="error-container">
          <h2>Error Loading Sweets</h2>
          <p>Unable to load sweets. Please check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Refresh Page
          </button>
        </div>
      )}
      {!isLoading && !queryError && (
        <div className="sweets-table-container">
          <table className="sweets-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sweets && sweets.length > 0 ? sweets.map((sweet) => (
                <tr key={sweet.id}>
                  <td>{sweet.name}</td>
                  <td>{sweet.category}</td>
                  <td>${formatPrice(sweet.price)}</td>
                  <td>{sweet.quantity}</td>
                  <td className="actions">
                    <button onClick={() => openEditModal(sweet)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => setRestockSweetId(sweet.id)} className="btn-restock">
                      Restock
                    </button>
                    <button onClick={() => handleDelete(sweet.id)} className="btn-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    No sweets found. Click "Add New Sweet" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingSweet ? 'Edit Sweet' : 'Add New Sweet'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingSweet?.name}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  defaultValue={editingSweet?.category}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  defaultValue={editingSweet?.price}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="0"
                  defaultValue={editingSweet?.quantity}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingSweet ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {restockSweetId && (
        <div className="modal-overlay" onClick={() => setRestockSweetId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Restock Sweet</h2>
            <form onSubmit={handleRestock}>
              <div className="form-group">
                <label>Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setRestockSweetId(null)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
