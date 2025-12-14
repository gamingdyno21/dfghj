(() => {
  const CONFIG_KEY = 'ccs_config';
  let config = {};
  let cfg = null;

  function load() {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      cfg = raw ? JSON.parse(raw) : {};
    } catch (_) { cfg = {}; }
  }
  function save() {
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)); } catch (_) {}
  }

  const api = {
    async init(conf) {
      config = conf || {};
      load();
      if (config.onConfigChange) await config.onConfigChange({ ...config.defaultConfig, ...cfg });
      return { isOk: true };
    },
    async set(newCfg) {
      cfg = { ...cfg, ...newCfg };
      save();
      if (config.onConfigChange) await config.onConfigChange({ ...config.defaultConfig, ...cfg });
      return { isOk: true };
    },
    async get() { return { isOk: true, config: { ...config.defaultConfig, ...cfg } }; }
  };

  window.elementSdk = api;
})();