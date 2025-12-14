import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/format';
import toast from 'react-hot-toast';
import './Cart.css';

const Cart = () => {
    const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCartStore();
    const navigate = useNavigate();

    const handleCheckout = () => {
        toast.success('Thank you for your purchase! (Demo)');
        clearCart();
        navigate('/');
    };

    if (items.length === 0) {
        return (
            <div className="cart-empty">
                <h2>Your Cart is Empty</h2>
                <p>Looks like you haven't added any sweets yet.</p>
                <button onClick={() => navigate('/')} className="btn-primary">
                    Browse Sweets
                </button>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1>Your Cart</h1>
            <div className="cart-container">
                <div className="cart-items">
                    {items.map((item) => (
                        <div key={item.id} className="cart-item">
                            <div className="cart-item-info">
                                <h3>{item.name}</h3>
                                <p className="cart-item-category">{item.category}</p>
                                <p className="cart-item-price">${formatPrice(item.price)}</p>
                            </div>
                            <div className="cart-item-actions">
                                <div className="quantity-controls">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                                        disabled={item.cartQuantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span>{item.cartQuantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                                        disabled={item.cartQuantity >= item.quantity}
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="btn-remove"
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="cart-item-total">
                                ${formatPrice(item.price * item.cartQuantity)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="cart-summary">
                    <h2>Order Summary</h2>
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>${formatPrice(getTotalPrice())}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>${formatPrice(getTotalPrice())}</span>
                    </div>
                    <button onClick={handleCheckout} className="btn-checkout">
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
