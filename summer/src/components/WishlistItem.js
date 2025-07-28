import React from 'react';
import { useDispatch } from 'react-redux';
import { removeFromWishlist } from '../redux/wishlist/actions';
import { FaTrash } from 'react-icons/fa';

const WishlistItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleRemove = () => {
    dispatch(removeFromWishlist(item._id));
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
      <button
        className="btn btn-sm btn-outline-danger"
        onClick={handleRemove}
        aria-label={`Remove ${item.name} from wishlist`}
        style={{ minWidth: 'auto' }}
      >
        <FaTrash />
      </button>
    </div>
  );
};

export default WishlistItem;
