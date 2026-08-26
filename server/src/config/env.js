import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const isVercel = Boolean(process.env.VERCEL);

const schema = z.object({
  PORT: z.coerce.number().default(3001),
  // Optional so chat/leads can boot on Vercel even before QB is configured
  QB_CLIENT_ID: z.string().optional().default(''),
  QB_CLIENT_SECRET: z.string().optional().default(''),
  QB_REDIRECT_URI: z
    .string()
    .url()
    .default('http://localhost:3001/api/quickbooks/callback'),
  QB_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  QB_SCOPES: z.string().default('com.intuit.quickbooks.accounting'),
  OPENAI_API_KEY: z.string().optional(),
  SUPABASE_URL: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().url().optional()
  ),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  DATABASE_URL: z.string().optional().default(''),
  DATABASE_POOLER_URL: z.string().optional().default(''),
  EMAIL_USER: z.string().optional().default(''),
  EMAIL_APP_PASSWORD: z.string().optional().default(''),
  EMAIL_NOTIFY_TO: z.string().optional().default(''),
  ADMIN_SECRET: z.string().optional().default(''),
  IMAP_HOST: z.string().optional().default('imap.gmail.com'),
  IMAP_PORT: z.coerce.number().default(993),
  IMAP_USER: z.string().optional().default(''),
  IMAP_PASSWORD: z.string().optional().default(''),
  IMAP_MAILBOX: z.string().optional().default('INBOX'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment:', parsed.error.flatten().fieldErrors);
  // process.exit kills the entire Vercel serverless function before it can respond
  if (!isVercel) {
    process.exit(1);
  }
  throw new Error(
    `Invalid environment: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`
  );
}

export const env = parsed.data;

export const qbApiBase =
  env.QB_ENVIRONMENT === 'production'
    ? 'https://quickbooks.api.intuit.com'
    : 'https://sandbox-quickbooks.api.intuit.com';

export const qbAuthBase = 'https://appcenter.intuit.com/connect/oauth2';
export const qbTokenUrl =
  'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
