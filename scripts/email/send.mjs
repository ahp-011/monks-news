// Sends the morning email built by build.mjs, with the page-flip GIF attached inline.
//   node scripts/email/send.mjs --dir email-out --gif flip.gif [--to a@x.com,b@y.com]
// Env: MAIL_FROM (default aman@designmonks.co), MAIL_USER (defaults to MAIL_FROM), MAIL_APP_PASSWORD,
//      MAIL_TO (comma or newline separated list; the team), MAIL_HOST/MAIL_PORT (default Gmail SMTP).
// Each person gets their own copy (no one sees the others' addresses).
import { readFileSync } from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const dir = arg('dir', 'email-out'), gif = arg('gif');
const from = process.env.MAIL_FROM || 'aman@designmonks.co';
const user = process.env.MAIL_USER || from;
const pass = process.env.MAIL_APP_PASSWORD;
const list = (arg('to') || process.env.MAIL_TO || '').split(/[\s,;]+/).map((s) => s.trim()).filter((s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s));

if (!pass) { console.log('MAIL_APP_PASSWORD is not set; skipping the email.'); process.exit(0); }
if (!list.length) { console.log('MAIL_TO is empty; skipping the email.'); process.exit(0); }

const html = readFileSync(path.join(dir, 'email.html'), 'utf8');
const text = readFileSync(path.join(dir, 'email.txt'), 'utf8');
const subject = readFileSync(path.join(dir, 'subject.txt'), 'utf8').trim();
const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com', port: +(process.env.MAIL_PORT || 465), secure: true,
  auth: { user, pass }, pool: true, maxConnections: 2, rateDelta: 1000, rateLimit: 3,
});
await transport.verify();

let sent = 0, failed = 0;
for (const to of list) {
  try {
    await transport.sendMail({
      from: { name: 'DM Bytes', address: from }, to, subject, html, text,
      headers: { 'List-Unsubscribe': `<mailto:${from}?subject=Unsubscribe%20DM%20Bytes>` },
      attachments: gif ? [{ filename: 'dm-bytes-paper.gif', path: gif, cid: 'att0', contentDisposition: 'inline' }] : [],
    });
    sent++;
  } catch (e) { failed++; console.error(`could not send to one recipient: ${e.message}`); }
}
transport.close();
console.log(`sent ${sent} of ${list.length}${failed ? `, ${failed} failed` : ''}, from ${from}`);
if (!sent) process.exit(1);
