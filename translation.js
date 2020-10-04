var list = [];
var listOrder = [];
var lang;

function loadtranslation()
{
	var selectedFile = document.getElementById("translation").files[0];
	if(selectedFile == null) return;

	emptylist();

	lang = selectedFile.name.match(/(?<=_)(.*?)(?=\.)/)[0];

	var reader = new FileReader();
	reader.readAsText(selectedFile);

	reader.onload = load;
}

function load(evt)
{
	var fileString = evt.target.result;
	
	var start = 2;
	var quote = false;
	var isValue = false;
	var comment = false;

	var key = ""
	var value = "";

	for(var pointer = 0; pointer < fileString.length; pointer++)
	{
		var char = fileString[pointer];
		if(start > 0)
		{
			if(char == "{") start--;
			continue;
		}
		else if(start < 0) break;
		if(comment)
		{
			if(char == "\n") comment = false;
			continue;
		}
		if(!quote)
		{
			switch(char)
			{
				case "}":
					start = -1;
					break;
				case "/":
					if(fileString[pointer+1] == "/") comment = true;
					else alert("Broken comment at char " + pointer);
					break;
				case "\"":
					quote = true;
					break;
				case " ":
				case "\t":
				case "\r":
				case "\n":
				case "\0":
					break;
				case "[":
					if(fileString[pointer+1] == "$")
					{
						var s = "";
						for(var p = pointer+2; fileString[p] != "]"; p++)
						{
							s += fileString[p].toLowerCase();
						}
						if(s != lang)
						{
							list[listOrder[listOrder.length-1]] = null;
							listOrder[listOrder.length-1] = null;
						}
						pointer += 2 + s.length;
						continue;
					}
				default:
					alert("Misplaced character at char " + pointer);
					break;
			}
		}
		else
		{
			switch(char)
			{
				case "\"":
					quote = false;
					if(isValue)
					{
						list[key] = value;
						if(!listOrder.includes(key))
						{
							listOrder[listOrder.length] = key;
						}
						key = "";
						value = "";
					}
					isValue = !isValue;
					break;
				case "\\":
					escaped = true;
					switch(fileString[pointer+1])
					{
						case "n":
							char = "\n";
							break;
						case "r":
							char = "\r";
							break;
						case "t":
							char = "\t";
							break;
						case "0":
							char = "\0";
							break;
						case "\\":
							break;
						case "\"":
							char = "\"";
							break;
						default:
							escaped = false;
							break;
					}
					if(escaped) pointer++;
				default:
					if(isValue) value += char;
					else key += char;
			}
		}
	}
	const keyvalues = document.getElementById("keyvalues");
	for(var i = 0; i < listOrder.length; i++)
	{
		var key = listOrder[i];
		keyvalues.innerHTML += "<input type=\"radio\" name=\"key\" class=\"radio\" id=\"" + key + "\" value=\"" + key + "\"/><label for=\"" + key + "\" class=\"radio\">" + key + "</label>";
	}
	keyvalues.addEventListener("click", (event) =>
	{
		if(event.target.nodeName != "INPUT") return;
		loadstring(event.target.id);
	})
}
function loadstring(key)
{
	const selection = document.getElementById("selection");
	selection.innerHTML = list[key].replaceAll("\r", "").replaceAll("\n", "<br>");
}

function emptylist()
{
	document.getElementById("keyvalues").innerHTML = "";
	list = [];
	listOrder = [];
}