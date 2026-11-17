import { data, saveData } from "../data.js";
import { requireRole, renderNavbar } from "../auth.js";
import { clearCart, getCart, updateCartItem } from "../cart.js";
import { escapseHtml } from "../helper.js";

const user = requireRole("customer");
renderNavbar();
const cartContent = document.getElementById("cart-content");

function renderCart() {
  const cart = getCart(user.id);
  const restaurant = data.restaurants.find((item) => item.id === cart.restaurant_id);
  const cartItems = cart.items.map((cartItem) => ({
    ...cartItem,
    menuItem: data.menuItems.find((item) => item.id === cartItem.menu_item_id),
  })).filter((item) => item.menuItem);
  const subtotal = cartItems.reduce((sum, item) => sum + item.menuItem.price_inr * item.quantity, 0);

  if (cartItems.length === 0) {
    cartContent.innerHTML = `
      <section class="card empty-state">
        <h2>Your cart is empty</h2>
        <p class="muted">Add something delicious from a restaurant to get started.</p>
        <a class="btn" href="index.html">Browse restaurants</a>
      </section>
    `;
    return;
  }

  cartContent.innerHTML = `
    <div class="cart-layout">
      <section>
        <div class="cart-restaurant">
          <p class="eyebrow">Ordering from</p>
          <h2>${escapseHtml(restaurant?.name || "Restaurant")}</h2>
        </div>
        <div class="cart-items">
          ${cartItems.map((item) => `
            <article class="card cart-item">
              <div>
                <h2>${escapseHtml(item.menuItem.name)}</h2>
                <p class="muted">₹${item.menuItem.price_inr} each</p>
              </div>
              <div class="cart-item-actions">
                <button class="quantity-btn" data-action="decrease" data-item-id="${item.menuItem.id}" aria-label="Decrease quantity">−</button>
                <strong>${item.quantity}</strong>
                <button class="quantity-btn" data-action="increase" data-item-id="${item.menuItem.id}" aria-label="Increase quantity">+</button>
                <strong class="item-total">₹${item.menuItem.price_inr * item.quantity}</strong>
              </div>
            </article>
          `).join("")}
        </div>
        <button class="text-button" id="clear-cart">Clear cart</button>
      </section>
      <section class="card checkout-card">
        <h2>Checkout</h2>
        <form id="checkout-form">
          <label for="delivery-address">Delivery address</label>
          <textarea id="delivery-address" name="delivery_address" rows="3" required placeholder="Hostel, block and room number"></textarea>
          <label for="payment-method">Payment method</label>
          <select id="payment-method" name="payment_method">
            <option value="mock_card">Demo card payment</option>
            <option value="mock_upi">Demo UPI payment</option>
          </select>
          <div class="checkout-total"><span>Total</span><strong>₹${subtotal}</strong></div>
          <button class="btn" type="submit">Pay & place order</button>
          <p id="checkout-message" class="msg" role="alert"></p>
        </form>
      </section>
    </div>
  `;

  cartContent.querySelectorAll(".quantity-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const item = cart.items.find((cartItem) => cartItem.menu_item_id === Number(button.dataset.itemId));
      updateCartItem(user.id, item.menu_item_id, item.quantity + (button.dataset.action === "increase" ? 1 : -1));
      renderCart();
    });
  });

  document.getElementById("clear-cart").addEventListener("click", () => {
    clearCart(user.id);
    renderCart();
  });

  document.getElementById("checkout-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const address = form.elements.delivery_address.value.trim();
    if (!address) return;

    const nextId = Math.max(0, ...data.orders.map((order) => order.id)) + 1;
    data.orders.push({
      id: nextId,
      customer_id: user.id,
      customer_name: user.full_name,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      delivery_partner_id: null,
      delivery_partner_name: null,
      status: "PLACED",
      delivery_address_text: address,
      notes: null,
      subtotal_inr: subtotal,
      payment_status: "mock_paid",
      return_status: "none",
      return_reason: null,
      return_admin_note: null,
      placed_at: Date.now(),
      updated_at: Date.now(),
      items: cartItems.map((item) => ({
        id: item.menuItem.id,
        span: item.menuItem.name,
        price: item.menuItem.price_inr,
        qnty: item.quantity,
      })),
      review: null,
    });
    saveData();
    clearCart(user.id);
    location.href = `order.html?id=${nextId}`;
  });
}

renderCart();
