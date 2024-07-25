/**
 * 
 * @param {Function} fn 原函数
 * @param {number} delay 防抖时间
 * @returns { Function } 带有防抖效果的原函数
 */
function delay(fn, delay=100) {
	let timer = null;
	return function (...args) {
		if(timer) {
			clearTimeout(timer)
			timer = null;
		}
		timer = setTimeout(() => {
			fn.apply(this, args)
			clearTimeout(timer)
			timer = null;
		}, delay)
	}
}

/** @description 检查浏览器是否支持通知 */
async function askNotificationPermission() {
    if (!("Notification" in window)) {
      console.log("此浏览器不支持通知。");
      return false;
    }
    let permission = await Notification.requestPermission()
    return permission === "granted";
}

/**
 * @description 实现面板拖动功能
 * @param { Node } node 节点 
 * @param { Function } callback mousemove的回调函数
 */
function nodeMoveEvent(node, callback) {
  let move = null
  node.addEventListener('mousedown',(e)=>{
    move = callback(e)
    document.addEventListener('mousemove',move)
  })
  document.addEventListener('mouseup',(e)=>{
    if(move) {
      document.removeEventListener('mousemove',move)
      move = null
    }
  })
}

/**
 * @param {Function} callback 渲染函数
 * @param {Object} args 渲染函数参数
 */
function ObserverHeightChange(callback, args) {
	switch (true) {
		case Boolean(ResizeObserver):
			const resizeObserver = new ResizeObserver(() => {
				callback(args)
				// resizeObserver.disconnect()
			})
			resizeObserver.observe(document.body)
			return
		case Boolean(MutationObserver):
			const mutationObserver = new MutationObserver(() => {
				callback(args)
				// mutationObserver.disconnect()
			})
			mutationObserver.observe(document.body, { childList: true, subtree: true })
			return
		default:
			let lastHeight = document.body.clientHeight
			let interver = setInterval(()=>{
				const height = document.body.clientHeight
				if(height !== lastHeight) {
					lastHeight = height
					callback(args)
				}
			},500)
	}
}

/**
 * @description 创建自定义的选中文本对象，包含容器（及路径）、起始偏移量、结束偏移量、选中文本本身
 * @param { Range } selection 
 */
function selectionObj(selection) {
	const container = getSelectionContainer(selection);
	const startOffset = selection.startOffset
	const endOffset = selection.endOffset

	/**
	 * @description 获取选中文本的容器id及路径
	 * @param { Range } selection 
	 */
	function getSelectionContainer(selection) {
		/**
		 * @description 递归查找选中文本的容器及路径
		 * @param { Node } node 
		 * @param { number[] } pathArray 
		 * @returns { { id: string, pathArray: number[] } }
		 */
		const findContainer = (node, pathArray = []) => {
			let parentNode = node.parentNode, currentNode = parentNode.firstChild;
			pathArray.push(0)
			while(currentNode) {
				if(currentNode === node) {
					currentNode = undefined
					if(parentNode.id) {
						return { id: parentNode.id, pathArray: pathArray.reverse() }
					}else {
						return findContainer(parentNode, pathArray)
					}
				}else {
					pathArray[pathArray.length - 1] += 1
					currentNode = currentNode.nextSibling;
				}
			}
			
		}
		const startContainer = findContainer(selection.startContainer)
		const endContainer = findContainer(selection.endContainer)
		return { startContainer, endContainer }
	}

	return { container, startOffset, endOffset, selection }
}