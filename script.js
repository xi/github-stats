var table = document.querySelector('table');

var setValue = function(name, value) {
	document.getElementsByName(name)[0].value = value;
};

var setBusy = function(busy) {
	var btn = document.querySelector('button');
	btn.disabled = busy;
	btn.textContent = busy ? 'Loading…' : 'Get stats!';
};

var getDuration = function(x) {
	var created_at = (new Date(x.created_at)).getTime();
	var closed_at = (new Date(x.closed_at)).getTime();
	return (closed_at - created_at) / 1000 / 60 / 60 / 24;
};

var getAverage = function(data) {
	var duration = data.reduce((a, b) => a + getDuration(b), 0);
	return duration / data.length;
};

var addRow = function([lang, bytes]) {
	var tr = document.createElement('tr');
	table.append(tr);

	var th = document.createElement('th');
	th.textContent = lang;
	tr.append(th);

	var td = document.createElement('td');
	td.textContent = bytes;
	tr.append(td);

	var td = document.createElement('td');
	td.textContent = Math.round(bytes / 40);
	tr.append(td);
};

var search = new URLSearchParams(location.search);
var repo = search.get('repo');
if (repo) {
	setValue('repo', repo);
	setBusy(true);
	Promise.all([
		fetch(`https://api.github.com/repos/${repo}/issues?per_page=100&state=closed`).then(r => r.json()),
		fetch(`https://api.github.com/repos/${repo}/languages`).then(r => r.json()),
	]).then(data => {
		setBusy(false);

		var pulls = data[0].filter(x => x.pull_request);
		setValue('pulls', getAverage(pulls))

		var issues = data[0].filter(x => !x.pull_request);
		setValue('issues', getAverage(issues))

		Object.entries(data[1]).forEach(addRow);
	});
}
