const YOUR_TOKEN = ""; // input your own OpenAI API key

function getSelectionText() { // gets highlighted text from current window
    return window.getSelection().toString();
}

async function getHighlightedText() { // gets the highlighted text from the active tab
    
    const activeTabs = await chrome.tabs.query({active: true}); // array of tabs which are active
    // console.log(activeTabs);
    const activeTabId = activeTabs[0].id; // gives the id of the zeroth active tab
    
    const results_json = await chrome.scripting.executeScript({
        target: {tabId: activeTabId},
        func: getSelectionText,
    }); // array that includes the result of getSelectionText() function, applied to active tab identified earlier
    // console.log(results_json);
    const text = results_json[0].result; // isolates the text from the results_json array
    // console.log(text);
    return text;
    
}

async function getURL() { // gets the URL of the active tab
    
    const activeTabs = await chrome.tabs.query({active: true}); // array of tabs which are active
    // console.log(activeTabs);
    const activeTabId = activeTabs[0].id; // gives the id of the zeroth active tab
    const url = activeTabs[0].url; // might have to delete quotations
    // console.log(url);
    return url;
    
}

async function getPrompt(isSummary, isHighlightedTextOnly, childMode, wordLimit) {
    
    var prompt = "";
    var text = "";
    
    prompt += "In strictly under " + wordLimit + " words, ";
    
    if(childMode) {
        prompt += "explain to a child, ";
    }
    
    if(isHighlightedTextOnly) {
        
        text += await getHighlightedText();
        if(isSummary) { // summarize highlighted text
            prompt += "summarize the text: ";
        } else { // fact check highlighted text
            prompt += "is the following statement true: ";
        }
        
    } else {
        
        // if not only highlighted text, we know that it must be trying to summarize the whole website
        text += await getURL();
        if(isSummary) {
            prompt += "summarize the contents of the website: ";
        } else {
            const error_template = $("<div>Cannot fact-check the entire webpage. Please highlight a selection.</div>");
            $("#chatgpt_response").append(response_template);
            return;
        }
        
    }
    
    prompt += text;
    
    //console.log(prompt);
    return prompt;
    
}

async function getResponse(isSummary, isHighlightedTextOnly, childMode, wordLimit) {
    
    var prompt = "" + await getPrompt(isSummary, isHighlightedTextOnly, childMode, wordLimit);
    console.log(prompt);
    
    var url = "https://api.openai.com/v1/chat/completions";
    var bearer = 'Bearer ' + YOUR_TOKEN;
    
    $("#chatgpt_response").empty();
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': bearer
        },
        body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [{
                "role": "user",
                "content": prompt
            }]
        })

    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        const response_text = data.choices[0].message.content;
        console.log(response_text);
        const response_template = $("<div>" + response_text + "</div>");
        $("#chatgpt_response").append(response_template);
    })
    
}

function processArgsFactCheck() {
	
    var wordLimit = document.getElementById("integerInput").value;
	if (wordLimit === '' || isNaN(wordLimit) || parseInt(wordLimit) !== parseFloat(wordLimit) || wordLimit < 0 || wordLimit > 200) {
		wordLimit = 200;
	}
	var childMode = document.getElementById("childbox").checked;
	var isHighlightedTextOnly = document.getElementById("highlightedbox").checked;
	
	console.log("Word Limit: "+wordLimit);
	console.log("Highlight: "+isHighlightedTextOnly);
	console.log("Mode: "+childMode);

	getResponse(false, isHighlightedTextOnly, childMode, wordLimit);
    
}

function processArgs(isSummary) {
    
    var wordLimit = document.getElementById("integerInput").value;
	if (wordLimit === '' || isNaN(wordLimit) || parseInt(wordLimit) !== parseFloat(wordLimit) || wordLimit < 0 || wordLimit > 200) {
		wordLimit = 200;
	}
	var childMode = document.getElementById("childbox").checked;
	var isHighlightedTextOnly = document.getElementById("highlightedbox").checked;
	
	console.log("Word Limit: "+wordLimit);
	console.log("Highlight: "+isHighlightedTextOnly);
	console.log("Mode: "+childMode);

    getResponse(isSummary, isHighlightedTextOnly, childMode, wordLimit);
    
}

$(document).ready(function(){
	var fact_check_button = document.getElementById("fact_check_button");
	fact_check_button.addEventListener('click', function(){
		processArgs(false);
	});

	var summarize_button = document.getElementById("summarize_button");
	summarize_button.addEventListener('click', function(){
		processArgs(true);
	});
})
