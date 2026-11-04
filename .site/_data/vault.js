const { load } = require('../plugins/vault');
module.exports = () => {
  const v = load();
  const pick = n => ({ title: n.title, url: n.url, rel: n.rel, type: n.data.type, summary: n.data.summary || '', stage: n.data.stage || 'seedling', status: n.data.status || 'working',
    start: n.data.start || '', period: n.data.period || '', featured: !!n.data.featured, role: n.data.role || '', tags: n.data.tags || [], why: n.data.why_it_matters || '', kind: n.data.kind || '', who: n.data.who || '', sourceUrl: n.data.source_url || '', needsUrl: (n.data.tags || []).includes('needs-url'), data: n.data });
  const of = t => v.notes.filter(n => n.data.type === t).map(pick);
  const byStartDesc = (a, b) => String(b.start).localeCompare(String(a.start));
  return {
    work: of('work').sort(byStartDesc), featured: v.notes.filter(n => n.data.featured).map(pick).sort(byStartDesc),
    people: of('person'), offers: of('offer'), models: of('model'), places: of('place'), concepts: of('concept'), essays: of('essay'), sources: of('source'),
    counts: { notes: v.notes.length, sources: v.notes.filter(n => n.data.type === 'source').length, needsUrl: v.notes.filter(n => n.data.type === 'source' && (n.data.tags || []).includes('needs-url')).length },
    missing: v.missing
  };
};
