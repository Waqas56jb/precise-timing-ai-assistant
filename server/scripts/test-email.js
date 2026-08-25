// One-off smoke test: sends both notification templates to EMAIL_NOTIFY_TO.
// Run: node scripts/test-email.js
import { sendContactFormEmail, sendChatbotLeadEmail } from '../src/services/mailer.js';

const form = {
  name: 'TEST — John Carter',
  service: 'Moving',
  email: 'john.carter.test@example.com',
  phone: '(513) 555-0142',
  pickup: '123 Main St, Cincinnati, OH 45202',
  dropoff: '456 Oak Ave, Mason, OH 45040',
  stairs: '2',
  date: '2026-09-05',
  details: 'TEST EMAIL — please ignore. 2-bedroom apartment, one couch, a fridge, ~20 boxes.',
};

const lead = {
  id: '00000000-0000-0000-0000-000000000000',
  name: 'TEST — Sarah Miller',
  phone: '+15135550187',
  email: 'sarah.miller.test@example.com',
  pickup_address: '789 Elm St, Blue Ash, OH 45242',
  dropoff_address: '321 Pine Rd, Fairfield, OH 45014',
  move_date: 'Next Saturday',
  move_size: '1-bedroom',
  notes: 'TEST EMAIL — please ignore.',
  metadata: { intentType: 'moving_quote' },
};

const transcript = [
  { role: 'user', content: 'Hi, I need help moving a 1-bedroom apartment next Saturday.' },
  { role: 'assistant', content: 'We can definitely help! Full service moving starts at $140/hour with two movers and a truck. Could I get your name and phone number?' },
  { role: 'user', content: "I'm Sarah Miller, 513-555-0187. Moving from Blue Ash to Fairfield." },
  { role: 'assistant', content: 'Thanks Sarah! I have your details — our team will text you shortly to confirm your quote.' },
];

console.log('Sending contact-form test email…');
console.log(await sendContactFormEmail(form));

console.log('Sending chatbot-lead test email…');
console.log(await sendChatbotLeadEmail({ lead, transcript, isUpdate: false }));

console.log('Done — check the inbox.');
