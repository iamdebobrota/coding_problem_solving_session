import { data } from "../data.js";
import { requireRole, renderNavbar } from "../auth.js";
import { escapseHtml, badge } from "../helper.js";

const user = requireRole("customer");
renderNavbar();
const ordersBox = document.getElementById("customer-orders");
const orders = data.orders
  .filter((order) => order.customer_id === user.id)
  .sort((a, b) => b.id - a.id);

if (orders.length === 0) {
  ordersBox.innerHTML = `
    <section class="card empty-state">
      <h2>No orders yet</h2>
      <p class="muted">Your next meal is waiting.</p>
      <a class="btn" href="index.html">Find a restaurant</a>
    </section>
  `;
} else {
  ordersBox.innerHTML = `
    <div class="order-list">
      ${orders.map((order) => `
        <article class="card order-card">
          <div class="order-card-top">
            <div>
              <p class="muted">Order #${order.id}</p>
              <h2>${escapseHtml(order.restaurant_name)}</h2>
            </div>
            ${badge(order.status)}
          </div>
          <p class="muted">${order.items.map((item) => `${item.qnty} × ${escapseHtml(item.span)}`).join(", ")}</p>
          <div class="order-card-bottom">
            <strong>₹${order.subtotal_inr}</strong>
            <a class="btn btn-small btn-outline" href="order.html?id=${order.id}">View details</a>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}
