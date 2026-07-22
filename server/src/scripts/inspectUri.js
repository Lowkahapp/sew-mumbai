import fs from 'fs';

const t = fs.readFileSync(new URL('../../.env', import.meta.url), 'utf8');
const m = t.match(/^MONGODB_URI=(.*)$/m);
if (!m) {
  console.log('NO_URI_LINE');
  process.exit(0);
}
const u = m[1].trim();
console.log(
  JSON.stringify({
    has_placeholder: /<db_password>|<password>/.test(u),
    starts_srv: u.startsWith('mongodb+srv://'),
    has_user: u.includes('sewmumbai:'),
    host: (u.match(/@([^/?]+)/) || [])[1] || 'none',
    dbPath: (u.match(/\.net\/([^?]+)/) || [])[1] || '(default)',
    length: u.length,
    bom: t.charCodeAt(0) === 0xfeff,
  })
);
