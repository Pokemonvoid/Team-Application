(function () {
  "use strict";

  var helpers = window.VoidRecruitment;
  if (!helpers) return;

  function text(node, value) {
    if (node) node.textContent = value == null || value === "" ? "—" : value;
  }

  function statusClass(status) {
    return String(status || "submitted").toLowerCase().replace(/[^a-z]+/g, "-");
  }

  function showPanelMessage(id, message, type) {
    var node = document.getElementById(id);
    if (!node) return;
    node.className = "notice-strip " + (type || "info");
    node.textContent = message;
    node.hidden = false;
  }

  async function getJson(path) {
    var response = await fetch(helpers.apiBase + path, {
      credentials: "include",
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) {
      var body = await response.json().catch(function () { return {}; });
      var error = new Error(body.message || "Request failed.");
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  async function loadStatus() {
    var empty = document.getElementById("status-empty");
    var panel = document.getElementById("status-panel");
    if (!helpers.apiBase) {
      showPanelMessage("status-message", "The applicant portal is ready, but the live Cloudflare connection has not been added yet.", "info");
      return;
    }

    var session = await helpers.loadSession();
    if (!session || !session.user) {
      if (empty) empty.hidden = false;
      return;
    }

    try {
      var data = await getJson("/api/application/status");
      if (!data.application) {
        if (empty) empty.hidden = false;
        text(document.querySelector("#status-empty h2"), "No application yet");
        return;
      }

      var app = data.application;
      if (empty) empty.hidden = true;
      if (panel) panel.hidden = false;
      text(document.querySelector("[data-status-id]"), app.id);
      text(document.querySelector("[data-status-roles]"), (app.roles || []).join(", "));
      text(document.querySelector("[data-status-updated]"), app.updatedAt || app.submittedAt);
      var badge = document.querySelector("[data-status-badge]");
      if (badge) {
        badge.textContent = app.status || "Submitted";
        badge.className = "status-badge " + statusClass(app.status);
      }

      var list = document.querySelector("[data-status-timeline]");
      if (list && Array.isArray(app.timeline)) {
        list.innerHTML = "";
        app.timeline.forEach(function (item) {
          var li = document.createElement("li");
          if (item.complete) li.className = "done";
          var strong = document.createElement("strong");
          strong.textContent = item.title;
          var span = document.createElement("span");
          span.textContent = item.detail || "";
          li.appendChild(strong);
          li.appendChild(span);
          list.appendChild(li);
        });
      }
    } catch (error) {
      if (error.status === 404) {
        if (empty) empty.hidden = false;
      } else {
        showPanelMessage("status-message", error.message, "error");
      }
    }
  }

  async function loadInterview() {
    if (!helpers.apiBase) {
      showPanelMessage("interview-message", "Interview tickets will become available after the backend and interview privacy design are connected.", "info");
      return;
    }

    var session = await helpers.loadSession();
    if (!session || !session.user) {
      document.getElementById("interview-signin").hidden = false;
      return;
    }

    try {
      var data = await getJson("/api/interview");
      if (!data.ticket) {
        document.getElementById("interview-empty").hidden = false;
        return;
      }
      document.getElementById("interview-panel").hidden = false;
      text(document.querySelector("[data-ticket-id]"), data.ticket.id);
      text(document.querySelector("[data-ticket-status]"), data.ticket.status);
      var log = document.querySelector("[data-ticket-log]");
      log.innerHTML = "";
      (data.ticket.messages || []).forEach(function (message) {
        var entry = document.createElement("article");
        entry.className = "ticket-entry";
        var meta = document.createElement("div");
        meta.className = "ticket-meta";
        var sender = document.createElement("strong");
        sender.textContent = message.senderLabel || "Pokémon Void Recruitment";
        var when = document.createElement("span");
        when.textContent = message.sentAt || "";
        meta.appendChild(sender);
        meta.appendChild(when);
        var body = document.createElement("div");
        body.className = "ticket-body";
        body.textContent = message.body || "";
        entry.appendChild(meta);
        entry.appendChild(body);
        log.appendChild(entry);
      });
    } catch (error) {
      if (error.status === 404) document.getElementById("interview-empty").hidden = false;
      else showPanelMessage("interview-message", error.message, "error");
    }
  }

  function rowForApplication(app) {
    var tr = document.createElement("tr");
    tr.dataset.status = statusClass(app.status);
    var applicant = document.createElement("td");
    var link = document.createElement("a");
    link.href = "#application-" + encodeURIComponent(app.id);
    link.textContent = app.displayName || app.discordUsername || app.id;
    applicant.appendChild(link);

    var roles = document.createElement("td");
    roles.textContent = (app.roles || []).join(", ");
    var status = document.createElement("td");
    var badge = document.createElement("span");
    badge.className = "status-badge " + statusClass(app.status);
    badge.textContent = app.status || "Submitted";
    status.appendChild(badge);
    var submitted = document.createElement("td");
    submitted.textContent = app.submittedAt || "—";
    var handler = document.createElement("td");
    handler.textContent = app.claimedBy || "Unclaimed";

    [applicant, roles, status, submitted, handler].forEach(function (cell) { tr.appendChild(cell); });
    return tr;
  }

  async function loadAdmin() {
    if (!helpers.apiBase) {
      showPanelMessage("admin-message", "The Director portal is ready for integration. Live application data will only appear after the Cloudflare backend and Director permissions are connected.", "info");
      return;
    }

    var session = await helpers.loadSession();
    if (!session || !session.user) {
      document.getElementById("admin-locked").hidden = false;
      return;
    }

    try {
      var data = await getJson("/api/admin/applications");
      if (!data.authorized) {
        document.getElementById("admin-locked").hidden = false;
        return;
      }
      document.getElementById("admin-shell").hidden = false;
      var body = document.querySelector("[data-queue-body]");
      body.innerHTML = "";
      (data.applications || []).forEach(function (app) { body.appendChild(rowForApplication(app)); });
      var empty = document.querySelector("[data-queue-empty]");
      if (empty) empty.hidden = (data.applications || []).length > 0;
    } catch (error) {
      if (error.status === 401 || error.status === 403) document.getElementById("admin-locked").hidden = false;
      else showPanelMessage("admin-message", error.message, "error");
    }
  }

  function wireAdminFilters() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-queue-filter]"));
    if (!buttons.length) return;
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) { item.setAttribute("aria-pressed", "false"); });
        button.setAttribute("aria-pressed", "true");
        var wanted = button.dataset.queueFilter;
        document.querySelectorAll("[data-queue-body] tr").forEach(function (row) {
          row.hidden = wanted !== "all" && row.dataset.status !== wanted;
        });
      });
    });
  }

  var page = document.body.dataset.portalPage;
  if (page === "status") loadStatus();
  if (page === "interview") loadInterview();
  if (page === "admin") {
    wireAdminFilters();
    loadAdmin();
  }
}());
