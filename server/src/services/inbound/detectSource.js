/**
 * Detect whether an inbound email is from Yelp, Thumbtack, or unknown.
 *
 * Yelp decision (Aug 24): only trust senders from *@yelp.com for source=yelp
 * (inbox: precisetimingtransports@gmail.com).
 */
export function detectLeadEmailSource({ from = '', subject = '', text = '' } = {}) {
  const fromL = String(from).toLowerCase();
  const subjectL = String(subject).toLowerCase();
  const textL = String(text).toLowerCase().slice(0, 4000);
  const blob = `${subjectL}\n${textL}`;

  // Strict: Yelp notification mail must come from yelp.com
  const fromYelp = /@([a-z0-9.-]*\.)?yelp\.com\b/i.test(fromL);
  if (fromYelp) return 'yelp';

  // Soft fallback only if body clearly Yelp lead mail (forwarded)
  const yelpBodyHints = [
    'biz.yelp.com',
    'new message from a yelp',
    'yelp messaging',
    'request a quote on yelp',
    'view this lead on yelp',
  ];
  if (yelpBodyHints.some((h) => blob.includes(h))) return 'yelp';

  const fromThumbtack = /@([a-z0-9.-]*\.)?thumbtack\.com\b/i.test(fromL);
  if (fromThumbtack) return 'thumbtack';

  const thumbtackHints = [
    'thumbtack.com',
    'new lead from thumbtack',
    'thumbtack lead',
  ];
  if (thumbtackHints.some((h) => blob.includes(h))) return 'thumbtack';

  return null;
}
