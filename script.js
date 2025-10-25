const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const intervalStore = new Map();
const trackedTimeouts = new Set();
let toastContainer;
const toastRegistry = new Map();

const setManagedTimeout = (callback, delay) => {
  const handle = window.setTimeout(() => {
    trackedTimeouts.delete(handle);
    callback();
  }, delay);
  trackedTimeouts.add(handle);
  return handle;
};

const clearManagedTimeout = (handle) => {
  if (!handle && handle !== 0) return;
  if (trackedTimeouts.has(handle)) {
    clearTimeout(handle);
    trackedTimeouts.delete(handle);
  }
};

const registerInterval = (name, callback, delay, { autoStart = true } = {}) => {
  intervalStore.set(name, {
    callback,
    delay,
    id: null,
    enabled: autoStart,
    wasRunning: false,
  });
  if (autoStart) {
    startInterval(name);
  }
};

const startInterval = (name) => {
  const timer = intervalStore.get(name);
  if (!timer || !timer.enabled) return;
  if (timer.id) {
    clearInterval(timer.id);
  }
  timer.id = setInterval(timer.callback, timer.delay);
  timer.wasRunning = true;
};

const stopInterval = (name) => {
  const timer = intervalStore.get(name);
  if (timer?.id) {
    clearInterval(timer.id);
    timer.id = null;
  }
  if (timer) {
    timer.wasRunning = false;
  }
};

const setIntervalEnabled = (name, enabled) => {
  const timer = intervalStore.get(name);
  if (!timer) return;
  timer.enabled = enabled;
  if (enabled) {
    startInterval(name);
  } else {
    stopInterval(name);
  }
};

const pauseIntervals = () => {
  intervalStore.forEach((timer) => {
    if (timer.id) {
      clearInterval(timer.id);
      timer.id = null;
      timer.wasRunning = true;
    } else {
      timer.wasRunning = false;
    }
  });
};

const resumeIntervals = () => {
  intervalStore.forEach((timer, name) => {
    if (timer.enabled && timer.wasRunning) {
      startInterval(name);
    }
  });
};

const clearIntervals = () => {
  intervalStore.forEach((timer) => {
    if (timer.id) {
      clearInterval(timer.id);
      timer.id = null;
    }
    timer.wasRunning = false;
  });
};

const smoothScroll = () => {
  const triggers = document.querySelectorAll('[data-scroll]');
  if (!triggers.length) return;
  const supportsSmooth = 'scrollBehavior' in document.documentElement.style;

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      const selector = trigger.getAttribute('data-scroll');
      if (!selector) return;
      const target = document.querySelector(selector);
      if (!target) return;
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 20;
      if (supportsSmooth) {
        window.scrollTo({ top, behavior: 'smooth' });
      } else {
        window.scrollTo(0, top);
      }
      if (selector.startsWith('#')) {
        history.replaceState(null, '', selector);
      }
    });
  });
};

const setupHeroCounter = () => {
  const counter = document.querySelector('[data-active-count]');
  if (!counter) return;
  const host = counter.closest('.hero-count') || counter;

  const update = () => {
    const next = randomBetween(48, 127);
    counter.textContent = next;
    host.classList.remove('count-flash');
    void host.offsetWidth; // force reflow for animation restart
    host.classList.add('count-flash');
  };

  update();
  registerInterval('hero-count', update, 5000, { autoStart: true });
};

const setupOrchestrator = () => {
  const tabButtons = document.querySelectorAll('[data-tab]');
  const panels = document.querySelectorAll('[data-panel]');
  if (!tabButtons.length || !panels.length) return;

  const metricsCards = document.querySelectorAll('[data-metric]');
  const refreshButton = document.getElementById('refresh-metrics');
  const logStream = document.querySelector('[data-log-stream]');
  const logSamples = [
    'web-agent orchestrator tick',
    'metrics flushed to Prometheus',
    'retry budget recalculated',
    'remote log stream acknowledged',
    'CLI rehearsal completed',
    'sentinel agent issued warning',
    'docs sync succeeded',
  ];
  let activeTab = tabButtons[0].dataset.tab || 'metrics';

  const updateMetricCards = () => {
    metricsCards.forEach((card) => {
      const min = Number(card.dataset.min);
      const max = Number(card.dataset.max);
      const suffix = card.dataset.suffix || '';
      const value = randomBetween(min, max);
      card.textContent = `${value}${suffix}`;
    });
  };

  const appendLogEntry = () => {
    if (!logStream) return;
    const entry = document.createElement('li');
    const label = logSamples[randomBetween(0, logSamples.length - 1)];
    entry.textContent = label;
    const time = document.createElement('span');
    time.className = 'log-time';
    const now = new Date();
    time.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    entry.appendChild(time);
    logStream.appendChild(entry);
    if (logStream.children.length > 6) {
      logStream.removeChild(logStream.firstElementChild);
    }
  };

  registerInterval('metrics', () => {
    if (activeTab === 'metrics') {
      updateMetricCards();
    }
  }, 6000, { autoStart: true });

  registerInterval('log-stream', appendLogEntry, 4000, { autoStart: false });

  refreshButton?.addEventListener('click', () => {
    updateMetricCards();
  });

  const setActiveTab = (nextTab) => {
    activeTab = nextTab;
    tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === nextTab;
      button.setAttribute('aria-selected', String(isActive));
      button.classList.toggle('is-active', isActive);
    });
    panels.forEach((panel) => {
      const isActive = panel.dataset.panel === nextTab;
      panel.toggleAttribute('hidden', !isActive);
      panel.setAttribute('aria-hidden', String(!isActive));
    });

    if (nextTab === 'metrics') {
      setIntervalEnabled('log-stream', false);
      updateMetricCards();
    } else if (nextTab === 'logs') {
      appendLogEntry();
      setIntervalEnabled('log-stream', true);
    }
  };

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextTab = button.dataset.tab;
      if (!nextTab || nextTab === activeTab) return;
      setActiveTab(nextTab);
    });
  });

  setActiveTab(activeTab);
};

const setupToasts = () => {
  const buttons = document.querySelectorAll('[data-toast]');
  if (!buttons.length) return;

  toastContainer = document.createElement('div');
  toastContainer.className = 'toast-stack';
  document.body.appendChild(toastContainer);

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.toast;
      const message = button.dataset.toastMessage || button.textContent?.trim();
      if (!id || !message) return;
      if (toastRegistry.has(id)) return;

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      toastContainer.appendChild(toast);

      requestAnimationFrame(() => toast.classList.add('visible'));

      const hideTimeout = setManagedTimeout(() => {
        toast.classList.remove('visible');
        const removeTimeout = setManagedTimeout(() => {
          toast.remove();
          toastRegistry.delete(id);
        }, 220);
        const entry = toastRegistry.get(id);
        if (entry) {
          entry.removeTimeout = removeTimeout;
        }
      }, 3000);

      toastRegistry.set(id, { toast, hideTimeout });
    });
  });
};

const setupTimelineReveal = () => {
  const items = document.querySelectorAll('.timeline-item');
  if (!items.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    items.forEach((item) => observer.observe(item));

    window.addEventListener('beforeunload', () => observer.disconnect(), { once: true });
  } else {
    items.forEach((item) => item.classList.add('visible'));
  }
};

const setupAccordion = () => {
  const triggers = document.querySelectorAll('[data-accordion]');
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    const panelId = trigger.getAttribute('aria-controls');
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      panel.style.maxHeight = `${panel.scrollHeight}px`;
      panel.classList.add('open');
    }

    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const nextState = !expanded;
      trigger.setAttribute('aria-expanded', String(nextState));
      if (nextState) {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
        panel.classList.add('open');
      } else {
        panel.style.maxHeight = '0px';
        panel.classList.remove('open');
      }
    });
  });
};

const setupVisibilityGuards = () => {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseIntervals();
    } else {
      resumeIntervals();
    }
  });

  let didCleanup = false;
  const cleanup = () => {
    if (didCleanup) return;
    didCleanup = true;
    clearIntervals();
    trackedTimeouts.forEach((handle) => clearTimeout(handle));
    trackedTimeouts.clear();
    toastRegistry.forEach((entry) => {
      if (entry.hideTimeout) {
        clearManagedTimeout(entry.hideTimeout);
      }
      if (entry.removeTimeout) {
        clearManagedTimeout(entry.removeTimeout);
      }
      entry.toast.remove();
    });
    toastRegistry.clear();
    toastContainer?.remove();
  };

  window.addEventListener('beforeunload', cleanup, { once: true });
  window.addEventListener('unload', cleanup, { once: true });
};

smoothScroll();
setupHeroCounter();
setupOrchestrator();
setupToasts();
setupTimelineReveal();
setupAccordion();
setupVisibilityGuards();
