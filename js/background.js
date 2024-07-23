chrome.contextMenus.create({
    id: "open-favorites-notes",
    title: "打开收藏夹笔记",
});


chrome.contextMenus.onClicked.addListener(function(info, tab) {
    chrome.tabs.sendMessage(tab.id, {
        action: "open"
    }, function(response) {
        console.log(response);
    });
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkFavorites") {
        console.log("checkFavorites", request.url);
        isFavoritesPage(request.url).then(sendResponse)
    }
    return true // 必须返回true，告诉浏览器你需要异步返回结果
});
function isFavoritesPage(url) {
    const currentUrl = url;
    let isFavorites = false;
    console.log("Current page URL:", currentUrl);

    return new Promise(function(resolve, reject) {
        chrome.bookmarks.getTree(function(bookmarks) {
            const result = findBookmarks(bookmarks[0], currentUrl);
            if(result) {
                isFavorites = true
            }
            resolve(isFavorites)
        });
    })
}

// 寻找当前页面的书签
function findBookmarks(bookmarks,url) {
    if(bookmarks.url) {
        if(bookmarks.url == url) {
            return bookmarks;
        }
    }else if(bookmarks.children){
        let result = null;
        bookmarks.children.forEach(function(item){
            let res = findBookmarks(item,url)
            if(res) {
                result = res;
            }
        })
        return result;
    }
}


console.log("background.js is running");