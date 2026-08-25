import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { upsertExternalLead } from '../services/leads.js';
import { sendContactFormEmail } from '../services/mailer.js';

const router = Router();

const MAX_FILES = 5;
const MAX_FILE_BYTES = 4 * 1024 * 1024; // Vercel caps request bodies at ~4.5 MB

const ALLOWED_MIME = new Set([
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images, PDF, Word, and text files are allowed'));
    }
  },
});

function handleUpload(req, res, next) {
  upload.array('files', MAX_FILES)(req, res, (err) => {
    if (err) {
      const msg =
        err.code === 'LIMIT_FILE_SIZE'
          ? 'Each file must be under 4 MB'
          : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE'
            ? `You can attach up to ${MAX_FILES} files`
            : err.message || 'File upload failed';
      return res.status(400).json({ error: msg });
    }
    next();
  });
}

const contactSchema = z.object({
  name: z.string().trim().max(200).optional().default(''),
  service: z.string().trim().min(1, 'Service is required').max(200),
  email: z.string().trim().email('A valid email is required').max(320),
  phone: z.string().trim().max(50).optional().default(''),
  pickup: z.string().trim().max(500).optional().default(''),
  dropoff: z.string().trim().max(500).optional().default(''),
  stairs: z.string().trim().max(50).optional().default(''),
  date: z.string().trim().max(50).optional().default(''),
  details: z.string().trim().max(5000).optional().default(''),
});

/** POST /api/contact — website "Request a FREE Quote" form (JSON or multipart with files). */
router.post('/', handleUpload, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body || {});
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return res.status(400).json({ error: first?.message || 'Invalid form data' });
  }
  const form = parsed.data;

  const attachments = (req.files || []).map((f) => ({
    filename: f.originalname,
    content: f.buffer,
    contentType: f.mimetype,
    size: f.size,
  }));

  const notesParts = [];
  if (form.stairs) notesParts.push(`Flights of stairs: ${form.stairs}`);
  if (form.details) notesParts.push(form.details);
  if (attachments.length) {
    notesParts.push(`Attachments: ${attachments.map((a) => a.filename).join(', ')}`);
  }

  // Persist the lead first so nothing is lost even if the email fails.
  let lead = null;
  try {
    const result = await upsertExternalLead({
      source: 'website_form',
      name: form.name || null,
      phone: form.phone || null,
      email: form.email,
      pickup_address: form.pickup || null,
      dropoff_address: form.dropoff || null,
      move_date: form.date || null,
      notes: notesParts.join('\n') || null,
      metadata: {
        service: form.service,
        stairs: form.stairs || null,
        attachments: attachments.map((a) => a.filename),
        submitted_at: new Date().toISOString(),
      },
    });
    lead = result.lead;
  } catch (err) {
    console.error('Contact form: lead save failed:', err.message);
  }

  try {
    // Await so the email is guaranteed to go out before the serverless
    // function is frozen (Vercel).
    await sendContactFormEmail(form, attachments);
  } catch (err) {
    console.error('Contact form: email send failed:', err.message);
    if (!lead) {
      return res.status(502).json({ error: 'Could not deliver your request. Please try again or email us directly.' });
    }
  }

  return res.json({ ok: true, leadId: lead?.id ?? null });
});

export default router;
