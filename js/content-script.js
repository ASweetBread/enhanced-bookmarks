// setStorage(window.location.href, [])

let	/** @type { IEnhancedBookmarkItem[] } arraySelection 存储的选中文本对象数组 */
 	arraySelection = [],

	/** @type { ReturnType<NotePanel> } notePanel 笔记面板对象 */
	notePanel = null,

	/** @type { ReturnType<Panel> } panel 记录面板对象 */
	panel = null, 

	/** @type { ReturnType<lineationObj> } panel 记录面板对象 */
	RenderLineation = lineationObj(), 

	/** @type { SENDERMESSAGETYPE } 消息类型*/
	SENDERMESSAGE = null
	
	/** @description 当前地址 */
	hrefGlobal = window.location.href;


//获取当前页面对应的笔记与划线渲染对象
getStorage(hrefGlobal).then(data =>{
	arraySelection = data.res;
	SENDERMESSAGE = data.SENDERMESSAGE;
	window.onload = function() {
		// 笔记面板
		notePanel = NotePanel(arraySelection)
		// 记录面板
		panel = Panel(0, 30, arraySelection);
		// 划线效果渲染
		const renderAll = delay(RenderLineation.Render, 500) // 防抖渲染
		ObserverHeightChange(renderAll, arraySelection) // 高度变化重新渲染
		document.addEventListener("resize", () => { // 窗口大小变化重新渲染
			renderAll(arraySelection)
		})

	}
	// 获取鼠标位置
	document.addEventListener("mouseup", (event) => {
		
		/** @type { MousePosition } */
		let mousePosition = { x:0,y:0 }
		mousePosition.x = event.pageX;
		mousePosition.y = event.pageY;
		
		let selection = document.getSelection()
		switch (true) {
			// 记录面板显示
			case panel.getPanelStatus():
				return
			// 页面是否收藏
			case !data.isFavorites:
				return	
			// 是否有选中文本
			case selection.toString().length > 0:
				// 笔记面板是否编辑状态
				if(!notePanel.getIsEditStatus()) {
					panel.appendPanel(selection.getRangeAt(0), mousePosition);
					return
				}
		}
	});
})

// 监听消息打开笔记面板
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.action === SENDERMESSAGE.OPEN) {
		notePanel.panel.style.display = "block";
		sendResponse('ok')
	}
})