/**
 * @param { string } key 
 * @param { IEnhancedBookmarkItem[] } value 
 */
function setStorage(key, value) {
	chrome.storage.local.set({ [key]: value }, function() {
		console.log(`set ${key} to ${value} success`);
	});
}
/**
 * @description 获取存储的笔记数据&获取收藏标识
 * @param { string } key 
 * @returns { { res: IEnhancedBookmarkItem[], isFavorites: boolean, SENDERMESSAGE: SENDERMESSAGETYPE} }
 */
async function getStorage(key) {
	const src = chrome.runtime.getURL("js/util/constant.js");
	/** @type { CONSTANTS } */
	const CONSTANT = await import(src);

	const res = await new Promise((resolve, reject) => {
		chrome.storage.local.get(key, function(result) {
			result[key] ? resolve(result[key]) : resolve([])
		});
	})
	const isFavorites = await new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ action: CONSTANT.SENDERMESSAGE.CHECKFAVORITES, url: key }, (response) => {
			resolve(response)
		});
	})
	console.log(res,'res',isFavorites,'isFavorites')
	return { res, isFavorites, SENDERMESSAGE: CONSTANT.SENDERMESSAGE};
}