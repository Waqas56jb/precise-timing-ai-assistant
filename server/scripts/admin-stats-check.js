import { getLeadStats, listLeads } from '../src/services/leads.js';
import { getAdminSecret } from '../src/middleware/adminAuth.js';
import { isEmailWorkerConfigured } from '../src/services/inbound/emailWorker.js';

console.log('admin', Boolean(getAdminSecret()));
console.log('imap', isEmailWorkerConfigured());
const stats = await getLeadStats();
console.log('stats', JSON.stringify(stats));
const leads = await listLeads({ limit: 3 });
console.log('sample sources', leads.map((l) => l.source));
process.exit(0);
