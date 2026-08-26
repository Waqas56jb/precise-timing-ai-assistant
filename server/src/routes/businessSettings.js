import { Router } from 'express';
import { ZodError } from 'zod';
import { requireAdmin } from '../middleware/adminAuth.js';
import {
  getBusinessSettings,
  getPublicBusinessSettings,
  updateBusinessSettings,
} from '../services/businessSettings.js';

const router = Router();

router.get('/public', async (_req, res) => {
  try {
    const settings = await getPublicBusinessSettings();
    if (!settings) {
      return res.status(404).json({ error: 'Business settings not found' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', requireAdmin, async (_req, res) => {
  try {
    const settings = await getBusinessSettings();
    if (!settings) {
      return res.status(404).json({ error: 'Business settings not found' });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', requireAdmin, async (req, res) => {
  try {
    const settings = await updateBusinessSettings(req.body);
    res.json(settings);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
