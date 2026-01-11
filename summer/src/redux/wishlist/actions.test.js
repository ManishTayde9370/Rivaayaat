import { moveWishlistItemToCart } from './actions';

describe('wishlist actions', () => {
  test('moveWishlistItemToCart adds item and removes from wishlist when add succeeds', async () => {
    const item = { _id: 'p1', name: 'Test Product' };
    const dispatched = [];

    const fakeDispatch = jest.fn(async (arg) => {
      dispatched.push(arg);
      if (typeof arg === 'function') {
        // Simulate addToCartWithValidation resolving to true for the first thunk call
        if (dispatched.filter(d => typeof d === 'function').length === 1) return true;
        // Simulate removeFromWishlist resolving
        return Promise.resolve({ success: true });
      }
      return arg;
    });

    const result = await moveWishlistItemToCart(item)(fakeDispatch);

    expect(result).toBe(true);
    // Expect that at least two thunks were dispatched: addToCartWithValidation and removeFromWishlist
    const fnCalls = dispatched.filter(d => typeof d === 'function');
    expect(fnCalls.length).toBeGreaterThanOrEqual(2);
  });
});