const cartKey = (userId) => `campusbite-cart-${userId}`;

function readCart(userId) {
  const saved = localStorage.getItem(cartKey(userId));
  return saved ? JSON.parse(saved) : { restaurant_id: null, items: [] };
}

function writeCart(userId, cart) {
  localStorage.setItem(cartKey(userId), JSON.stringify(cart));
}

export function getCart(userId) {
  return readCart(userId);
}

export function getCartCount(userId) {
  return readCart(userId).items.reduce((total, item) => total + item.quantity, 0);
}

export function addToCart(userId, menuItem) {
  const cart = readCart(userId);

  if (cart.restaurant_id !== null && cart.restaurant_id !== menuItem.restaurant_id) {
    cart.restaurant_id = menuItem.restaurant_id;
    cart.items = [];
  }

  const existingItem = cart.items.find((item) => item.menu_item_id === menuItem.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({
      menu_item_id: menuItem.id,
      quantity: 1,
      restaurant_id: menuItem.restaurant_id,
    });
  }
  cart.restaurant_id = menuItem.restaurant_id;
  writeCart(userId, cart);
}

export function updateCartItem(userId, menuItemId, quantity) {
  const cart = readCart(userId);
  const item = cart.items.find((cartItem) => cartItem.menu_item_id === menuItemId);
  if (!item) return;

  if (quantity <= 0) {
    cart.items = cart.items.filter((cartItem) => cartItem.menu_item_id !== menuItemId);
  } else {
    item.quantity = quantity;
  }
  if (cart.items.length === 0) cart.restaurant_id = null;
  writeCart(userId, cart);
}

export function clearCart(userId) {
  localStorage.removeItem(cartKey(userId));
}