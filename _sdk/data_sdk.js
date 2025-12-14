(() => {
  const STORAGE_KEY = 'ccs_data';
  let handler = null;
  let data = [];

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      data = raw ? JSON.parse(raw) : [];
    } catch (_) { data = []; }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
  }
  function notify() {
    if (handler && typeof handler.onDataChanged === 'function') {
      handler.onDataChanged([...data]);
    }
  }

  const api = {
    async init(h) {
      handler = h;
      load();
      notify();
      return { isOk: true };
    },
    async create(item) {
      data.push(item);
      save();
      notify();
      return { isOk: true };
    },
    async update(predicate, updater) {
      let updated = false;
      data = data.map(x => {
        if (predicate(x)) { updated = true; return updater(x); }
        return x;
      });
      if (updated) { save(); notify(); }
      return { isOk: updated };
    },
    async delete(predicate) {
      const before = data.length;
      data = data.filter(x => !predicate(x));
      const changed = data.length !== before;
      if (changed) { save(); notify(); }
      return { isOk: changed };
    },
    async getAll() { return { isOk: true, data: [...data] }; }
  };

  window.dataSdk = api;
})();