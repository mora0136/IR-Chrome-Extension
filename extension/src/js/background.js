// import * as TabDesk from './tabDesk'
// importScripts('./js/tabDesk');
// const tabDeskService = new TabDesk()

let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ color });
    console.log('Default background color set to %cgreen', `color: ${color}`);
});

chrome.commands.onCommand.addListener(function(command) {
    console.log('Command:', command);
    switch(command){
        case 'open-tabdesk-view':
            break;
        default:
            console.log(command)
    }
});