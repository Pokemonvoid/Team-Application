(function () {
  "use strict";

  var form = document.querySelector("[data-application-form]");
  if (!form) return;

  var steps = Array.from(form.querySelectorAll("[data-form-step]"));
  var tabs = Array.from(document.querySelectorAll("[data-step-tab]"));
  var roleInputs = Array.from(form.querySelectorAll('input[name="roles"]'));
  var progressLabel = document.querySelector("[data-progress-label]");
  var progressBar = document.querySelector("[data-progress-bar]");
  var currentStep = 0;

  function selectedRoles() {
    return roleInputs.filter(function (input) {
      return input.checked;
    }).map(function (input) {
      return input.value;
    });
  }

  function checkedValues(name) {
    return Array.from(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function (input) {
      return input.value;
    });
  }

  function setStep(index) {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;

    steps.forEach(function (step, stepIndex) {
      step.hidden = stepIndex !== index;
    });

    tabs.forEach(function (tab, tabIndex) {
      tab.classList.toggle("is-active", tabIndex === index);
      tab.classList.toggle("is-complete", tabIndex < index);
      tab.setAttribute("aria-current", tabIndex === index ? "step" : "false");
    });

    if (progressLabel) {
      progressLabel.textContent = "Step " + (index + 1) + " of " + steps.length + " · " + (steps[index].getAttribute("data-step-name") || "Application");
    }

    if (progressBar) {
      progressBar.style.width = (((index + 1) / steps.length) * 100) + "%";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setRequired(fieldName, required) {
    var field = form.elements[fieldName];
    if (field) field.required = required;
  }

  function updateRoleQuestions() {
    var roles = selectedRoles();

    document.querySelectorAll("[data-role-questions]").forEach(function (block) {
      var role = block.getAttribute("data-role-questions");
      block.hidden = !roles.includes(role);
    });

    var emptyNote = document.querySelector("[data-no-role-questions]");
    if (emptyNote) emptyNote.hidden = roles.length > 0;

    setRequired("programming_kind", roles.includes("Programming"));
    setRequired("essentials_familiarity", roles.includes("Programming"));
    setRequired("sprite_style", roles.includes("Spriting"));
    setRequired("music_style", roles.includes("Music"));
  }

  function updateAgeRules() {
    var age = form.querySelector('[name="age_group"]');
    var under18 = document.querySelector("[data-under-18]");
    if (!age || !under18) return;

    var isMinor = age.value === "under-18";
    under18.hidden = !isMinor;

    ["referral", "minor_portfolio", "guardian_permission"].forEach(function (name) {
      setRequired(name, isMinor);
    });
  }

  function showValidationMessage(message) {
    if (window.VoidRecruitment) window.VoidRecruitment.showToast(message);
  }

  function validateRoleQuestions() {
    var roles = selectedRoles();

    if (roles.includes("Programming") && checkedValues("programming_interest").length === 0) {
      showValidationMessage("Choose at least one programming area you would like to work on.");
      return false;
    }

    if (roles.includes("Spriting") && checkedValues("spriting_ability").length === 0) {
      showValidationMessage("Choose at least one spriting area you are comfortable with.");
      return false;
    }

    if (roles.includes("Spriting")) {
      var spritePortfolio = form.elements.sprite_portfolio.value.trim();
      var spriteExperience = form.elements.sprite_no_portfolio.value.trim();
      if (!spritePortfolio && !spriteExperience) {
        showValidationMessage("For Spriting, add a portfolio link or tell us about your art experience.");
        return false;
      }
    }

    if (roles.includes("Music")) {
      var musicPortfolio = form.elements.music_portfolio.value.trim();
      var musicExperience = form.elements.music_no_portfolio.value.trim();
      if (!musicPortfolio && !musicExperience) {
        showValidationMessage("For Music, add a portfolio link or tell us about your music experience.");
        return false;
      }
    }

    return true;
  }

  function validateStep(index) {
    var required = Array.from(steps[index].querySelectorAll("[required]"));
    var firstInvalid = required.find(function (field) {
      return !field.checkValidity();
    });

    if (firstInvalid) {
      firstInvalid.reportValidity();
      return false;
    }

    if (index === 1 && selectedRoles().length === 0) {
      showValidationMessage("Choose at least one role before continuing.");
      return false;
    }

    if (index === 2 && !validateRoleQuestions()) return false;
    return true;
  }

  function readableValue(field) {
    if (!field) return "—";
    if (field.type === "checkbox") return field.checked ? "Yes" : "No";
    return field.value.trim() || "—";
  }

  function addReviewRow(review, label, value) {
    var wrap = document.createElement("div");
    wrap.className = "review-item";
    var term = document.createElement("dt");
    var description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    wrap.appendChild(term);
    wrap.appendChild(description);
    review.appendChild(wrap);
  }

  function buildReview() {
    var review = document.querySelector("[data-review-list]");
    if (!review) return;

    var ageLabel = form.elements.age_group.options[form.elements.age_group.selectedIndex];
    var roles = selectedRoles();
    review.innerHTML = "";

    addReviewRow(review, "Name", readableValue(form.elements.preferred_name));
    addReviewRow(review, "Timezone", readableValue(form.elements.timezone));
    addReviewRow(review, "Pronouns", readableValue(form.elements.pronouns));
    addReviewRow(review, "Age bracket", ageLabel ? ageLabel.text : "—");
    if (form.elements.age_group.value === "under-18") {
      addReviewRow(review, "Referral", readableValue(form.elements.referral));
      addReviewRow(review, "Under-18 portfolio", readableValue(form.elements.minor_portfolio));
    }
    addReviewRow(review, "Roles", roles.join(", ") || "—");
    addReviewRow(review, "Experience", readableValue(form.elements.experience));
    addReviewRow(review, "What interests you", readableValue(form.elements.interests));
    addReviewRow(review, "Handling critique", readableValue(form.elements.critique));
    addReviewRow(review, "Time commitment", readableValue(form.elements.time_commitment));
    addReviewRow(review, "Pokémon-related projects", readableValue(form.elements.pokemon_projects));
    addReviewRow(review, "Anything else", readableValue(form.elements.anything_else));
  }

  function formPayload() {
    var data = new FormData(form);
    var payload = {};

    data.forEach(function (value, key) {
      if (key === "accuracy_confirmed") return;
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        if (!Array.isArray(payload[key])) payload[key] = [payload[key]];
        payload[key].push(value);
      } else {
        payload[key] = value;
      }
    });

    return payload;
  }

  document.querySelectorAll("[data-next-step]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (!validateStep(currentStep)) return;
      if (currentStep === steps.length - 2) buildReview();
      setStep(currentStep + 1);
    });
  });

  document.querySelectorAll("[data-prev-step]").forEach(function (button) {
    button.addEventListener("click", function () {
      setStep(currentStep - 1);
    });
  });

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      if (index <= currentStep) setStep(index);
    });
  });

  roleInputs.forEach(function (input) {
    input.addEventListener("change", updateRoleQuestions);
  });

  var ageSelect = form.querySelector('[name="age_group"]');
  if (ageSelect) ageSelect.addEventListener("change", updateAgeRules);

  var timezone = form.querySelector('[name="timezone"]');
  if (timezone && !timezone.value) {
    try {
      timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch (error) {
      timezone.value = "";
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validateStep(currentStep) || !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!window.VoidRecruitment || !window.VoidRecruitment.getApiBase()) {
      showValidationMessage("The form is ready, but live submissions are not enabled yet.");
      return;
    }

    var submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    fetch(window.VoidRecruitment.getApiBase() + "/api/application", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPayload())
    }).then(function (response) {
      if (!response.ok) throw new Error("submit_failed");
      return response.json();
    }).then(function () {
      window.location.href = "status.html";
    }).catch(function () {
      showValidationMessage("The application could not be submitted. Please try again in a moment.");
      if (submitButton) submitButton.disabled = false;
    });
  });

  updateAgeRules();
  updateRoleQuestions();
  setStep(0);
})();
