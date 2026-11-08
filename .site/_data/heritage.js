const { load, slugify } = require('../plugins/vault');

const BRANCH_COLORS = {
  'The Danger Zone': 'rust',
  'The Chemical Wedding': 'sky',
  'The Pluriversity': 'sun',
  'The Broken Tower': 'leaf'
};

module.exports = () => {
  const v = load();
  const notes = v.notes.filter(n => n.folder.startsWith('heritage') && n.data.heritage_type);

  const branches = notes
    .filter(n => n.data.heritage_type === 'branch')
    .map(n => ({
      id: slugify(n.data.branch),
      title: n.data.branch,
      sub_branches: n.data.sub_branches || [],
      color: BRANCH_COLORS[n.data.branch] || 'mute',
      url: n.url,
      level: n.data.level || 1
    }));

  const clusters = notes
    .filter(n => n.data.heritage_type === 'cluster')
    .map(n => ({
      id: slugify(n.data.sub_branch),
      title: n.data.sub_branch,
      branch: n.data.branch,
      color: BRANCH_COLORS[n.data.branch] || 'mute',
      thinkers: (n.data.thinkers || []).map(slugify),
      url: n.url,
      level: n.data.level || 2
    }));

  const thinkers = notes
    .filter(n => n.data.heritage_type === 'person')
    .map(n => ({
      id: slugify(n.title),
      title: n.data.title,
      profession: n.data.profession || '',
      branches: (n.data.branches || []).map(b => ({
        branch: b.branch,
        sub_branch: b.sub_branch
      })),
      profession: n.data.profession || '',
      short_hook: n.data.short_hook || '',
      nominated_by: n.data.nominated_by || [],
      status: n.data.status || 'candidate',
      url: n.url,
      level: n.data.level || 3
    }));

  return { branches, clusters, thinkers };
};