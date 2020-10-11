var styles = JSON.parse('{"default":{"text":"{{value}}"}}');

function loadjsonstyle()
{
	var selectedFile = document.getElementById("jsonstyle").files[0];
	if(selectedFile == null) return;

	var reader = new FileReader();
	reader.readAsText(selectedFile);

	reader.onload = function(evt)
	{
		styles = JSON.parse(evt.target.result);
	};
}