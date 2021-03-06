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
	var innerHTML = "";
	for(var i = 0; i < listOrder.length; i++)
	{
		var key = listOrder[i];
		innerHTML += "<input type=\"radio\" name=\"key\" class=\"radio\" id=\"" + key + "\" value=\"" + key + "\"/><label for=\"" + key + "\" class=\"radio\">" + key + "</label>";
	}
	document.getElementById("keyvalues").innerHTML = innerHTML;
	keyvalues.addEventListener("click", (event) =>
	{
		if(event.target.nodeName != "INPUT") return;
		loadstring(event.target.id);
	})
}
function loadstring(key)
{
	const selection = document.getElementById("selection");
	selection.innerHTML = getstring(key);
	selection.style.cssText = getstyle(key);
}
function getstring(key)
{
	var value = gethtmlstring(key);

	var innerHTML;
	if(styles[key] != undefined)
	{
		innerHTML = styles[key].text;
		if(innerHTML == undefined && styles[key].reuse != undefined)
		{
			innerHTML = styles[styles[key].reuse].text;
		}
	}
	if(innerHTML == undefined) innerHTML = styles["default"].text;
	
	var matches = innerHTML.match(/{{.*?}}/g);
	for(var i = 0; i < matches.length; i++)
	{
		var r = matches[i];
		if(matches[i] == "{{value}}") r = value;
		else if(matches[i].startsWith("{{#")) r = gethtmlstring(matches[i].substr(3, r.length-5));
		else if(matches[i].startsWith("{{&")) r = gethtmlstring(matches[i].substr(3, r.length-5)).replaceAll("&", "");
		else if(matches[i].startsWith("{{!")) r = gethtmlstring(matches[i].substr(3, r.length-5)).substr(value.indexOf("&")+1,1);
		innerHTML = innerHTML.replaceAll(matches[i], r);
	}
	return innerHTML;
}
function getstyle(key)
{
	var cssstyle;
	if(styles[key] != undefined)
	{
		cssstyle = styles[key].style;
		if(cssstyle == undefined && styles[key].reuse != undefined)
		{
			cssstyle = getstyle(styles[key].reuse);
		}
	}
	if(cssstyle == undefined) css = styles["default"].style;
	return cssstyle;
}
function gethtmlstring(key)
{
	if(list[key] == undefined) return "#" + key;
	return list[key].replaceAll("\r", "").replaceAll("\n", "<br>");
}

function emptylist()
{
	document.getElementById("keyvalues").innerHTML = "";
	list = [];
	listOrder = [];
}