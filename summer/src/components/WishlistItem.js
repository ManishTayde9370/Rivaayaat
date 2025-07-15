const WishlistItem = ({ item }) => (
  <div className="border rounded p-2 mb-2 d-flex align-items-center gap-3">
    {item.images && item.images.length > 0 && (
      <img src={item.images[0]} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
    )}
    <div>
      <strong>{item.name}</strong> <br />
      <span>Price: ₹{item.price}</span> <br />
      <span>Added: {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : 'N/A'}</span>
    </div>
  </div>
);
export default WishlistItem;
