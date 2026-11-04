/* Palette switcher. Palettes live in .site/_data/palettes.json and are inlined into every page. */
(function () {
  var data = JSON.parse(document.getElementById('palettes-data').textContent);
  var list = data.palettes, host = document.getElementById('pal');
  var byId = function (id) { return list.filter(function (p) { return p.id === id; })[0]; };
  function current() { return byId(document.documentElement.getAttribute('data-palette')) || byId(data.default); }
  function swatch(p) { var u = p.ui; return '<span class="sw" aria-hidden="true">' + [u.paper, u.green, u.sun, u.sky, u.rust].map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span>'; }
  function set(id) {
    var p = byId(id) || byId(data.default);
    document.documentElement.setAttribute('data-palette', p.id);
    try { localStorage.setItem('lab-palette', p.id); } catch (e) {}
    render();
    window.dispatchEvent(new CustomEvent('palettechange', { detail: p }));
  }
  function render() {
    var cur = current();
    host.innerHTML = '<button type="button" aria-haspopup="true" aria-expanded="false" id="palBtn">' + swatch(cur) + '<span>' + cur.name + '</span></button>' +
      '<div class="pal-menu" role="radiogroup" aria-label="Colour palette">' + list.map(function (p) {
        return '<button type="button" role="radio" aria-checked="' + (p.id === cur.id) + '" data-id="' + p.id + '">' + swatch(p) + '<b>' + p.name + (p.id === data.default ? '<span class="rec">default</span>' : '') + '</b><small>' + p.audience + '. ' + p.why + '</small></button>';
      }).join('') + '</div>';
    var btn = host.querySelector('#palBtn'), menu = host.querySelector('.pal-menu');
    btn.onclick = function (e) { e.stopPropagation(); var o = menu.classList.toggle('open'); btn.setAttribute('aria-expanded', o); if (o) { var c = menu.querySelector('[aria-checked=true]'); c && c.focus(); } };
    menu.onclick = function (e) { var b = e.target.closest('button[data-id]'); if (b) { set(b.getAttribute('data-id')); } };
    menu.onkeydown = function (e) { if (e.key === 'Escape') { menu.classList.remove('open'); btn.focus(); } };
  }
  document.addEventListener('click', function () { var m = host.querySelector('.pal-menu'); if (m) m.classList.remove('open'); });
  window.LabPalette = { current: current, set: set, all: list };
  render();
  window.dispatchEvent(new CustomEvent('palettechange', { detail: current() }));
})();
