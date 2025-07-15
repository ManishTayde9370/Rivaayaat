import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../css/CartIcon.css';

const CartIcon = () => {
  const items = useSelector(state => state.cart.items);
  const navigate = useNavigate();

  const totalQuantity = Array.isArray(items)
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const handleClick = () => {
    navigate('/cart');
  };

  return (
    <div className="cart-icon" onClick={handleClick} style={{ cursor: 'pointer' }}>
      🛒
      {totalQuantity > 0 && <span className="cart-count">{totalQuantity}</span>}
    </div>
  );
};

export default CartIcon;
