import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle, X } from 'lucide-react';
import { productsApi } from '../../api/products';
import { salesApi } from '../../api/sales';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import './NewSalePage.css';

export default function NewSalePage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [isCredit, setIsCredit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (err) {
      toast.error('Failed to load products');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    const existing = cart.find(c => c.productId === product.id);
    if (existing) {
      toast.warning('Product already in cart. Adjust quantity below.');
      setShowProducts(false);
      return;
    }
    setCart([...cart, {
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      maxStock: Number(product.current_stock),
      quantity: 1,
      sellingPrice: Number(product.purchase_price),
      purchasePrice: Number(product.purchase_price),
    }]);
    setShowProducts(false);
    setSearch('');
  };

  const updateCartItem = (index, field, value) => {
    setCart(prev => prev.map((item, i) => {
      if (i !== index) return item;
      return { ...item, [field]: value };
    }));
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0);

  const handleSubmit = async () => {
    // Validate
    for (const item of cart) {
      if (item.quantity <= 0) {
        toast.error(`Quantity must be greater than 0 for ${item.productName}`);
        return;
      }
      if (item.quantity > item.maxStock) {
        toast.error(`Not enough stock for ${item.productName}. Available: ${item.maxStock}`);
        return;
      }
      if (item.sellingPrice <= 0) {
        toast.error(`Selling price must be greater than 0 for ${item.productName}`);
        return;
      }
    }

    setLoading(true);
    try {
      const items = cart.map(c => ({
        productId: c.productId,
        quantity: Number(c.quantity),
        sellingPrice: Number(c.sellingPrice),
      }));
      await salesApi.create(items, isCredit);
      setSuccess(true);
      setCart([]);
      setIsCredit(false);
      loadProducts(); // Refresh stock
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page">
        <div className="sale-success">
          <div className="sale-success-icon">
            <CheckCircle size={64} />
          </div>
          <h2>Sale Recorded!</h2>
          <p className="text-muted">The sale has been recorded successfully.</p>
          <button className="btn btn-primary btn-lg mt-6" onClick={() => setSuccess(false)}>
            <Plus size={20} /> New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">New Sale</h1>
        <p className="page-subtitle">Add products and record the sale</p>
      </div>

      {/* Add Product Button */}
      <button className="btn btn-primary btn-block mb-5" onClick={() => setShowProducts(true)}>
        <Plus size={20} /> Add Product
      </button>

      {/* Product Picker Modal */}
      {showProducts && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setShowProducts(false);
        }}>
          <div className="modal-content">
            <div className="modal-handle" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="modal-title" style={{margin:0}}>Select Product</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowProducts(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="search-bar mb-4">
              <span className="search-bar-icon"><Search size={18} /></span>
              <input
                className="form-input"
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="product-picker-list">
              {filteredProducts.length === 0 ? (
                <div className="empty-state" style={{padding: 'var(--space-8) 0'}}>
                  <p className="text-muted">No products found</p>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <button
                    key={product.id}
                    className="product-picker-item"
                    onClick={() => addToCart(product)}
                    disabled={Number(product.current_stock) <= 0}
                  >
                    <div className="product-picker-info">
                      <div className="product-picker-name">{product.name}</div>
                      <div className="product-picker-meta">
                        {product.category} · {formatNumber(product.current_stock)} {product.unit}
                      </div>
                    </div>
                    <div className="product-picker-price">
                      {formatCurrency(product.purchase_price)}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart */}
      {cart.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <ShoppingCart size={48} />
          </div>
          <p className="empty-state-title">Cart is empty</p>
          <p className="empty-state-text">Tap "Add Product" to start building a sale</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item, index) => (
              <div key={item.productId} className="cart-item card">
                <div className="cart-item-header">
                  <div>
                    <div className="cart-item-name">{item.productName}</div>
                    <div className="cart-item-stock text-sm text-muted">
                      Stock: {formatNumber(item.maxStock)} {item.unit}
                    </div>
                  </div>
                  <button className="btn btn-icon btn-ghost" onClick={() => removeFromCart(index)}>
                    <Trash2 size={18} color="var(--color-danger)" />
                  </button>
                </div>

                <div className="cart-item-fields">
                  <div className="form-group">
                    <label className="form-label">Qty ({item.unit})</label>
                    <div className="qty-control">
                      <button
                        className="btn btn-icon btn-secondary btn-sm"
                        onClick={() => updateCartItem(index, 'quantity', Math.max(0.5, item.quantity - (item.unit === 'meter' ? 0.5 : 1)))}
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        className="form-input qty-input"
                        type="number"
                        step={item.unit === 'meter' ? '0.5' : '1'}
                        min="0"
                        value={item.quantity}
                        onChange={(e) => updateCartItem(index, 'quantity', Number(e.target.value))}
                      />
                      <button
                        className="btn btn-icon btn-secondary btn-sm"
                        onClick={() => updateCartItem(index, 'quantity', item.quantity + (item.unit === 'meter' ? 0.5 : 1))}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {item.quantity > item.maxStock && (
                      <span className="form-error">Exceeds stock!</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price (ETB)</label>
                    <input
                      className="form-input"
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.sellingPrice}
                      onChange={(e) => updateCartItem(index, 'sellingPrice', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="cart-item-subtotal">
                  Subtotal: <strong>{formatCurrency(item.quantity * item.sellingPrice)}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Sale Summary */}
          <div className="sale-summary card">
            <div className="sale-summary-row">
              <span>Items</span>
              <strong>{cart.length}</strong>
            </div>
            <div className="sale-summary-row sale-summary-total">
              <span>Total</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </div>

            <div className="sale-credit-toggle mt-4">
              <label className="toggle">
                <input
                  type="checkbox"
                  className="toggle-input"
                  checked={isCredit}
                  onChange={(e) => setIsCredit(e.target.checked)}
                />
                <span className="toggle-track">
                  <span className="toggle-thumb" />
                </span>
                <span className="toggle-label">Credit Sale (customer pays later)</span>
              </label>
            </div>

            <button
              className="btn btn-primary btn-block btn-lg mt-5"
              onClick={handleSubmit}
              disabled={loading || cart.length === 0}
            >
              {loading ? (
                <span className="spinner spinner-sm" />
              ) : (
                <>
                  <ShoppingCart size={20} />
                  {isCredit ? 'Record Credit Sale' : 'Record Sale'}
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
