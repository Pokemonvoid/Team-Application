(function () {
  "use strict";

  var form = document.getElementById("application-form");
  if (!form) return;

  var helpers = window.VoidRecruitment;
  var steps = Array.prototype.slice.call(form.querySelectorAll("[data-form-step]"));
  var stepButtons = Array.prototype.slice.call(document.querySelectorAll("[data-step-jump]"));
  var currentStep = 1;
  var maxVisited = 1;
  var totalSteps = steps.length;

  function fieldLabel(field) {
    if (field.dataset.errorLabel) return field.dataset.errorLabel;
    var id = field.id;
    if (id) {
      var label = form.querySelector('label[for="' + CSS.escape(id) + '"]');
      if (label) return label.textContent.replace("*", "").trim();
    }
    return field.name || "This field";
  }

  function clearErrors() {
    form.querySelectorAll(".has-error").forEach(function (node) {
      node.classList.remove("has-error");
    });
    form.querySelectorAll(".field-error").forEach(function (node) {
      node.remove();
    });
    var summary = document.getElementById("error-summary");
    if (summary) {
      summary.hidden = true;
      summary.querySelector("ul").innerHTML = "";
    }
  }

  function markError(field, message) {
    var holder = field.closest(".field") || field.closest("fieldset") || field.parentElement;
    if (holder) holder.classList.add("has-error");
    field.setAttribute("aria-invalid", "true");

    var error = document.createElement("div");
    error.className = "field-error";
    error.textContent = message;
    if (holder) holder.appendChild(error);
  }

  function requiredRadioGroup(name, label) {
    var radios = Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]'));
    if (!radios.length || radios.some(function (radio) { return radio.checked; })) return null;
    return { field: radios[0], message: "Choose " + label + "." };
  }

  function requiredCheckboxGroup(name, label) {
    var checks = Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]'));
    if (!checks.length || checks.some(function (check) { return check.checked; })) return null;
    return { field: checks[0], message: "Choose at least one " + label + "." };
  }

  function validateVisibleStep(stepNumber) {
    clearErrors();
    var step = form.querySelector('[data-form-step="' + stepNumber + '"]');
    if (!step) return true;
    var errors = [];

    Array.prototype.slice.call(step.querySelectorAll("[required]")).forEach(function (field) {
      if (field.disabled || field.closest("[hidden]")) return;
      if (field.type === "radio" || field.type === "checkbox") return;
      if (!String(field.value || "").trim()) {
        errors.push({ field: field, message: fieldLabel(field) + " is required." });
      } else if (field.type === "url") {
        try {
          new URL(field.value);
        } catch (error) {
          errors.push({ field: field, message: "Enter a complete link beginning with http:// or https://." });
        }
      }
    });

    if (stepNumber === 1) {
      var ageError = requiredRadioGroup("ageGroup", "an age bracket");
      if (ageError) errors.push(ageError);
    }

    if (stepNumber === 3) {
      var roleError = requiredCheckboxGroup("roles", "role");
      if (roleError) errors.push(roleError);
    }

    if (stepNumber === 4) {
      selectedRoles().forEach(function (role) {
        var section = form.querySelector('[data-role-section="' + role + '"]');
        if (!section || section.hidden) return;
        Array.prototype.slice.call(section.querySelectorAll("[data-role-required]"))
          .forEach(function (field) {
            if (!String(field.value || "").trim()) {
              errors.push({ field: field, message: fieldLabel(field) + " is required for this role." });
            }
          });

        if (role === "programmer") {
          var workError = requiredCheckboxGroup("programmerWork", "programming area");
          if (workError) errors.push(workError);
        }
        if (role === "spriter") {
          var spriteError = requiredCheckboxGroup("spritingAbilities", "spriting area");
          if (spriteError) errors.push(spriteError);
        }
      });
    }

    if (!errors.length) return true;

    errors.forEach(function (item) {
      item.field.removeAttribute("aria-invalid");
      markError(item.field, item.message);
    });

    var summary = document.getElementById("error-summary");
    if (summary) {
      var list = summary.querySelector("ul");
      errors.forEach(function (item, index) {
        if (!item.field.id) item.field.id = "field-error-target-" + stepNumber + "-" + index;
        var li = document.createElement("li");
        var link = document.createElement("a");
        link.href = "#" + item.field.id;
        link.textContent = item.message;
        li.appendChild(link);
        list.appendChild(li);
      });
      summary.hidden = false;
      summary.focus();
    }
    return false;
  }

  function selectedRoles() {
    return Array.prototype.slice.call(form.querySelectorAll('input[name="roles"]:checked'))
      .map(function (input) { return input.value; });
  }

  function updateRoleSections() {
    var selected = selectedRoles();
    form.querySelectorAll("[data-role-section]").forEach(function (section) {
      section.hidden = selected.indexOf(section.dataset.roleSection) === -1;
    });

    var empty = document.querySelector("[data-no-role-details]");
    if (empty) empty.hidden = selected.length > 0;
  }

  function stepTitle(stepNumber) {
    var step = form.querySelector('[data-form-step="' + stepNumber + '"]');
    return step ? (step.dataset.stepTitle || "Application") : "Application";
  }

  function showStep(stepNumber, pushHash) {
    stepNumber = Math.max(1, Math.min(totalSteps, stepNumber));
    currentStep = stepNumber;
    maxVisited = Math.max(maxVisited, currentStep);

    steps.forEach(function (step) {
      step.hidden = Number(step.dataset.formStep) !== currentStep;
    });

    stepButtons.forEach(function (button) {
      var number = Number(button.dataset.stepJump);
      button.disabled = number > maxVisited;
      button.setAttribute("aria-current", number === currentStep ? "step" : "false");
      button.dataset.complete = number < currentStep ? "true" : "false";
    });

    var currentLabel = document.querySelector("[data-current-step-label]");
    if (currentLabel) currentLabel.textContent = "Step " + currentStep + " of " + totalSteps;
    var currentTitle = document.querySelector("[data-current-step-title]");
    if (currentTitle) currentTitle.textContent = stepTitle(currentStep);

    var back = document.querySelector("[data-back-step]");
    if (back) back.hidden = currentStep === 1;

    var next = document.querySelector("[data-next-step]");
    if (next) next.hidden = currentStep === totalSteps;

    var submit = document.querySelector("[data-submit-application]");
    if (submit) submit.hidden = currentStep !== totalSteps;

    if (currentStep === 4) updateRoleSections();
    if (currentStep === 5) buildReview();

    if (pushHash) history.replaceState(null, "", "#step-" + currentStep);
    var shell = document.querySelector(".form-shell");
    if (shell) shell.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function checkedValues(name) {
    return Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(function (field) { return field.dataset.label || field.value; });
  }

  function valueOf(name) {
    var field = form.elements[name];
    if (!field) return "";
    if (field instanceof RadioNodeList) return field.value || "";
    return String(field.value || "").trim();
  }

  function addReviewRow(container, label, value) {
    if (!value || (Array.isArray(value) && value.length === 0)) return;
    var row = document.createElement("div");
    row.className = "review-row";
    var term = document.createElement("div");
    term.className = "review-term";
    term.textContent = label;
    var data = document.createElement("div");
    data.className = "review-value";
    data.textContent = Array.isArray(value) ? value.join(", ") : value;
    row.appendChild(term);
    row.appendChild(data);
    container.appendChild(row);
  }

  function buildReview() {
    var container = document.getElementById("review-list");
    if (!container) return;
    container.innerHTML = "";

    addReviewRow(container, "Name", valueOf("name"));
    addReviewRow(container, "Timezone", valueOf("timezone"));
    addReviewRow(container, "Pronouns", valueOf("pronouns") || "Not provided");
    addReviewRow(container, "Age bracket", valueOf("ageGroup"));
    addReviewRow(container, "Experience", valueOf("experience"));
    addReviewRow(container, "What interests you", valueOf("interest"));
    addReviewRow(container, "Critique", valueOf("critique"));
    addReviewRow(container, "Pokémon-related projects", valueOf("pokemonProjects") || "None provided");
    addReviewRow(container, "Time commitment", valueOf("timeCommitment"));
    addReviewRow(container, "Anything else", valueOf("anythingElse") || "Nothing added");
    addReviewRow(container, "Roles", checkedValues("roles"));

    if (selectedRoles().indexOf("programmer") !== -1) {
      addReviewRow(container, "Programming background", valueOf("programmingBackground"));
      addReviewRow(container, "Essentials / RPG Maker XP familiarity", valueOf("essentialsFamiliarity"));
      addReviewRow(container, "Programming interests", checkedValues("programmerWork"));
      addReviewRow(container, "Programming examples", valueOf("programmerExamples"));
    }
    if (selectedRoles().indexOf("move-animator") !== -1) {
      addReviewRow(container, "Move animation experience", valueOf("moveAnimationExperience"));
      addReviewRow(container, "Move animation examples", valueOf("moveAnimationExamples"));
    }
    if (selectedRoles().indexOf("spriter") !== -1) {
      addReviewRow(container, "Spriting areas", checkedValues("spritingAbilities"));
      addReviewRow(container, "Spriting portfolio", valueOf("spriterPortfolio"));
      addReviewRow(container, "Style comfort", valueOf("spriterStyle"));
      addReviewRow(container, "Art experience", valueOf("spriterExperience"));
    }
    if (selectedRoles().indexOf("music") !== -1) {
      addReviewRow(container, "Music portfolio", valueOf("musicPortfolio"));
      addReviewRow(container, "Style comfort", valueOf("musicStyle"));
      addReviewRow(container, "Music experience", valueOf("musicExperience"));
    }
  }

  function payload() {
    return {
      profile: {
        name: valueOf("name"),
        timezone: valueOf("timezone"),
        pronouns: valueOf("pronouns") || null,
        ageGroup: valueOf("ageGroup")
      },
      general: {
        experience: valueOf("experience"),
        interest: valueOf("interest"),
        critique: valueOf("critique"),
        pokemonProjects: valueOf("pokemonProjects") || null,
        timeCommitment: valueOf("timeCommitment"),
        anythingElse: valueOf("anythingElse") || null
      },
      roles: selectedRoles(),
      roleDetails: {
        programmer: selectedRoles().indexOf("programmer") !== -1 ? {
          background: valueOf("programmingBackground"),
          essentialsFamiliarity: valueOf("essentialsFamiliarity"),
          interests: checkedValues("programmerWork"),
          examples: valueOf("programmerExamples") || null
        } : null,
        moveAnimator: selectedRoles().indexOf("move-animator") !== -1 ? {
          experience: valueOf("moveAnimationExperience"),
          examples: valueOf("moveAnimationExamples") || null
        } : null,
        spriter: selectedRoles().indexOf("spriter") !== -1 ? {
          abilities: checkedValues("spritingAbilities"),
          portfolio: valueOf("spriterPortfolio") || null,
          styleComfort: valueOf("spriterStyle"),
          experience: valueOf("spriterExperience") || null
        } : null,
        music: selectedRoles().indexOf("music") !== -1 ? {
          portfolio: valueOf("musicPortfolio") || null,
          styleComfort: valueOf("musicStyle"),
          experience: valueOf("musicExperience") || null
        } : null
      }
    };
  }

  async function submitApplication() {
    for (var stepNumber = 1; stepNumber < totalSteps; stepNumber += 1) {
      if (!validateVisibleStep(stepNumber)) {
        showStep(stepNumber, true);
        return;
      }
    }
    showStep(totalSteps, false);
    clearErrors();
    var apiBase = helpers.apiBase;
    var message = document.getElementById("submit-message");
    var button = document.querySelector("[data-submit-application]");

    if (!apiBase) {
      message.className = "notice-strip info";
      message.textContent = "The form is ready, but live submissions are not connected yet. Connect the Cloudflare backend before opening applications.";
      message.hidden = false;
      message.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }

    button.disabled = true;
    button.textContent = "Submitting…";
    message.hidden = true;

    try {
      var response = await fetch(apiBase + "/api/application", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload())
      });
      var result = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(result.message || "Your application could not be submitted.");

      message.className = "notice-strip success";
      message.textContent = "Application submitted. You can now check its progress from My Application.";
      message.hidden = false;
      form.querySelectorAll("input, textarea, select, button").forEach(function (control) {
        control.disabled = true;
      });
      message.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
      message.className = "notice-strip error";
      message.textContent = error.message || "Your application could not be submitted. Please try again.";
      message.hidden = false;
      button.disabled = false;
      button.textContent = "Submit application";
      message.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  document.querySelector("[data-next-step]").addEventListener("click", function () {
    if (!validateVisibleStep(currentStep)) return;
    showStep(currentStep + 1, true);
  });

  document.querySelector("[data-back-step]").addEventListener("click", function () {
    clearErrors();
    showStep(currentStep - 1, true);
  });

  stepButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var target = Number(button.dataset.stepJump);
      if (target <= maxVisited) showStep(target, true);
    });
  });

  form.querySelectorAll('input[name="roles"]').forEach(function (input) {
    input.addEventListener("change", updateRoleSections);
  });

  var requestedRole = new URLSearchParams(window.location.search).get("role");
  if (requestedRole) {
    var requestedRoleInput = form.querySelector('input[name="roles"][value="' + requestedRole.replace(/"/g, "") + '"]');
    if (requestedRoleInput) requestedRoleInput.checked = true;
  }

  form.addEventListener("input", function (event) {
    event.target.removeAttribute("aria-invalid");
    var holder = event.target.closest(".has-error");
    if (holder) {
      holder.classList.remove("has-error");
      var old = holder.querySelector(".field-error");
      if (old) old.remove();
    }
  });

  document.querySelector("[data-submit-application]").addEventListener("click", submitApplication);

  var hashMatch = window.location.hash.match(/^#step-(\d)$/);
  var initialStep = hashMatch ? Number(hashMatch[1]) : 1;
  maxVisited = Math.max(1, initialStep);
  showStep(initialStep, false);
}());
