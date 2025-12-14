import { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { getSweets, searchSweets, purchaseSweet, Sweet, SearchFilters } from '../api/sweets';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const { addToCart } = useCartStore();

  const filters: SearchFilters = useMemo(() => {
    const f: SearchFilters = {};
    if (searchTerm) f.name = searchTerm;
    if (categoryFilter) f.category = categoryFilter;
    if (minPrice) f.minPrice = parseFloat(minPrice);
    if (maxPrice) f.maxPrice = parseFloat(maxPrice);
    return f;
  }, [searchTerm, categoryFilter, minPrice, maxPrice]);

  const hasFilters = searchTerm || categoryFilter || minPrice || maxPrice;

  const { data: sweets = [], isLoading, error: queryError, refetch } = useQuery<Sweet[]>(
    ['sweets', filters],
    () => (hasFilters ? searchSweets(filters) : getSweets()),
    {
      refetchInterval: 30000,
      retry: 1,
      onError: (error: any) => {
        console.error('Query error:', error);
        if (error.response?.status !== 401) {
          toast.error('Failed to load sweets. Please refresh the page.');
        }
      },
    }
  );

  const categories = useMemo(() => {
    const cats = new Set<string>();
    sweets.forEach((sweet) => cats.add(sweet.category));
    return Array.from(cats).sort();
  }, [sweets]);

  const handlePurchase = async (sweet: Sweet, quantity: number = 1) => {
    try {
      await purchaseSweet(sweet.id, quantity);
      addToCart({ ...sweet, quantity });
      toast.success(`Added ${sweet.name} to cart!`);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Purchase failed');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setMinPrice('');
    setMaxPrice('');
  };

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading sweets...</div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <h2>Error Loading Sweets</h2>
          <p>Unable to load sweets. Please check your connection and try again.</p>
          <button onClick={() => refetch()} className="btn-primary" style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Sweet Shop</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="filter-input"
          min="0"
          step="0.01"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="filter-input"
          min="0"
          step="0.01"
        />
        {(hasFilters) && (
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        )}
      </div>
      <div className="sweets-count">
        {sweets.length} {sweets.length === 1 ? 'sweet' : 'sweets'} found
      </div>
      <div className="sweets-grid">
        {sweets && sweets.length > 0 ? (
          sweets.map((sweet) => (
            <div key={sweet.id} className="sweet-card">
              <div className="sweet-image">🍬</div>
              <div className="sweet-info">
                <h3>{sweet.name}</h3>
                <p className="sweet-category">{sweet.category}</p>
                <p className="sweet-price">${sweet.price.toFixed(2)}</p>
                <p className="sweet-quantity">
                  {sweet.quantity > 0 ? `${sweet.quantity} in stock` : 'Out of stock'}
                </p>
              </div>
              <button
                onClick={() => handlePurchase(sweet, 1)}
                disabled={sweet.quantity === 0}
                className="purchase-btn"
              >
                {sweet.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          ))
        ) : null}
      </div>
      {(!sweets || sweets.length === 0) && !isLoading && (
        <div className="no-sweets">No sweets found. Try adjusting your filters.</div>
      )}
    </div>
  );
};

export default Dashboard;
