import { Router } from 'express';
import { listQuotes } from '../services/quotes.js';
import { query } from '../lib/db.js';
import { T } from '../db/tables.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const quotes = await listQuotes({ limit });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(`SELECT * FROM ${T.quotes} WHERE id = $1`, [
      req.params.id,
    ]);
    if (!rows[0]) return res.status(404).json({ error: 'Quote not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
