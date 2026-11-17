import { data } from "../data.js";
import { renderNavbar } from "../auth.js";
import { escapseHtml, badge } from "../helper.js";

renderNavbar();
const box = document.getElementById("restaurant-list");
if (data.restaurants.length === 0) {
  box.innerHTML = `<p class="empty">No Restaurants yet.</p>`;
} else {
  box.innerHTML = data.restaurants
    .map(
      (r) => `
    <article class="card restaurant-card">
      <div class="restaurant-icon" aria-hidden="true">🍽️</div>
      <div class="restaurant-card-content">
        <div class="restaurant-card-title">
          <h3>${escapseHtml(r.name)}</h3>
          ${badge(r.is_active ? "Open" : "Closed")}
        </div>
        <p class="muted">${escapseHtml(r.address_text)}</p>
        <a class="btn btn-outline" href="menu.html?id=${r.id}">View menu <span aria-hidden="true">→</span></a>
      </div>
    </article>
    `,
    )
    .join("");
}
