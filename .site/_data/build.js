// changes on every build; appended to CSS and JS URLs so browsers never run a stale script against new HTML
module.exports = Date.now().toString(36);
