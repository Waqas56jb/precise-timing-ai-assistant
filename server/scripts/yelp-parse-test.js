import { parseYelpLead } from '../src/services/yelp/parseLead.js';
import { detectLeadEmailSource } from '../src/services/inbound/detectSource.js';

const sample = {
  subject: 'New message from a Yelp customer',
  text: `Customer name: Jamie Customer
Service type: Local moving
Zip: 45251
Dates requested: Aug 30 - Sep 2
Details: Need help moving a 2 bedroom apartment. Stairs.
Status: New
Lead ID: YL-45251-001`,
};

const from = 'Yelp <noreply@reply.yelp.com>';
console.log('detect:', detectLeadEmailSource({ from, ...sample }));
console.log(JSON.stringify(parseYelpLead(sample), null, 2));
