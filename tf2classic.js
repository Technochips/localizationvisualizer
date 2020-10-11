var request = new XMLHttpRequest();
request.open('GET', 'tf2classic.json', true);

request.onload = function() {
	if (this.status >= 200 && this.status < 400)
	{
		console.log("downloaded json");
		styles = JSON.parse(this.response);
	}
};

request.send();
