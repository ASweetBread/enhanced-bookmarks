chrome.contextMenus.create({
    id: "open-favorites-notes",
    title: "打开收藏夹笔记",
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "open"
        }, function(response) {
            console.log(response);
        });
    });
})

console.log("background.js is running");