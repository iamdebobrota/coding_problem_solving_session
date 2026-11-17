import { data, saveData } from "../data.js";
import { requireRole, renderNavbar } from "../auth.js";
import { escapseHtml, badge } from "../helper.js";

const owner = requireRole("owner");
renderNavbar();
const restaurant = data.restaurants.find((item) => item.id === owner.restaurant_id);
const manager = document.getElementById("menu-manager");
document.getElementById("menu-restaurant-name").textContent = restaurant?.name || "";

if (!restaurant) {
  manager.innerHTML = `<section class="card empty-state"><h2>Restaurant not found</h2></section>`;
} else {
  let editingId = null;

  function renderManager() {
    const items = data.menuItems.filter((item) => item.restaurant_id === restaurant.id);
    manager.innerHTML = `
      <div class="menu-manager-layout">
        <section class="card">
          <h2>${editingId ? "Edit dish" : "Add a new dish"}</h2>
          <form id="dish-form">
            <label for="dish-name">Name</label>
            <input id="dish-name" name="name" required />
            <label for="dish-description">Description</label>
            <textarea id="dish-description" name="description" rows="3" required></textarea>
            <label for="dish-price">Price (₹)</label>
            <input id="dish-price" name="price" type="number" min="1" step="1" required />
            <label for="dish-image">Image URL</label>
            <input id="dish-image" name="image_url" type="url" placeholder="https://example.com/dish.jpg" />
            <label class="checkbox-label"><input name="is_available" type="checkbox" checked /> Available</label>
            <div class="form-actions"><button class="btn" type="submit">${editingId ? "Save changes" : "Add dish"}</button>${editingId ? `<button class="btn btn-secondary" type="button" id="cancel-edit">Cancel</button>` : ""}</div>
          </form>
        </section>
        <section>
          <div class="owner-section-heading"><div><p class="eyebrow">Your dishes</p><h2>Menu items</h2></div><span class="muted">${items.length} items</span></div>
          <div class="owner-menu-list">
            ${items.length ? items.map((item) => `
              <article class="card owner-menu-item">
                <div class="owner-menu-icon">${item.image_url ? `<img src="${escapseHtml(item.image_url)}" alt="" />` : "🍽️"}</div>
                <div class="owner-menu-info"><div class="owner-menu-title"><h3>${escapseHtml(item.name)}</h3>${badge(item.is_available ? "Available" : "Unavailable")}</div><p class="muted">${escapseHtml(item.description)}</p><strong>₹${item.price_inr}</strong></div>
                <div class="owner-actions"><button class="btn btn-small edit-dish" data-id="${item.id}">Edit</button><button class="btn btn-small btn-outline toggle-dish" data-id="${item.id}">${item.is_available ? "Mark unavailable" : "Mark available"}</button></div>
              </article>
            `).join("") : `<section class="card empty-state"><p class="muted">No dishes added yet.</p></section>`}
          </div>
        </section>
      </div>
    `;

    const form = document.getElementById("dish-form");
    if (editingId) {
      const item = items.find((menuItem) => menuItem.id === editingId);
      form.elements.name.value = item.name;
      form.elements.description.value = item.description;
      form.elements.price.value = item.price_inr;
      form.elements.image_url.value = item.image_url || "";
      form.elements.is_available.checked = item.is_available;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = event.currentTarget.elements;
      const dish = editingId ? data.menuItems.find((item) => item.id === editingId) : {
        id: Math.max(0, ...data.menuItems.map((item) => item.id)) + 1,
        restaurant_id: restaurant.id,
      };
      dish.name = values.name.value.trim();
      dish.description = values.description.value.trim();
      dish.price_inr = Number(values.price.value);
      dish.image_url = values.image_url.value.trim();
      dish.is_available = values.is_available.checked;
      if (!editingId) data.menuItems.push(dish);
      saveData();
      editingId = null;
      renderManager();
    });

    document.getElementById("cancel-edit")?.addEventListener("click", () => {
      editingId = null;
      renderManager();
    });
    manager.querySelectorAll(".edit-dish").forEach((button) => button.addEventListener("click", () => {
      editingId = Number(button.dataset.id);
      renderManager();
    }));
    manager.querySelectorAll(".toggle-dish").forEach((button) => button.addEventListener("click", () => {
      const item = data.menuItems.find((menuItem) => menuItem.id === Number(button.dataset.id));
      item.is_available = !item.is_available;
      saveData();
      renderManager();
    }));
  }

  renderManager();
}
