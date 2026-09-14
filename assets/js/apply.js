(function () {
  "use strict";

  var form = document.querySelector("[data-application-form]");
  if (!form) return;

  var steps = Array.from(form.querySelectorAll("[data-form-step]"));
  var tabs = Array.from(document.querySelectorAll("[data-step-tab]"));
  var roleInputs = Array.from(form.querySelectorAll('input[name="roles"]'));
  var currentStep = 0;

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

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectedRoles() {
    return roleInputs.filter(function (input) {
      return input.checked;
    }).map(function (input) {
      return input.value;
    });
  }

  function updateRoleQuestions() {
    var roles = selectedRoles();
    document.querySelectorAll("[data-role-questions]").forEach(function (block) {
      var role = block.getAttribute("data-role-questions");
      block.hidden = !roles.includes(role);
    });

    var emptyNote = document.querySelector("[data-no-role-questions]");
    if (emptyNote) {
      emptyNote.hidden = roles.length > 0;
    }
  }

  function updateAgeRules() {
    var age = form.querySelector('[name="age_group"]');
    var under18 = document.querySelector("[data-under-18]");
    if (!age || !under18) return;

    var requiredForMinor = [
      form.elements.referral,
      form.elements.minor_portfolio,
      form.elements.guardian_permission
    ].filter(Boolean);
    var isMinor = age.value === "16-17";

    under18.hidden = !isMinor;
    requiredForMinor.forEach(function (field) {
      field.required = isMinor;
    });
  }

  function validateStep(index) {
    var required = Array.from(steps[index].querySelectorAll("[required]"));
    var valid = true;

    required.forEach(function (field) {
      if (!field.checkValidity()) {
        valid = false;
      }
    });

    if (index === 1 && selectedRoles().length === 0) {
      valid = false;
      if (window.VoidRecruitment) {
        window.VoidRecruitment.showToast("Choose at least one role before continuing.");
      }
    }

    if (!valid) {
      var firstInvalid = required.find(function (field) {
        return !field.checkValidity();
      });
      if (firstInvalid) firstInvalid.reportValidity();
    }

    return valid;
  }

  function readableValue(field) {
    if (!field) return "—";
    if (field.type === "checkbox") return field.checked ? "Yes" : "No";
    return field.value.trim() || "—";
  }

  function buildReview() {
    var review = document.querySelector("[data-review-list]");
    if (!review) return;

    var rows = [
      ["Name", readableValue(form.elements.preferred_name)],
      ["Timezone", readableValue(form.elements.timezone)],
      ["Pronouns", readableValue(form.elements.pronouns)],
      ["Age", readableValue(form.elements.age_group)],
      ["Referral", form.elements.age_group.value === "16-17" ? readableValue(form.elements.referral) : "Not required"],
      ["Portfolio", form.elements.age_group.value === "16-17" ? readableValue(form.elements.minor_portfolio) : "Not required"],
      ["Roles", selectedRoles().join(", ") || "—"],
      ["Experience", readableValue(form.elements.experience)],
      ["What interests you", readableValue(form.elements.interests)],
      ["Handling critique", readableValue(form.elements.critique)],
      ["Pokémon-related projects", readableValue(form.elements.pokemon_projects)]
    ];

    review.innerHTML = "";
    rows.forEach(function (row) {
      var wrap = document.createElement("div");
      wrap.className = "review-item";
      var term = document.createElement("dt");
      var description = document.createElement("dd");
      term.textContent = row[0];
      description.textContent = row[1];
      wrap.appendChild(term);
      wrap.appendChild(description);
      review.appendChild(wrap);
    });
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

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (window.VoidRecruitment && !window.VoidRecruitment.getApiBase()) {
      window.VoidRecruitment.showToast("The form is ready, but submissions stay disabled until the Cloudflare backend is connected.");
      return;
    }
  });

  updateAgeRules();
  updateRoleQuestions();
  setStep(0);
})();
