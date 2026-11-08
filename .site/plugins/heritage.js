// Builds the heritage tree data from notes in heritage/. One source of truth:
//   person notes  -> `branches: [{branch, sub_branch}]` (first entry is the home sub-branch)
//   cluster notes -> a sub-branch and the branch it sits under
//   branch notes  -> a branch
// Membership is derived from the person notes only. Nothing lists thinkers twice.
const { load, slugify } = require('./vault');

const BRANCH_COLORS = {
  'The Danger Zone': 'rust',
  'The Chemical Wedding': 'sky',
  'The Pluriversity': 'sun',
  'The Broken Tower': 'leaf'
};

function build() {
  const v = load();
  const errors = [];
  const notes = v.notes.filter(n => n.folder.startsWith('heritage') && n.data.heritage_type);

  const branches = notes.filter(n => n.data.heritage_type === 'branch').map(n => ({
    id: slugify(n.data.branch), title: n.data.branch, color: BRANCH_COLORS[n.data.branch] || 'mute', url: n.url
  }));
  const branchTitles = new Set(branches.map(b => b.title));

  const clusters = notes.filter(n => n.data.heritage_type === 'cluster').map(n => ({
    id: slugify(n.data.sub_branch), title: n.data.sub_branch, branch: n.data.branch,
    color: BRANCH_COLORS[n.data.branch] || 'mute', url: n.url
  }));
  const clusterById = new Map(clusters.map(c => [c.id, c]));

  const thinkers = notes.filter(n => n.data.heritage_type === 'person').map(n => ({
    id: n.slug,
    title: n.data.title || n.title,
    profession: n.data.profession || '',
    branches: (n.data.branches || []).map(b => ({ branch: b.branch, sub_branch: b.sub_branch })),
    short_hook: n.data.short_hook || '',
    nominated_by: n.data.nominated_by || [],
    status: n.data.status || 'candidate',
    url: n.url
  }));

  // derived, never hand-written
  clusters.forEach(c => { c.thinkers = thinkers.filter(t => t.branches.some(b => slugify(b.sub_branch) === c.id)).map(t => t.id); });
  branches.forEach(b => { b.sub_branches = clusters.filter(c => c.branch === b.title).map(c => c.title); });

  // validation
  const seen = new Set();
  clusters.forEach(c => { if (!branchTitles.has(c.branch)) errors.push(`cluster "${c.title}" sits under unknown branch "${c.branch}"`); });
  thinkers.forEach(t => {
    if (seen.has(t.id)) errors.push(`duplicate thinker id "${t.id}"`);
    seen.add(t.id);
    if (!t.branches.length) errors.push(`${t.title}: no branches listed`);
    if (!t.profession) errors.push(`${t.title}: no profession`);
    t.branches.forEach(b => {
      const c = clusterById.get(slugify(b.sub_branch));
      if (!c) errors.push(`${t.title}: unknown sub-branch "${b.sub_branch}"`);
      else if (c.branch !== b.branch) errors.push(`${t.title}: "${b.sub_branch}" belongs to "${c.branch}", not "${b.branch}"`);
    });
  });
  clusters.forEach(c => { if (!c.thinkers.length) errors.push(`sub-branch "${c.title}" has no thinkers`); });

  return { branches, clusters, thinkers, errors };
}

module.exports = { build, BRANCH_COLORS };
