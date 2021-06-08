let color = '#3aa757';

chrome.tabs.onCreated.addListener(async function(tab){
    console.log(tab)

    if(tab.url.includes("localhost:4200") || tab.pendingUrl.includes("localhost:4200") ||
        tab.url.includes("chrome://newtab") || tab.pendingUrl.includes("chrome://newtab")){
        return false
    }
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject()
        }, 1000)
        if (!tab.active) {
            chrome.tabs.update(tab.id, {active: true, highlighted: true})
            console.log("Tab now active")
        }
        try {
            chrome.tabs.captureVisibleTab(tab.windowId, {
                format: "jpeg",
                quality: 10
            }, async (dataUrl) => {
                tab.screenshot = dataUrl
                let init = {
                    method: 'post',
                    asnyc: true,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    'contentType': 'json',
                    body: JSON.stringify(tab)
                }
                const response = await fetch('http://localhost:8088/api/tab/', init)
                clearTimeout(timeout)
                chrome.windows.create((window) => {
                    chrome.tabs.query({windowId: window.id, active: true, highlighted: true}, (tab) => {
                        chrome.tabs.update(tab[0].id, {url: "http://localhost:4200"})
                    })
                })
                resolve()
            })
        } catch (e) {
            console.log(e)
        }
    })
})

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab){
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(()=>{reject()}, 1000)
        try {
            chrome.tabs.captureVisibleTab(tab.windowId, {
                format: "jpeg",
                quality: 10
            }, async (dataUrl) => {
                changeInfo.screenshot = dataUrl
                let init = {
                    method: 'put',
                    asnyc: true,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    'contentType': 'json',
                    body: JSON.stringify(changeInfo)

                }
                const response = await fetch('http://localhost:8088/api/tab/'+tabId, init)
                console.log(response)
                clearTimeout(timeout)
                resolve()
            })
        } catch (e) {
            console.log(e)
        }
    })
})

chrome.runtime.onInstalled.addListener(async (reason) => {
    let initDelete = {
        method: 'delete',
        asnyc: true,
        headers: {
            'Content-Type': 'application/json'
        },
        'contentType': 'json',
    }
    const response = await fetch('http://localhost:8088/api/allTabs/', initDelete)
    console.log(response)
    if(response.status === 200){
        chrome.tabs.query({active:true}, async (currentOpenTab) => {
            console.log("currentOpenTab"+JSON.stringify(currentOpenTab))
            chrome.tabs.query({windowType:'normal'}, async (tabs)=>{
                let previousData = null
                for(let tab of tabs){
                    chrome.cookies.getAll({url: tab.url}, (data)=>{
                        for(let cookie of data){
                            console.log(cookie)
                        }
                    })
                    // Loop through tabs to make them visible, then capture as a screenshot
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(()=>{reject()}, 5000)
                        if (!tab.active) {
                            chrome.tabs.update(tab.id, {active: true, highlighted: true})
                            console.log("Tab now active")
                        }
                        try {
                            chrome.tabs.captureVisibleTab(tab.windowId, {
                                format: "jpeg",
                                quality: 10
                            }, async (dataUrl) => {
                                previousData = previousData === dataUrl ? null : dataUrl
                                tab.screenshot = previousData
                                let init = {
                                    method: 'post',
                                    asnyc: true,
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    'contentType': 'json',
                                    body: JSON.stringify(tab)
                                }
                                const response = await fetch('http://localhost:8088/api/tab/', init)
                                clearTimeout(timeout)
                                resolve()
                            })
                        } catch (e) {
                            console.log(e)
                        }

                    })
                    console.log(tab)
                }
                await chrome.tabs.update(currentOpenTab[0].id, {active: true, highlighted: true})
            })
        })
    }
})

chrome.tabs.onRemoved.addListener(async (tabId, removeInfo)=>{
    let init = {
        method: 'delete',
        asnyc: true,
        headers: {
            'Content-Type': 'application/json'
        },
        'contentType': 'json',
    }
    const response = await fetch('http://localhost:8088/api/tab/'+tabId, init)
})


chrome.commands.onCommand.addListener((command)=>{
    console.log("command occured: "+command)
    switch(command) {
        case "open-tabtop":
            chrome.windows.create((window)=>{
                chrome.tabs.query({windowId: window.id, active: true, highlighted: true}, (tab)=>{
                    chrome.tabs.update(tab[0].id, {url:"http://localhost:4200"})
                })
            })
            break;
        default:
            break;
    }

})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('received', request);
    chrome.tabs.update(request.id, {active: true, highlighted: true}, ()=>{
    })
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.greeting == "hello")
            sendResponse({farewell: "goodbye"});
    }
);




// window.addEventListener("message", function(event) {
//     if (event.source == window &&
//         event.data &&
//         event.data.direction == "from-page-script") {
//         alert("Content script received message: \"" + event.data.message + "\"");
//     }
// });