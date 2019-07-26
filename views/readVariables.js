var G_Server = [];

for(let input of document.querySelectorAll('#_ServerVariables input'))
	if(input.type == "hidden")
		G_Server[input.dataset['title']] = input.value;