document.addEventListener('openTab', function (e) {
    var data = e.detail;
    chrome.runtime.sendMessage(data, function(response) {
        console.log(response.farewell);
    });

});