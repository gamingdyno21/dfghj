require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const { ensureDatabase } = require('../srcconfig/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Root handled by static index.html

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/publiccss', express.static(path.join(__dirname, '..', 'publiccss')));
app.use('/publicjs', express.static(path.join(__dirname, '..', 'publicjs')));
app.use('/_sdk', express.static(path.join(__dirname, '..', '_sdk')));

(async () => {
  try {
    await ensureDatabase();
  } catch (e) {
    console.error(e);
  }

  const reportsRouter = require('../srcroutes/reports');
  const companiesRouter = require('../srcroutes/companies');
  const creditsRouter = require('../srcroutes/credits');
  const transactionsRouter = require('../srcroutes/transactions');
  const penaltiesRouter = require('../srcroutes/penalties');

  app.use('/api/reports', reportsRouter);
  app.use('/api/companies', companiesRouter);
  app.use('/api/credits', creditsRouter);
  app.use('/api/transactions', transactionsRouter);
  app.use('/api/penalties', penaltiesRouter);

  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'OK' });
  });

  app.use('/api', (req, res) => {
    res.status(404).json({ success: false, error: { message: 'Not Found', code: 'NOT_FOUND' } });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
      success: false,
      error: { message: err.message || 'Server error', code: err.code || 'SERVER_ERROR' }
    });
  });

  async function start() {
    const base = Number(PORT);
    let p = base;
    while (p < base + 10) {
      try {
        await new Promise((resolve, reject) => {
          const s = app.listen(p, () => { console.log(`Server listening on http://localhost:${p}`); resolve(); });
          s.on('error', reject);
        });
        break;
      } catch (e) {
        if (e.code === 'EADDRINUSE') { p++; continue; }
        throw e;
      }
    }
  }
  start();
})();
