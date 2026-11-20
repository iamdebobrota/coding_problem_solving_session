import { data, saveData } from "../data.js";
import { requireRole, renderNavbar } from "../auth.js";
import { badge, escapseHtml, showMessage } from "../helper.js";

const partner = requireRole("delivery");
renderNavbar();

const dashboard = document.getElementById("delivery-dashboard");

function assignedOrders() {
  return data.orders
    .filter((order) => order.delivery_partner_id === partner.id)
    .sort((a, b) => b.id - a.id);
}

function setOrderStatus(order, status) {
  const validTransition =
    (order.status === "ASSIGNED" && status === "OUT_FOR_DELIVERY") ||
    (order.status === "OUT_FOR_DELIVERY" && status === "DELIVERED");

  if (!validTransition || order.delivery_partner_id !== partner.id) return;

  order.status = status;
  order.updated_at = Date.now();
  saveData();
  showMessage(
    "delivery-message",
    status === "OUT_FOR_DELIVERY"
      ? `Order #${order.id} is now out for delivery.`
      : `Order #${order.id} has been marked delivered.`,
    "success"
  );
  renderDashboard();
}

function orderAction(order) {
  if (order.status === "ASSIGNED") {
    return `<button class="btn btn-small delivery-action" data-order-id="${order.id}" data-next-status="OUT_FOR_DELIVERY">Mark out for delivery</button>`;
  }
  if (order.status === "OUT_FOR_DELIVERY") {
    return `<button class="btn delivery-action" data-order-id="${order.id}" data-next-status="DELIVERED">Mark delivered</button>`;
  }
  return "";
}

function formatTimestamp(value) {
  if (!value) return "Not available";

  const timestamp =
    value < 10000000000
      ? Date.now() - value * 60000
      : value;

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function renderDashboard() {
  const orders = assignedOrders();
  const activeOrders = orders.filter((order) =>
    ["ASSIGNED", "OUT_FOR_DELIVERY"].includes(order.status)
  );
  const completedOrders = orders.filter((order) => order.status === "DELIVERED");

  dashboard.innerHTML = `
    <section class="stats-grid delivery-stats">
      <div class="card stat-card"><span class="muted">Assigned to me</span><strong>${orders.length}</strong></div>
      <div class="card stat-card"><span class="muted">Active deliveries</span><strong>${activeOrders.length}</strong></div>
      <div class="card stat-card"><span class="muted">Completed</span><strong>${completedOrders.length}</strong></div>
    </section>
    <div class="delivery-section-heading">
      <div><p class="eyebrow">Current work</p><h2>Active deliveries</h2></div>
      <span class="muted">${activeOrders.length} active</span>
    </div>
    <section class="delivery-list">
      ${
        activeOrders.length
          ? activeOrders.map((order) => deliveryCard(order)).join("")
          : `<section class="card empty-state"><h2>No active deliveries</h2><p class="muted">Assigned orders will appear here.</p></section>`
      }
    </section>
    <div class="delivery-section-heading">
      <div><p class="eyebrow">History</p><h2>Completed deliveries</h2></div>
    </div>
    <section class="delivery-list">
      ${
        completedOrders.length
          ? completedOrders.map((order) => deliveryCard(order)).join("")
          : `<p class="muted">No completed deliveries yet.</p>`
      }
    </section>
  `;

  dashboard.querySelectorAll(".delivery-action").forEach((button) => {
    button.addEventListener("click", () => {
      const order = data.orders.find(
        (item) => item.id === Number(button.dataset.orderId)
      );
      if (!order) return;
      setOrderStatus(order, button.dataset.nextStatus);
    });
  });
}

function deliveryCard(order) {
  const restaurant = data.restaurants.find(
    (item) => item.id === order.restaurant_id
  );

  return `
    <article class="card delivery-order-card">
      <div class="delivery-order-top">
        <div>
          <p class="muted">Order #${order.id} · ${escapseHtml(order.customer_name)}</p>
          <h3>${escapseHtml(order.restaurant_name)}</h3>
        </div>
        ${badge(order.status)}
      </div>
      <div class="delivery-details">
        <div>
          <span class="detail-label">Items</span>
          <p>${order.items.map((item) => `${item.qnty} × ${escapseHtml(item.span)}`).join(", ")}</p>
        </div>
        <div>
          <span class="detail-label">Deliver from</span>
          <p>${escapseHtml(restaurant?.address_text || "Restaurant address unavailable")}</p>
        </div>
        <div>
          <span class="detail-label">Deliver to</span>
          <p>${escapseHtml(order.delivery_address_text)}</p>
        </div>
        ${
          order.notes
            ? `<div><span class="detail-label">Customer notes</span><p>${escapseHtml(order.notes)}</p></div>`
            : ""
        }
        <div>
          <span class="detail-label">Order total</span>
          <strong class="delivery-total">₹${order.subtotal_inr}</strong>
        </div>
        <div>
          <span class="detail-label">Order placed</span>
          <p>${escapseHtml(formatTimestamp(order.placed_at))}</p>
        </div>
        ${
          order.status === "DELIVERED"
            ? `<div><span class="detail-label">Delivered</span><p>${escapseHtml(formatTimestamp(order.updated_at))}</p></div>`
            : ""
        }
      </div>
      <div class="delivery-order-bottom">
        ${orderAction(order)}
      </div>
    </article>
  `;
}

renderDashboard();