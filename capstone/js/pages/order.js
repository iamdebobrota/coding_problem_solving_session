import { data, saveData } from "../data.js";
import { requireRole, renderNavbar } from "../auth.js";
import { escapseHtml, badge } from "../helper.js";

const user = requireRole("customer");
renderNavbar();
const orderContent = document.getElementById("order-content");
const orderId = Number(new URLSearchParams(window.location.search).get("id"));

function renderOrder() {
  const order = data.orders.find((item) => item.id === orderId && item.customer_id === user.id);
  if (!order) {
    orderContent.innerHTML = `<section class="card empty-state"><h1>Order not found</h1><a class="btn" href="customer.html">View my orders</a></section>`;
    return;
  }

  const canEdit = order.status === "PLACED";
  const canReview = order.status === "DELIVERED" && !order.review;
  const canReturn = order.status === "DELIVERED" && order.return_status === "none";

  orderContent.innerHTML = `
    <div class="order-detail-header">
      <div>
        <p class="eyebrow">Order #${order.id}</p>
        <h1>${escapseHtml(order.restaurant_name)}</h1>
      </div>
      ${badge(order.status)}
    </div>
    <div class="order-detail-layout">
      <section>
        <div class="card order-items">
          <h2>Items</h2>
          ${order.items.map((item) => `
            <div class="detail-row"><span>${item.qnty} × ${escapseHtml(item.span)}</span><strong>₹${item.price * item.qnty}</strong></div>
          `).join("")}
          <div class="detail-row total-row"><span>Total</span><strong>₹${order.subtotal_inr}</strong></div>
        </div>
        <div class="card status-card">
          <h2>Delivery status</h2>
          <p class="status-current">${escapseHtml(order.status)}</p>
          <p class="muted">${order.delivery_partner_name ? `Delivery partner: ${escapseHtml(order.delivery_partner_name)}` : "Your order is being prepared."}</p>
        </div>
      </section>
      <aside>
        <div class="card order-actions">
          <h2>Delivery details</h2>
          ${
            canEdit
              ? `<form id="address-form">
                  <label for="order-address">Delivery address</label>
                  <textarea id="order-address" name="address" rows="3" required>${escapseHtml(order.delivery_address_text)}</textarea>
                  <button class="btn btn-small" type="submit">Update address</button>
                </form>
                <button class="text-button danger-button" id="cancel-order">Cancel order</button>`
              : `<p>${escapseHtml(order.delivery_address_text)}</p>`
          }
          ${
            canReview
              ? `<hr><h2>Leave a review</h2>
                <form id="review-form">
                  <label for="rating">Rating</label>
                  <select id="rating" name="rating"><option value="5">5 - Excellent</option><option value="4">4 - Good</option><option value="3">3 - Okay</option><option value="2">2 - Poor</option><option value="1">1 - Bad</option></select>
                  <label for="review-comment">Comment</label>
                  <textarea id="review-comment" name="comment" rows="3" required></textarea>
                  <button class="btn btn-small" type="submit">Submit review</button>
                </form>`
              : order.review
                ? `<hr><h2>Your review</h2><p>${"★".repeat(order.review.rating)}${"☆".repeat(5 - order.review.rating)}</p><p class="muted">${escapseHtml(order.review.comment)}</p>`
                : ""
          }
          ${
            canReturn
              ? `<hr><h2>Request return or refund</h2>
                <form id="return-form">
                  <label for="return-reason">Reason</label>
                  <textarea id="return-reason" name="reason" rows="3" required></textarea>
                  <button class="btn btn-small btn-outline" type="submit">Request refund</button>
                </form>`
              : order.return_status !== "none"
                ? `<hr><p><strong>Refund status:</strong> ${escapseHtml(order.return_status)}</p><p class="muted">${escapseHtml(order.return_reason || "")}</p>`
                : ""
          }
        </div>
      </aside>
    </div>
  `;

  document.getElementById("address-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    order.delivery_address_text = event.currentTarget.elements.address.value.trim();
    order.updated_at = Date.now();
    saveData();
    renderOrder();
  });

  document.getElementById("cancel-order")?.addEventListener("click", () => {
    order.status = "CANCELLED";
    order.updated_at = Date.now();
    saveData();
    renderOrder();
  });

  document.getElementById("review-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    order.review = {
      rating: Number(event.currentTarget.elements.rating.value),
      comment: event.currentTarget.elements.comment.value.trim(),
    };
    saveData();
    renderOrder();
  });

  document.getElementById("return-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    order.return_status = "requested";
    order.return_reason = event.currentTarget.elements.reason.value.trim();
    order.updated_at = Date.now();
    saveData();
    renderOrder();
  });
}

renderOrder();
