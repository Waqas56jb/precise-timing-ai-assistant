import { seedDefaultAdmin } from '../src/services/adminUsers.js';

const admin = await seedDefaultAdmin();
console.log('created/updated', admin.email, admin.id);
process.exit(0);
