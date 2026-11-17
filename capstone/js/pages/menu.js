import { data } from "../data.js";
import { getCurrentUser, renderNavbar, updateCartCount } from "../auth.js";
import { addToCart, getCart, updateCartItem } from "../cart.js";
import { badge, escapseHtml } from "../helper.js";

renderNavbar();

const menuContent = document.getElementById("menu-content");
const currentUser = getCurrentUser();
const restaurantId = Number(new URLSearchParams(window.location.search).get("id"));
const restaurant = data.restaurants.find((item) => item.id === restaurantId);

if (!restaurant) {
  menuContent.innerHTML = `
    <section class="card empty-state">
      <h1>Restaurant not found</h1>
      <p class="muted">Choose a restaurant from the list to view its menu.</p>
      <a class="btn" href="index.html">Browse restaurants</a>
    </section>
  `;
} else {
  const menuItems = data.menuItems.filter((item) => item.restaurant_id === restaurant.id);
  const canOrder = currentUser?.role === "customer";

  function renderMenu() {
    const cart = canOrder ? getCart(currentUser.id) : { items: [] };

    menuContent.innerHTML = `
      <header class="menu-header">
        <div>
          <p class="eyebrow">Restaurant menu</p>
          <h1>${escapseHtml(restaurant.name)}</h1>
          <p class="muted">${escapseHtml(restaurant.address_text)}</p>
        </div>
        ${badge(restaurant.is_active ? "Open now" : "Closed")}
      </header>
      ${
        menuItems.length === 0
          ? `<section class="card empty-state"><p class="muted">No menu items are available right now.</p></section>`
          : `<div class="menu-grid">
              ${menuItems.map((item) => {
                const quantity = cart.items.find((cartItem) => cartItem.menu_item_id === item.id)?.quantity || 0;
                const cartControl = quantity
                  ? `<div class="cart-controls">
                      <button class="quantity-btn menu-action" data-action="decrease" data-item-id="${item.id}" aria-label="Decrease ${escapseHtml(item.name)} quantity">−</button>
                      <span class="menu-quantity">${quantity}</span>
                      <button class="quantity-btn menu-action" data-action="increase" data-item-id="${item.id}" aria-label="Increase ${escapseHtml(item.name)} quantity">+</button>
                    </div>`
                  : `<button class="btn btn-small menu-action" data-action="add" data-item-id="${item.id}">Add to cart</button>`;

                return `
                  <article class="card menu-item">
                    <div class="menu-item-icon" aria-hidden="true">🍽️</div>
                    <div class="menu-item-info">
                      <h2>${escapseHtml(item.name)}</h2>
                      <p class="muted">${escapseHtml(item.description)}</p>
                      <div class="menu-item-footer">
                        <div>
                          <strong>₹${item.price_inr}</strong>
                          ${item.is_available ? "" : `<span class="availability unavailable">Unavailable</span>`}
                        </div>
                        ${
                          canOrder && item.is_available
                            ? cartControl
                            : canOrder
                              ? `<button class="btn btn-small btn-outline" disabled>Unavailable</button>`
                              : item.is_available
                                ? `<a class="btn btn-small btn-outline" href="login.html">Login to order</a>`
                                : ""
                        }
                      </div>
                    </div>
                  </article>
                `;
              }).join("")}
            </div>`
      }
    `;

    if (canOrder) {
      menuContent.querySelectorAll(".menu-action").forEach((button) => {
      button.addEventListener("click", () => {
        const item = data.menuItems.find((menuItem) => menuItem.id === Number(button.dataset.itemId));
        try {
          const currentCart = getCart(currentUser.id);
          const currentQuantity = currentCart.items.find((cartItem) => cartItem.menu_item_id === item.id)?.quantity || 0;
          if (button.dataset.action === "add" || button.dataset.action === "increase") {
            addToCart(currentUser.id, item);
          } else {
            updateCartItem(currentUser.id, item.id, currentQuantity - 1);
          }
          updateCartCount();
          document.getElementById("cart-message").textContent = "";
          renderMenu();
        } catch (error) {
          const cart = getCart(currentUser.id);
          const message = document.getElementById("cart-message");
          message.textContent = `${error.message} (${cart.items.length} item${cart.items.length === 1 ? "" : "s"} already in cart.)`;
          message.className = "msg error";
        }
      });
    });
  }
  }

  renderMenu();
}