(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const toast = (message) => {
    $('.toast')?.remove();
    const node = document.createElement('div');
    node.className = 'toast';
    node.setAttribute('role', 'status');
    node.textContent = message;
    document.body.appendChild(node);
    window.setTimeout(() => node.remove(), 5200);
  };

  $$('[data-demo-oauth]').forEach((button) => {
    button.addEventListener('click', () => {
      toast('Discord OAuth is not connected in this frontend build yet. This will redirect to the Cloudflare OAuth start endpoint in production.');
    });
  });

  $$('[data-preview-oauth]').forEach((button) => {
    button.addEventListener('click', () => {
      const disconnected = $('[data-oauth-disconnected]');
      const connected = $('[data-oauth-connected]');
      if (disconnected) disconnected.hidden = true;
      if (connected) connected.hidden = false;
      const next = $('[data-step-next]');
      if (next) next.disabled = false;
      toast('Preview mode only: showing the post-Discord-login state. No account data has been collected.');
    });
  });

  $$('textarea[maxlength]').forEach((field) => {
    const counter = document.querySelector(`[data-count-for="${field.id}"]`);
    if (!counter) return;
    const max = Number(field.getAttribute('maxlength'));
    const update = () => { counter.textContent = `${field.value.length} / ${max}`; };
    field.addEventListener('input', update);
    update();
  });

  const form = $('#application-form');
  if (form) {
    const steps = $$('.form-step', form);
    const sideSteps = $$('.step', document);
    let current = 0;

    const showStep = (index) => {
      current = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach((step, i) => { step.hidden = i !== current; });
      sideSteps.forEach((step, i) => {
        step.classList.toggle('current', i === current);
        step.classList.toggle('complete', i < current);
      });
      const label = $('[data-step-label]');
      if (label) label.textContent = `STEP ${String(current + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const validateStep = () => {
      const required = $$('input, textarea, select', steps[current]).filter(el => !el.disabled && (el.required || el.hasAttribute('minlength')));
      for (const field of required) {
        if (!field.checkValidity()) {
          field.reportValidity();
          return false;
        }
      }
      return true;
    };

    const buildReview = () => {
      const role = $('#role')?.value || '—';
      const experience = $('#experience')?.value || '—';
      const why = $('#why')?.value || '—';
      const availability = $('#availability')?.value || '—';
      const portfolio = $('#portfolio')?.value || 'No links supplied';
      const map = { role, experience, why, availability, portfolio };
      Object.entries(map).forEach(([key, value]) => {
        const target = document.querySelector(`[data-review="${key}"]`);
        if (target) target.textContent = value;
      });
    };

    $$('[data-step-next]', form).forEach((button) => {
      button.addEventListener('click', () => {
        if (!validateStep()) return;
        if (current === steps.length - 2) buildReview();
        showStep(current + 1);
      });
    });

    $$('[data-step-back]', form).forEach((button) => {
      button.addEventListener('click', () => showStep(current - 1));
    });

    const role = $('#role');
    const roleBrief = $('[data-role-brief]');
    if (role && roleBrief) {
      const briefs = {
        'Pixel Artist / Spriter': 'Prepare examples of sprites or pixel-art work. Finished pieces and process examples are both useful.',
        'Programmer': 'Prepare examples of technical work, repositories where appropriate, and a brief explanation of what you personally implemented. Large video demonstrations can be arranged separately.',
        'Writer / Designer': 'Prepare writing, design documentation, narrative work, balancing/design samples, or implemented examples where possible.',
        'Mapper / Environment': 'Prepare maps, environments, level-design examples, or screenshots/links showing relevant work.',
        'Other Development Role': 'Provide material that demonstrates the skills relevant to the position you are proposing.'
      };
      const update = () => {
        const text = briefs[role.value];
        roleBrief.hidden = !text;
        if (text) roleBrief.querySelector('p').textContent = text;
      };
      role.addEventListener('change', update);
      update();
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      toast('Frontend review complete. Submission remains disabled until the authenticated Cloudflare API endpoint is connected.');
    });

    showStep(0);
  }

  $$('[data-demo-ticket-reply]').forEach((button) => {
    button.addEventListener('click', () => toast('Interview replies are display-only in this frontend prototype. Encryption and message submission belong in the backend design.'));
  });

  const demoApplications = {
    'PV-24018': {
      role: 'Pixel Artist / Spriter', status: 'NEW', age: '12 min', flags: 'None',
      experience: 'Applicant supplied several sprite examples and described prior collaborative pixel-art work.',
      why: 'Interested in contributing creature sprites and helping with production clean-up.'
    },
    'PV-24017': {
      role: 'Programmer', status: 'FLAGGED', age: '28 min', flags: 'Repeated link / manual review',
      experience: 'Applicant supplied programming examples and a technical portfolio link.',
      why: 'Interested in tooling and gameplay implementation work.'
    },
    'PV-24013': {
      role: 'Writer / Designer', status: 'IN REVIEW', age: '1 hr', flags: 'None',
      experience: 'Applicant supplied writing and game-design samples.',
      why: 'Interested in narrative and encounter design.'
    }
  };

  $$('[data-application-id]').forEach((row) => {
    row.addEventListener('click', () => {
      $$('[data-application-id]').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
      const id = row.dataset.applicationId;
      const data = demoApplications[id];
      if (!data) return;
      $('[data-preview-id]').textContent = id;
      $('[data-preview-role]').textContent = data.role;
      $('[data-preview-status]').textContent = data.status;
      $('[data-preview-age]').textContent = data.age;
      $('[data-preview-flags]').textContent = data.flags;
      $('[data-preview-experience]').textContent = data.experience;
      $('[data-preview-why]').textContent = data.why;
    });
  });

  $$('[data-admin-demo-action]').forEach((button) => {
    button.addEventListener('click', () => toast('Director action is a UI prototype only. Production actions must be authorised and written through the Cloudflare API.'));
  });
})();
