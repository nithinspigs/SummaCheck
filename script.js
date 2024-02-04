function getSelectionText() { // gets highlighted text from current window
    return window.getSelection().toString();
}

async function getHighlightedText() { // gets the highlighted text from the active tab
    
    const activeTabs = await chrome.tabs.query({active: true}); // array of tabs which are active
    console.log(activeTabs);
    const activeTabId = activeTabs[0].id; // gives the id of the zeroth active tab
    
    const results_json = await chrome.scripting.executeScript({
        target: {tabId: activeTabId},
        func: getSelectionText,
    }); // array that includes the result of getSelectionText() function, applied to active tab identified earlier
    console.log(results_json);
    const text = results_json[0].result; // isolates the text from the results_json array
    console.log(text);
    return text;
    
}

async function getURL() { // gets the URL of the active tab
    
    const activeTabs = await chrome.tabs.query({active: true}); // array of tabs which are active
    console.log(activeTabs);
    const activeTabId = activeTabs[0].id; // gives the id of the zeroth active tab
    const url = activeTabs[0].url; // might have to delete quotations
    console.log(url);
    return url;
    
}

async function getResponse(isSummary, isHighlightedTextOnly, childMode, wordLimit) {
    
    /*
     first, create prompt
     */
    
    var prompt = "";
    var text = "";
    
    if(childMode) {
        prompt += "explain to a child, ";
    }
    
    if(isHighlightedTextOnly) {
        
        text = await getHighlightedText();
        if(isSummary) { // summarize highlighted text
            prompt += "summarize the text: ";
        } else { // fact check highlighted text
            prompt += "is the following statement true: ";
        }
        prompt += text;
        
    } else {
        
        // if not only highlighted text, we know that it must be trying to summarize the whole website
        text = await getURL();
        if(isSummary) {
		prompt += "summarize the contents of the website: ";
        	prompt += text;
	} else {
		prompt+= "Cannot fact check the entire web page. Please highlight text."
	}
        
    }
    
    console.log(prompt);
    
    /*
     send prompt to ChatGPT and receive response
     */
    
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

function processArgsSummarize() {
	var wordLimit = document.getElementById("integerInput").value;
	if (wordLimit === '' || isNaN(wordLimit) || parseInt(wordLimit) !== parseFloat(wordLimit) || wordLimit < 0 || wordLimit > 200) {
		wordLimit = 200;
	}
	var childMode = document.getElementById("childbox").checked;
	var isHighlightedTextOnly = document.getElementById("highlightedbox").checked;
	
	console.log("Word Limit: "+wordLimit);
	console.log("Highlight: "+isHighlightedTextOnly);
	console.log("Mode: "+childMode);

	getResponse(true, isHighlightedTextOnly, childMode, wordLimit);
}

$(document).ready(function(){
	var fact_check_button = document.getElementById("fact_check_button");
	fact_check_button.addEventListener('click', function(){
		processArgsFactCheck();
	});

	var summarize_button = document.getElementById("summarize_button");
	summarize_button.addEventListener('click', function(){
		processArgsSummarize();
	});
})
