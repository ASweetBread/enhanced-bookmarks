let isFavorites = false;

// 判断当前页面是否收藏
chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentUrl = tabs[0].url;
    console.log("Current page URL:", currentUrl);

    chrome.bookmarks.getTree(function(bookmarks) {
        const result = findBookmarks(bookmarks[0], currentUrl);
        if(result) {
            isFavorites = true
        }
        initLayout()
    });
});

// popup页面初始化
function initLayout() {
    console.log("initLayout",document)
    const container = document.getElementById("container");
    const Unfavorites = `<div class="card">当前页面未收藏</div>`
    const Favorites = `<div class="card">
        <div class="card-header">页面标题</div>
        <div class="card-body">
            <div classs="card-item">
                <div class="card-item-title">记录文字</div>
                <div class="card-item-content">记录内容</div>
            </div>
        </div>
    </div>`

    let content = isFavorites? Favorites : Unfavorites;
    container.innerHTML = content;
}


// 寻找当前页面的书签
function findBookmarks(bookmarks,url) {
    if(bookmarks.url) {
        console.log(bookmarks.url,url)
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