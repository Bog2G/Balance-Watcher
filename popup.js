window.onload = function() {
    setInterval(checkTabs, 1000); // check every 1 sec
    checkTabs();
    tabTime();

}

function checkTabs() {
    chrome.tabs.query({currentWindow: true}, function(tabs) {
        let openTabs = tabs.length;
        // showcase the number of open tabs now
        document.getElementById("openTabs").textContent =  openTabs + " active tabs";
    });
}

function tabTime() {
    chrome.tabs.onActivated.addListener(function(activeInfo) {
        
    })

}