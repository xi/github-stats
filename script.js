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

var search = new URLSearchParams(location.search);
var repo = search.get('repo');
if (repo) {
	setValue('repo', repo);
	setBusy(true);
	fetch(`https://api.github.com/repos/${repo}/issues?per_page=100&state=closed`)
		.then(r => r.json())
		.then(data => {
			setBusy(false);

			var pulls = data.filter(x => x.pull_request);
			setValue('pulls', getAverage(pulls))

			var issues = data.filter(x => !x.pull_request);
			setValue('issues', getAverage(issues))
		});
}
