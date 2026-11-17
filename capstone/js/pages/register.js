import { data, saveData } from "../data.js";
import { dashboardFor, login, renderNavbar } from "../auth.js";
import { showMessage } from "../helper.js";

renderNavbar();

document.getElementById("register-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const fullName = form.elements.full_name.value.trim();
  const email = form.elements.email.value.trim().toLowerCase();
  const password = form.elements.password.value;
  const confirmPassword = form.elements.confirm_password.value;

  if (password !== confirmPassword) {
    showMessage("msg", "Passwords do not match.", "error");
    return;
  }

  if (data.users.some((user) => user.email === email)) {
    showMessage("msg", "An account with this email already exists.", "error");
    return;
  }

  const user = {
    id: Math.max(0, ...data.users.map((existingUser) => existingUser.id)) + 1,
    email,
    password,
    full_name: fullName,
    role: "customer",
    restaurant_id: null,
  };

  data.users.push(user);
  saveData();
  login(user);
  location.href = dashboardFor(user.role);
});