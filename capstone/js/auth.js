import { escapseHtml } from "./helper.js";
import { data } from "./data.js";

export function login(user) {
    localStorage.setItem("userId", user.id);
    localStorage.setItem("role", user.role);
}

export function getCurrentUser(){
    const id = Number(localStorage.getItem("userId"));
    return data.users.find((u) => u.id === id) || null;
}
export function logout(){
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    location.href = "login.html";
}

export function dashboardFor(role){
    if(role === "owner") return "owner.html";
    if(role === "delivery") return "delivery.html";
    return "customer.html";
}

// required role
export function requireRole(role){
    const user = getCurrentUser();
    if(!user) {
        location.href = "login.html";
        throw new Error("Not logged in");
    }
    if(user.role !==role) {
        location.href = dashboardFor(user.role);
        throw new Error("Wrong role");

    } 
    return user;
}

function cartCount(){
    const user = getCurrentUser();
    if (!user || user.role !== "customer") return 0;
    const saved = localStorage.getItem(`campusbite-cart-${user.id}`);
    if (!saved) return 0;
    try {
        return JSON.parse(saved).items.reduce((total, item) => total + item.quantity, 0);
    } catch {
        return 0;
    }
}

export function renderNavbar() {
    const nav = document.getElementById("navbar");
    const user = getCurrentUser();


    let links = ``;
    if(!user) {
        links+=`<a href="login.html">Login</a><a href="register.html">Register</a>`;
    }else {
        if(user.role === "customer") {
            links += `<a href="customer.html">My Orders</a><a href="cart.html">Cart (<span id="cart-count">${cartCount()}</span>)</a>`;
        } else if (user.role === "owner"){
            links += `<a href="owner.html">Dashboard</a><a href="owner-menu.html">Manage Menu</a>`;
        } else {
            links += `<a href="delivery.html">My Deliveries</a>`;
        }
        links += `<span class="muted">Hi, ${escapseHtml(user.full_name)} (${user.role})</span>
        <button class="btn btn-secondary" id="logout-btn">Logout</button>
        `;
    }

    nav.innerHTML = `
    <div class="container nav-inner"> <a class="logo" href="index.html">CampusBite</a> 
    <div class="nav-links">${links}</div>
    </div>
    `
    const btn = document.getElementById("logout-btn");
    if(btn) btn.onclick = logout;
}


export function updateCartCount() {
    const el = document.getElementById("cart-count");
    if(el) el.textContent = cartCount();
}

