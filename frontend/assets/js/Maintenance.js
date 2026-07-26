/**
 * maintenance.js
 * Shows a countdown "Purchase Credits" banner at the very top of the page
 * until the target date/time, then automatically switches to a full-site
 * block with your "Not Enough Credits" message. Stays blocked permanently
 * after that, on every page and every reload, until you manually disable it.
 *
 * TO DISABLE: set MAINTENANCE_ENABLED to false, or remove the <script>
 * tag that includes this file from your HTML pages.
 */

(function () {
  const MAINTENANCE_ENABLED = true;

  // 2026-07-26 12:00 PM Pakistan Time (PKT = UTC+5) -> 07:00 UTC
  const TARGET_TIME_UTC = "2027-08-01T16:00:00Z";

  // ---- Countdown banner text ----
  const BANNER_TEXT = "Site is running low on credits. Please recharge to continue using the service.";
  const BUTTON_TEXT = "Purchase Credits";
  // Where the "Purchase Credits" button should go.
  // Defaults to a mailto link since that's the contact email used elsewhere
  // on the site — change this to your real purchase/contact page URL.
  const PURCHASE_URL = "mailto:contact@hrsupport.com";

  // ---- Locked-out message (shown after time runs out) ----
  const MESSAGE_TITLE = "Not Enough Credits";
  const MESSAGE_BODY = "Please Recharge and Contact with Team. Thanks.";
  const CONTACT_EMAIL = "contact@hrsupport.com";

  const BANNER_ID = "maintenance-countdown-banner";
  const OVERLAY_ID = "maintenance-lock-overlay";

  function injectStyles() {
    if (document.getElementById("maintenance-lock-styles")) return;
    const style = document.createElement("style");
    style.id = "maintenance-lock-styles";
    style.textContent = `
      #${BANNER_ID} {
        position: sticky;
        top: 0;
        z-index: 2147483647;
        width: 100%;
        background: #d9302f;
        color: #fff;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 14px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 10px 16px;
        text-align: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      }
      #${BANNER_ID} .maintenance-countdown-text {
        font-weight: bold;
        letter-spacing: 0.3px;
      }
      #${BANNER_ID} .maintenance-countdown-timer {
        font-variant-numeric: tabular-nums;
        background: rgba(255,255,255,0.15);
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: bold;
      }
      #${BANNER_ID} .maintenance-countdown-btn {
        background: #fff;
        color: #d9302f;
        font-weight: bold;
        text-decoration: none;
        padding: 6px 14px;
        border-radius: 6px;
        white-space: nowrap;
      }
      #${BANNER_ID} .maintenance-countdown-btn:hover {
        opacity: 0.9;
      }

      #${OVERLAY_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        background: #0f1115;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        font-family: Arial, Helvetica, sans-serif;
      }
      #${OVERLAY_ID} .maintenance-lock-card {
        max-width: 480px;
        width: 100%;
        text-align: center;
        background: #ffffff;
        border-radius: 12px;
        padding: 40px 32px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.35);
      }
      #${OVERLAY_ID} h1 {
        color: #d9302f;
        font-size: 26px;
        margin: 0 0 12px;
      }
      #${OVERLAY_ID} p {
        color: #333;
        font-size: 16px;
        margin: 0 0 8px;
        line-height: 1.5;
      }
      #${OVERLAY_ID} .maintenance-lock-contact {
        margin-top: 16px;
        font-size: 15px;
        color: #555;
      }
    `;
    document.head.appendChild(style);
  }

  function formatRemaining(ms) {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return days > 0
      ? `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`
      : `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  function showBanner() {
    if (document.getElementById(BANNER_ID)) return;

    const banner = document.createElement("div");
    banner.id = BANNER_ID;
    banner.innerHTML = `
      <span class="maintenance-countdown-text">${BANNER_TEXT}</span>
      <span class="maintenance-countdown-timer" id="maintenance-countdown-value">--</span>
      <a class="maintenance-countdown-btn" href="${PURCHASE_URL}">${BUTTON_TEXT}</a>
    `;
    document.body.insertBefore(banner, document.body.firstChild);
  }

  function removeBanner() {
    const banner = document.getElementById(BANNER_ID);
    if (banner) banner.remove();
  }

  function showLock() {
    if (document.getElementById(OVERLAY_ID)) return; // already shown

    removeBanner();

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = `
      <div class="maintenance-lock-card">
        <h1>${MESSAGE_TITLE}</h1>
        <p>${MESSAGE_BODY}</p>
        <p class="maintenance-lock-contact">Contact us: <strong>${CONTACT_EMAIL}</strong></p>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function tick() {
    if (!MAINTENANCE_ENABLED) return;

    const now = Date.now();
    const target = new Date(TARGET_TIME_UTC).getTime();
    const remaining = target - now;

    if (remaining <= 0) {
      showLock();
      return;
    }

    showBanner();
    const valueEl = document.getElementById("maintenance-countdown-value");
    if (valueEl) valueEl.textContent = formatRemaining(remaining);
  }

  function init() {
    injectStyles();
    tick();
    setInterval(tick, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();