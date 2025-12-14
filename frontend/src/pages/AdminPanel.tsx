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
import toast from 'react-hot-toast';
import './AdminPanel.css';

const AdminPanel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [restockSweetId, setRestockSweetId] = useState<string | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('');

  const queryClient = useQueryClient();

  const { data: sweets = [], isLoading, error: queryError } = useQuery<Sweet[]>('sweets', getSweets, {
    onError: (error: any) => {
      console.error('Query error:', error);
      toast.error('Failed to load sweets. Please refresh the page.');
    },
    retry: 1,
  });

  const createMutation = useMutation(createSweet, {
    onSuccess: async () => {
      try {
        await queryClient.invalidateQueries('sweets');
        toast.success('Sweet created successfully!');
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error invalidating queries:', error);
        toast.error('Sweet created but failed to refresh list. Please refresh the page.');
        setIsModalOpen(false);
      }
    },
    onError: (error: any) => {
      console.error('Create sweet error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create sweet';
      toast.error(errorMessage);
      // Don't close modal on error so user can fix and retry
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<CreateSweetData> }) => updateSweet(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sweets');
        toast.success('Sweet updated successfully!');
        setIsModalOpen(false);
        setEditingSweet(null);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to update sweet');
      },
    }
  );

  const deleteMutation = useMutation(deleteSweet, {
    onSuccess: () => {
      queryClient.invalidateQueries('sweets');
      toast.success('Sweet deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete sweet');
    },
  });

  const restockMutation = useMutation(
    ({ id, quantity }: { id: string; quantity: number }) => restockSweet(id, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('sweets');
        toast.success('Sweet restocked successfully!');
        setRestockSweetId(null);
        setRestockQuantity('');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to restock sweet');
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

  if (isLoading) {
    return <div className="admin-panel">Loading...</div>;
  }

  if (queryError) {
    return (
      <div className="admin-panel">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Error Loading Sweets</h2>
          <p>Unable to load sweets. Please check your connection and try again.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <button onClick={openCreateModal} className="btn-primary">
          Add New Sweet
        </button>
      </div>

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
            {sweets.map((sweet) => (
              <tr key={sweet.id}>
                <td>{sweet.name}</td>
                <td>{sweet.category}</td>
                <td>${sweet.price.toFixed(2)}</td>
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
            ))}
          </tbody>
        </table>
      </div>

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
