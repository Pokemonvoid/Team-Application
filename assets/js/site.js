(function () {
  "use strict";

  var config = window.VOID_RECRUITMENT || {};
  var apiBase = (config.apiBaseUrl || "").replace(/\/$/, "");

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setYear() {
    qsa("[data-current-year]").forEach(function (node) {
      node.textContent = new Date().getFullYear();
    });
  }

  function wireMobileMenu() {
    var button = qs("[data-menu-button]");
    var nav = qs("[data-site-nav]");
    if (!button || !nav) return;

    button.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function loginUrl(returnTo) {
    if (!apiBase) return "#backend-not-connected";
    var path = config.discordLoginPath || "/auth/discord";
    return apiBase + path + "?returnTo=" + encodeURIComponent(returnTo || window.location.href);
  }

  function wireDiscordLinks() {
    qsa("[data-discord-login]").forEach(function (link) {
      link.setAttribute("href", loginUrl(link.getAttribute("data-return-to") || window.location.href));
      if (!apiBase) {
        link.addEventListener("click", function (event) {
          event.preventDefault();
          showInlineMessage("Discord sign-in will become available when the Cloudflare backend is connected.", "info");
        });
      }
    });
  }

  function showInlineMessage(message, type) {
    var region = qs("[data-site-message]");
    if (!region) return;
    region.className = "notice-strip " + (type || "info");
    region.textContent = message;
    region.hidden = false;
    region.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function updateAccountUi(session) {
    var signedIn = Boolean(session && session.user);

    qsa("[data-account-state]").forEach(function (node) {
      if (!signedIn) {
        node.textContent = apiBase ? "Not signed in" : "Discord connection pending";
        return;
      }
      var name = session.user.globalName || session.user.username || "Discord user";
      node.textContent = "Signed in as " + name;
    });

    qsa("[data-account-name]").forEach(function (node) {
      node.textContent = signedIn
        ? (session.user.globalName || session.user.username || "Discord user")
        : "—";
    });

    qsa("[data-signed-out-only]").forEach(function (node) {
      node.hidden = signedIn;
    });
    qsa("[data-signed-in-only]").forEach(function (node) {
      node.hidden = !signedIn;
    });
  }

  async function loadSession() {
    if (!apiBase) {
      updateAccountUi(null);
      return null;
    }

    try {
      var response = await fetch(apiBase + "/api/session", {
        credentials: "include",
        headers: { "Accept": "application/json" }
      });
      if (!response.ok) {
        updateAccountUi(null);
        return null;
      }
      var session = await response.json();
      updateAccountUi(session);
      return session;
    } catch (error) {
      updateAccountUi(null);
      return null;
    }
  }

  window.VoidRecruitment = {
    apiBase: apiBase,
    loginUrl: loginUrl,
    loadSession: loadSession,
    showInlineMessage: showInlineMessage,
    qs: qs,
    qsa: qsa
  };

  setYear();
  wireMobileMenu();
  wireDiscordLinks();
  loadSession();
}());
