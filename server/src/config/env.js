import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  PORT: z.coerce.number().default(3001),
  QB_CLIENT_ID: z.string().min(1, 'QB_CLIENT_ID is required'),
  QB_CLIENT_SECRET: z.string().min(1, 'QB_CLIENT_SECRET is required'),
  QB_REDIRECT_URI: z
    .string()
    .url()
    .default('http://localhost:3001/api/quickbooks/callback'),
  QB_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  QB_SCOPES: z
    .string()
    .default('com.intuit.quickbooks.accounting'),
  OPENAI_API_KEY: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  DATABASE_POOLER_URL: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export const qbApiBase =
  env.QB_ENVIRONMENT === 'production'
    ? 'https://quickbooks.api.intuit.com'
    : 'https://sandbox-quickbooks.api.intuit.com';

export const qbAuthBase = 'https://appcenter.intuit.com/connect/oauth2';
export const qbTokenUrl =
  'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
