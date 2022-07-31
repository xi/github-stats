var table = document.querySelector('table');

var setValue = function(name, value) {
	document.getElementsByName(name)[0].value = value;
};

var setBusy = function(busy) {
	document.querySelector('button').disabled = busy;
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

var addRow = function(row) {
	var tr = document.createElement('tr');
	table.append(tr);

	var th = document.createElement('th');
	th.textContent = row.language;
	tr.append(th);

	['files', 'lines', 'blanks', 'comments', 'linesOfCode'].forEach(key => {
		var td = document.createElement('td');
		td.textContent = row[key];
		tr.append(td);
	});
};

var search = new URLSearchParams(location.search);
var repo = search.get('repo');
if (repo) {
	setValue('repo', repo);
	setBusy(true);
	Promise.all([
		fetch(`https://api.github.com/repos/${repo}/issues?per_page=100&state=closed`).then(r => r.json()),
		fetch(`https://api.codetabs.com/v1/loc/?github=${repo}`).then(r => r.json()),
	]).then(data => {
		setBusy(false);

		var pulls = data[0].filter(x => x.pull_request);
		setValue('pulls', getAverage(pulls))

		var issues = data[0].filter(x => !x.pull_request);
		setValue('issues', getAverage(issues))

		data[1].forEach(addRow);
	});
}
