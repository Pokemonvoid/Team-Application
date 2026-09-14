(function () {
  "use strict";

  var config = window.VOID_RECRUITMENT || {};
  var toast = document.querySelector("[data-toast]");
  var toastTimer = null;

  function showToast(message) {
    if (!toast) {
      window.alert(message);
      return;
    }

    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.hidden = true;
    }, 4200);
  }

  function getApiBase() {
    return String(config.apiBaseUrl || "").replace(/\/$/, "");
  }

  document.querySelectorAll("[data-discord-login]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      var apiBase = getApiBase();

      if (!apiBase) {
        showToast("Discord sign-in will be enabled when the recruitment backend is connected.");
        return;
      }

      var returnTo = button.getAttribute("data-return-to") || window.location.pathname;
      var loginPath = config.discordLoginPath || "/auth/discord";
      window.location.href = apiBase + loginPath + "?returnTo=" + encodeURIComponent(returnTo);
    });
  });

  document.querySelectorAll("[data-backend-action]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      if (!getApiBase()) {
        event.preventDefault();
        showToast("This action will become available when the Cloudflare backend is connected.");
      }
    });
  });

  var year = document.querySelector("[data-current-year]");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  window.VoidRecruitment = {
    showToast: showToast,
    getApiBase: getApiBase
  };
})();
