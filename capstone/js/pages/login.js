
import { data } from "../data.js";
import { dashboardFor, getCurrentUser, login, renderNavbar } from "../auth.js";
import { showMessage } from "../helper.js";


const alreadyLoggedIn = getCurrentUser();

if(alreadyLoggedIn) {
    location.href = dashboardFor(alreadyLoggedIn.role);
} else {
    renderNavbar();
}


document.getElementById("login-form").addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    const user = data.users.find((u) => u.email === email && u.password === password);

    if(!user) {
        showMessage("msg", "Invalid email or password", "error");
        return;
    }

    login(user);
    location.href = dashboardFor(user.role);
});
