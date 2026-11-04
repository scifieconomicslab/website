// Parses ticker/cast.md, ticker/rules.md, ticker/templates.md so the ticker's voice is edited as Markdown.
const fs = require('fs'); const path = require('path');
const { ROOT } = require('../plugins/vault');
const read = f => fs.readFileSync(path.join(ROOT, 'ticker', f), 'utf8');
const sections = text => { const out = {}; let cur = null; for (const line of text.split('\n')) { const m = /^##\s+(.+)/.exec(line); if (m) { cur = m[1].trim(); out[cur] = []; } else if (cur) out[cur].push(line); } return out; };
const table = lines => { const rows = lines.filter(l => l.trim().startsWith('|')).map(l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())); if (rows.length < 2) return []; const head = rows[0].map(h => h.toLowerCase().replace(/[^a-z]+/g, '_')); return rows.slice(2).map(r => Object.fromEntries(head.map((h, i) => [h, r[i] || '']))); };
module.exports = () => {
  const cast = sections(read('cast.md')), rules = table(read('rules.md').split('\n')), tpl = sections(read('templates.md'));
  const firms = table(cast.Firms || []).map(r => ({ name: r.firm, sector: r.sector, wx: +r.export, wl: +r.local, ww: +r.weather, ws: +r.service, key: r.service_key || 'none' }));
  const residents = table(cast.Residents || []).map(r => ({ name: r.resident, role: r.role, cares: r.cares_about }));
  const templates = {}; for (const [k, lines] of Object.entries(tpl)) templates[k] = lines.filter(l => /^\s*[-*]\s+/.test(l)).map(l => l.replace(/^\s*[-*]\s+/, '').trim());
  const ruleMap = {}; for (const r of rules) ruleMap[r.id] = { channel: r.channel, cooldown: +r.cooldown, priority: +r.priority };
  return { firms, residents, templates, rules: ruleMap };
};
