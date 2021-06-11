//This actively listens on all tabs for a particular event. This event is fired from the website when a double click occurs.
//WHat this accomplishes is that the tab is then opened.
document.addEventListener('openTab', function (e) {
    var data = e.detail;
    chrome.runtime.sendMessage(data, function(response) {
        console.log(response.farewell);
    });

});