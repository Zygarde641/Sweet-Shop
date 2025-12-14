import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils/format';
import { purchaseSweet, releaseSweet } from '../api/sweets';
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
                                        onClick={async () => {
                                            try {
                                                await releaseSweet(item.id, 1);
                                                updateQuantity(item.id, item.cartQuantity - 1);
                                                toast.success('Stock released');
                                            } catch (error) {
                                                toast.error('Failed to update stock');
                                            }
                                        }}
                                        disabled={item.cartQuantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span>{item.cartQuantity}</span>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await purchaseSweet(item.id, 1);
                                                updateQuantity(item.id, item.cartQuantity + 1);
                                                toast.success('Added to order');
                                            } catch (error) {
                                                toast.error('Insufficient stock');
                                            }
                                        }}
                                        disabled={item.cartQuantity >= item.quantity}
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={async () => {
                                        try {
                                            await releaseSweet(item.id, item.cartQuantity);
                                            toast.success('Item removed');
                                        } catch (error) {
                                            console.warn('Backend sync failed:', error);
                                            // Proceed with removal anyway for better UX
                                        } finally {
                                            removeFromCart(item.id);
                                        }
                                    }}
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
