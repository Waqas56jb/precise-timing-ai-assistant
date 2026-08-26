import { verifyAdminPassword } from '../src/services/adminUsers.js';
import { signAdminToken, verifyAdminToken } from '../src/middleware/adminAuth.js';

const user = await verifyAdminPassword('admin@gmail.com', 'admin@123!');
if (!user) {
  console.error('LOGIN FAIL');
  process.exit(1);
}
const token = signAdminToken(user);
const parsed = verifyAdminToken(token);
console.log('login ok', user.email, parsed.email);
process.exit(0);
