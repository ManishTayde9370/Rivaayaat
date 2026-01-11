import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromWishlist, moveWishlistItemToCart } from '../redux/wishlist/actions';
import { FaTrash } from 'react-icons/fa';

const WishlistItem = ({ item }) => {
  const dispatch = useDispatch();
  const wishlistLoading = useSelector(state => state.wishlist.loading);

  const handleRemove = () => {
    dispatch(removeFromWishlist(item._id));
  };

  const handleMoveToCart = async () => {
    // Delegate to wishlist action that moves the item to cart and handles removal
    await dispatch(moveWishlistItemToCart(item));
  };

  return (
    <div className="border rounded p-2 mb-2 d-flex align-items-center justify-content-between gap-3">
      <div className="d-flex align-items-center gap-3">
        {item.images && item.images.length > 0 && (
          <img 
            src={item.images[0]} 
            alt={item.name} 
            style={{ 
              width: 60, 
              height: 60, 
              objectFit: 'cover', 
              borderRadius: 8 
            }} 
          />
        )}
        <div>
          <strong>{item.name}</strong> <br />
          <span>Price: ₹{item.price}</span> <br />
          <span>Added: {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : 'N/A'}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={handleMoveToCart}
          aria-label={`Move ${item.name} to cart`}
          style={{ minWidth: 'auto' }}
          disabled={wishlistLoading}
        >
          {wishlistLoading ? '...' : 'Add'}
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={handleRemove}
          aria-label={`Remove ${item.name} from wishlist`}
          style={{ minWidth: 'auto' }}
          disabled={wishlistLoading}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default WishlistItem;
