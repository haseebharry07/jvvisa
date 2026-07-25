/**
 * auth.js
 * Handles signup, login, logout, and dynamic nav bar (Sign in <-> Hi, Name / Logout)
 * Talks to the Node/Express/MongoDB backend using JWT stored in localStorage.
 */

// ⚠️ Change this to your deployed backend URL when you go live
const API_BASE_URL = "/api/auth";

const AUTH_TOKEN_KEY = "jvvisa_token";
const AUTH_USER_KEY = "jvvisa_user";

/* ---------------------------------------------------------
   Small helpers
--------------------------------------------------------- */
function saveSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getStoredUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
  return !!getToken();
}

function showAlert(elementId, message, type = "danger") {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type}`;
  el.classList.remove("d-none");
}

function setButtonLoading(button, isLoading, loadingText, originalText) {
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : originalText;
}

/* ---------------------------------------------------------
   API calls
--------------------------------------------------------- */
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

async function signupUser({ name, email, password }) {
  return apiRequest("/register", {   // was "/signup"
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

async function loginUser({ email, password }) {
  return apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

async function fetchCurrentUser() {
  return apiRequest("/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

async function logoutUser() {
  clearSession();
  window.location.href = "index.html";
}

/* ---------------------------------------------------------
   Nav bar: swap "Sign in" for "Hi, Name" + Logout when logged in
--------------------------------------------------------- */
function renderAuthNav() {
  const user = getStoredUser();
  const desktopNav = document.getElementById("auth-nav-desktop");
  const mobileNav = document.getElementById("auth-nav-mobile");

  if (!user) return; // default "Sign in" markup already in the HTML

  if (desktopNav) {
    desktopNav.innerHTML = `
      <li class="nav-item">
        <span class="text-dark fw-semibold">Hi, ${escapeHtml(user.name)}</span>
      </li>
      <li class="nav-item">
        <a href="panel.html" class="btn btn-outline-primary px-3">Panel</a>
      </li>
      <li class="nav-item">
        <button class="btn btn-link text-decoration-none text-dark fw-semibold" id="logout-btn-desktop">Logout</button>
      </li>
      <li class="nav-item">
        <a href="contactus.html" class="btn btn-primary btn_cta px-4">Contact Us</a>
      </li>
    `;
    document.getElementById("logout-btn-desktop")?.addEventListener("click", logoutUser);
  }

  if (mobileNav) {
    mobileNav.innerHTML = `
      <span class="text-dark fw-semibold mb-2">Hi, ${escapeHtml(user.name)}</span>
      <button class="btn btn-outline-secondary w-100" id="logout-btn-mobile">Logout</button>
      <li class="nav-item">
        <a href="panel.html" class="btn btn-outline-primary px-3">Panel</a>
      </li>
      <a href="contactus.html" class="btn btn-primary btn_cta w-100">Contact Us</a>
    `;
    document.getElementById("logout-btn-mobile")?.addEventListener("click", logoutUser);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------------------------------------------------
   Form handlers
--------------------------------------------------------- */
function initSignupForm() {
  const form = document.getElementById("signup-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const submitBtn = document.getElementById("signup-submit-btn");

    if (password !== confirmPassword) {
      showAlert("signup-alert", "Passwords do not match");
      return;
    }

    try {
      setButtonLoading(submitBtn, true, "Creating account...", "Sign Up");
      const data = await signupUser({ name, email, password });
      saveSession(data.token, data.user);
      window.location.href = "index.html";
    } catch (error) {
      showAlert("signup-alert", error.message);
    } finally {
      setButtonLoading(submitBtn, false, "Creating account...", "Sign Up");
    }
  });
}

function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const submitBtn = document.getElementById("login-submit-btn");

    try {
      setButtonLoading(submitBtn, true, "Logging in...", "Login");
      const data = await loginUser({ email, password });
      saveSession(data.token, data.user);
      window.location.href = "index.html";
    } catch (error) {
      showAlert("login-alert", error.message);
    } finally {
      setButtonLoading(submitBtn, false, "Logging in...", "Login");
    }
  });
}

/* ---------------------------------------------------------
   Init on every page load
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  renderAuthNav();
  initSignupForm();
  initLoginForm();
});
