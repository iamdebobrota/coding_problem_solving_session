import { data, saveData } from "../data.js";
import { requireRole, renderNavbar } from "../auth.js";
import { escapseHtml, badge } from "../helper.js";

const owner = requireRole("owner");
renderNavbar();
const restaurant = data.restaurants.find((item) => item.id === owner.restaurant_id);
const dashboard = document.getElementById("owner-dashboard");
document.getElementById("owner-title").textContent = restaurant?.name || "Dashboard";

if (!restaurant) {
  dashboard.innerHTML = `<section class="card empty-state"><h2>Restaurant not found</h2><p class="muted">Your account is not linked to a restaurant.</p></section>`;
} else {
  const restaurantOrders = () => data.orders.filter((order) => order.restaurant_id === restaurant.id);
  const deliveryPartners = data.users.filter((user) => user.role === "delivery");

  function orderAgeMinutes(order) {
    if (order.placed_at < 10000000000) return order.placed_at;
    return Math.max(0, (Date.now() - order.placed_at) / 60000);
  }

  function setOrderStatus(order, status) {
    order.status = status;
    order.updated_at = Date.now();
    saveData();
    renderDashboard();
  }

  function renderDashboard() {
    const orders = restaurantOrders().sort((a, b) => b.id - a.id);
    const activeOrders = orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status));
    const pendingReturns = orders.filter((order) => order.return_status === "requested");
    const reminders = orders.filter((order) => order.status === "PLACED" && orderAgeMinutes(order) >= 20);
    const revenue = orders.filter((order) => order.status !== "CANCELLED").reduce((sum, order) => sum + order.subtotal_inr, 0);

    dashboard.innerHTML = `
      <section class="stats-grid">
        <div class="card stat-card"><span class="muted">Total orders</span><strong>${orders.length}</strong></div>
        <div class="card stat-card"><span class="muted">Active orders</span><strong>${activeOrders.length}</strong></div>
        <div class="card stat-card"><span class="muted">Revenue</span><strong>₹${revenue}</strong></div>
        <div class="card stat-card"><span class="muted">Refund requests</span><strong>${pendingReturns.length}</strong></div>
      </section>
      ${
        reminders.length
          ? `<section class="card reminder-card"><strong>Pending reminder</strong><span>${reminders.length} order${reminders.length === 1 ? "" : "s"} have been waiting for more than 20 minutes.</span></section>`
          : ""
      }
      <div class="owner-section-heading">
        <div><p class="eyebrow">Incoming orders</p><h2>Order queue</h2></div>
        <span class="muted">${activeOrders.length} active</span>
      </div>
      <section class="owner-orders">
        ${
          orders.length
            ? orders.map((order) => `
              <article class="card owner-order-card">
                <div class="owner-order-top">
                  <div><p class="muted">Order #${order.id} · ${escapseHtml(order.customer_name)}</p><h3>${order.items.map((item) => `${item.qnty} × ${escapseHtml(item.span)}`).join(", ")}</h3></div>
                  ${badge(order.status)}
                </div>
                <p class="muted">Deliver to: ${escapseHtml(order.delivery_address_text)}</p>
                <div class="owner-order-bottom">
                  <strong>₹${order.subtotal_inr}</strong>
                  <div class="owner-actions">
                    ${orderActionMarkup(order, deliveryPartners)}
                  </div>
                </div>
              </article>
            `).join("")
            : `<section class="card empty-state"><h2>No orders yet</h2><p class="muted">New orders will appear here.</p></section>`
        }
      </section>
      <div class="owner-section-heading"><div><p class="eyebrow">Customer care</p><h2>Return and refund requests</h2></div></div>
      <section class="refund-list">
        ${
          pendingReturns.length
            ? pendingReturns.map((order) => `
              <article class="card refund-card">
                <div><strong>Order #${order.id}</strong><p class="muted">${escapseHtml(order.return_reason || "No reason provided")}</p></div>
                <div class="owner-actions">
                  <button class="btn btn-small refund-action" data-action="approve-refund" data-order-id="${order.id}">Approve</button>
                  <button class="btn btn-small btn-outline refund-action" data-action="reject-refund" data-order-id="${order.id}">Reject</button>
                </div>
              </article>
            `).join("")
            : `<p class="muted">No pending return or refund requests.</p>`
        }
      </section>
    `;

    dashboard.querySelectorAll("[data-action]").forEach((control) => {
      control.addEventListener("click", () => {
        const order = data.orders.find((item) => item.id === Number(control.dataset.orderId));
        if (!order) return;
        const action = control.dataset.action;
        if (action === "accept") setOrderStatus(order, "ACCEPTED");
        if (action === "preparing") setOrderStatus(order, "PREPARING");
        if (action === "ready") setOrderStatus(order, "READY");
        if (action === "out-for-delivery") setOrderStatus(order, "OUT_FOR_DELIVERY");
        if (action === "delivered") setOrderStatus(order, "DELIVERED");
        if (action === "cancel") setOrderStatus(order, "CANCELLED");
        if (action === "approve-refund" || action === "reject-refund") {
          order.return_status = action === "approve-refund" ? "approved" : "rejected";
          order.return_admin_note = action === "approve-refund" ? "Refund approved by restaurant." : "Refund request rejected by restaurant.";
          order.updated_at = Date.now();
          saveData();
          renderDashboard();
        }
      });
    });

    dashboard.querySelectorAll(".assign-delivery").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const order = data.orders.find((item) => item.id === Number(form.dataset.orderId));
        const partner = data.users.find((item) => item.id === Number(form.elements.partner.value));
        if (!order || !partner) return;
        order.delivery_partner_id = partner.id;
        order.delivery_partner_name = partner.full_name;
        order.updated_at = Date.now();
        saveData();
        renderDashboard();
      });
    });
  }

  function orderActionMarkup(order, partners) {
    if (order.status === "PLACED") return `<button class="btn btn-small owner-action" data-action="accept" data-order-id="${order.id}">Accept order</button><button class="text-button danger-button owner-action" data-action="cancel" data-order-id="${order.id}">Cancel</button>`;
    if (order.status === "ACCEPTED") return `<button class="btn btn-small owner-action" data-action="preparing" data-order-id="${order.id}">Start preparing</button><button class="text-button danger-button owner-action" data-action="cancel" data-order-id="${order.id}">Cancel</button>`;
    if (order.status === "PREPARING") return `<button class="btn btn-small owner-action" data-action="ready" data-order-id="${order.id}">Mark ready</button><button class="text-button danger-button owner-action" data-action="cancel" data-order-id="${order.id}">Cancel</button>`;
    if (order.status === "READY" && !order.delivery_partner_id) {
      return `<form class="assign-delivery" data-order-id="${order.id}"><select name="partner" aria-label="Assign delivery partner" required><option value="">Assign delivery partner</option>${partners.map((partner) => `<option value="${partner.id}">${escapseHtml(partner.full_name)}</option>`).join("")}</select><button class="btn btn-small" type="submit">Assign</button></form><button class="text-button danger-button owner-action" data-action="cancel" data-order-id="${order.id}">Cancel</button>`;
    }
    if (order.status === "READY") return `<button class="btn btn-small owner-action" data-action="out-for-delivery" data-order-id="${order.id}">Send for delivery</button>`;
    if (order.status === "OUT_FOR_DELIVERY") return `<button class="btn btn-small owner-action" data-action="delivered" data-order-id="${order.id}">Mark delivered</button>`;
    return order.delivery_partner_name ? `<span class="muted">Assigned to ${escapseHtml(order.delivery_partner_name)}</span>` : "";
  }

  renderDashboard();
}
