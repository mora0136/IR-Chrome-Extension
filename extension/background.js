let color = '#3aa757';

// If you are running this extension to serve a local setup, ensure the correct endpoints are being used

//For Local
// const apiEndpoint = "http://localhost:8088/api/"
// const websiteEndpoint = "http://localhost:4200/"
//For AWS
const apiEndpoint = "http://3.24.105.28:8088/api/"
const websiteEndpoint = "http://myextensionbucket.s3-website-ap-southeast-2.amazonaws.com"


//This is the main function that adds all of the tabs into the database.
//I would suggest using this most of the time, open all the tabs you want and then refresh the chrome extension
chrome.runtime.onInstalled.addListener(async (reason) => {
    let initDelete = {
        method: 'delete',
        asnyc: true,
        headers: {
            'Content-Type': 'application/json'
        },
        'contentType': 'json',
    }
    console.log(apiEndpoint+'allTabs')
    const response = await fetch(apiEndpoint+'allTabs/', initDelete)
    console.log(response)
    if(response.status === 200){
        chrome.tabs.query({active:true}, async (currentOpenTab) => {
            console.log("currentOpenTab"+JSON.stringify(currentOpenTab))
            chrome.tabs.query({windowType:'normal'}, async (tabs)=>{
                let previousData = null
                for(let tab of tabs){
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
                                const response = await fetch(apiEndpoint+'tab/', init)
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

//This kind of copies the above, but only does it for a single page.
chrome.tabs.onCreated.addListener(async function(tab){
    console.log(tab)

    if(tab.url.includes(websiteEndpoint) || tab.pendingUrl.includes(websiteEndpoint) ||
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
                const response = await fetch(apiEndpoint+'tab/', init)
                clearTimeout(timeout)
                chrome.windows.create((window) => {
                    chrome.tabs.query({windowId: window.id, active: true, highlighted: true}, (tab) => {
                        chrome.tabs.update(tab[0].id, {url: websiteEndpoint})
                    })
                })
                resolve()
            })
        } catch (e) {
            console.log(e)
        }
    })
})

//Similar to the above, but we only send the information that has changed and update it, not create a new entry
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
                const response = await fetch(apiEndpoint+'tab/'+tabId, init)
                console.log(response)
                clearTimeout(timeout)
                resolve()
            })
        } catch (e) {
            console.log(e)
        }
    })
})



//Whenever a tab is deleted, we need to remove it from the database so that we are always up to date with the browser
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo)=>{
    let init = {
        method: 'delete',
        asnyc: true,
        headers: {
            'Content-Type': 'application/json'
        },
        'contentType': 'json',
    }
    const response = await fetch(apiEndpoint+'tab/'+tabId, init)
})

//I use this to enabled the keyboard shortcut to open the tabtop website
chrome.commands.onCommand.addListener((command)=>{
    console.log("command occured: "+command)
    switch(command) {
        case "open-tabtop":
            chrome.windows.create((window)=>{
                chrome.tabs.query({windowId: window.id, active: true, highlighted: true}, (tab)=>{
                    chrome.tabs.update(tab[0].id, {url: websiteEndpoint})
                })
            })
            break;
        default:
            break;
    }

})

//This is used so that on the 'tab' view, you can double click on a tab and it will open it in the browser window
//This enables communication between the website and the extension.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('received', request);
    chrome.tabs.update(request.id, {active: true, highlighted: true}, ()=>{
    })
    console.log(sender.tab ?
        "from a content script:" + sender.tab.url :
        "from the extension");
    }
);