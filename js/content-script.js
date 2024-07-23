console.log("content-script.js is running");

// setStorage(window.location.href, [])

// 存储
function setStorage(key, value) {
	chrome.storage.local.set({ [key]: value }, function() {
		console.log(`set ${key} to ${value} success`);
	});
}
async function getStorage(key) {
	const res = await new Promise((resolve, reject) => {
		chrome.storage.local.get(key, function(result) {
			if(result[key]) {
				resolve(result[key]);
			}else{
				resolve([])
			}
		});
	})
	const isFavorites = await new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ action: "checkFavorites", url: key }, (response) => {
			console.log(response,'response')
			resolve(response)
		});
	})
	console.log(res,'res',isFavorites,'isFavorites')
	return { res, isFavorites };
}
let arraySelection = [], notePanel = null, panel = null, mousePosition = { x:0,y:0 }, RenderLineation = lineationObj(), hrefGlobal = window.location.href;
getStorage(hrefGlobal).then(data =>{
	arraySelection = data.res;
	window.onload = function() {
		// 笔记面板
		notePanel = NotePanel(arraySelection)
		// 记录面板
		panel = Panel(0, 30, arraySelection);
		// 划线效果渲染
		RenderLineation.Render(arraySelection)
	}
	// 获取鼠标位置
	document.addEventListener("mouseup", (event) => {
		mousePosition.x = event.pageX;
		mousePosition.y = event.pageY;
		
		let selection = document.getSelection()
		console.log(!data.isFavorites,'!data.isFavorites',notePanel.getIsEditStatus(),'notePanel.getIsEditStatus()',selection.toString().length > 0,'selection.toString().length > 0')
		switch (true) {
			case panel.getPanelStatus():
				return
			case !data.isFavorites:
				return
			case notePanel.getIsEditStatus():
				alert("存在未保存的笔记，请先保存")
				return
			case selection.toString().length > 0:
				panel.appendPanel(selection.getRangeAt(0));
		}
	});
})
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(request, 'request')
	if(request.action === "open") {
		notePanel.panel.style.display = "block";
		sendResponse('ok')
	}
	console.log(request.action)
	if(request.action === "status") {
		isFavorites = request.status
		sendResponse('ok')
	}
})
// {
// 	text: text,
// 	selection: tip,
// 	id: arraySelection.length,
// 	container: selectionobj.container,
// 	startOffset: selectionobj.startOffset,
// 	endOffset: selectionobj.endOffset
// }
// 划线效果渲染
function lineationObj() {
	let lineations = [];

	async function findElement(startContainer) {
		let findContainer = document.getElementById(startContainer.id)
		if(findContainer) {
			await new Promise(async (resolve, reject) => {
				for (let i in startContainer.pathArray ) {
					console.log('start', i ,[findContainer.childNodes[startContainer.pathArray[i]]])
					if(!findContainer.childNodes[startContainer.pathArray[i]]) {
						await new Promise((resolve, reject) => {
							const observer = new MutationObserver(() => {
								console.log('observer middle', i)
								resolve()
								observer.disconnect()
							})
							observer.observe(findContainer, { childList: true })
						})
					}
					findContainer = findContainer.childNodes[startContainer.pathArray[i]]
					if(Number(i) === startContainer.pathArray.length - 1) {
						console.log('resolve', i)
						resolve()
					}
					console.log('end', i)
				}
			}) 
			console.log('return findContainer', [findContainer])
			return findContainer
		}
	}
	function removeLineation() {
		lineations.forEach(item => {
			if(item) {
				item.remove()
			}
		})
		lineations = []
	}
	function AddLineation(lineation) {
		lineations.push(lineation)
	}
	// 存储的划线内容全部渲染
	function Render(arraySelection) {
		if(arraySelection.length === 0) {
			return
		}
		if(lineations.length > 0) {
			removeLineation()
		}
		
		lineations = arraySelection.map(async item => {
			console.log('RenderItem Start')
			const startContainer = await findElement(item.container.startContainer)
			const endContainer = await findElement(item.container.endContainer)
			console.log('RenderItem End')
			return RenderItem({
				startContainer: startContainer,
				startOffset: item.startOffset,
				endContainer: endContainer,
				endOffset: item.endOffset
			})
		})
	}
	// 渲染器
	function RenderItem(item) {
		console.log(item, 'item')
		if(item.startContainer && item.endContainer) {
			const rangeArray = getLineationArray(item)

			const lineationArray = rangeArray.map(range => {
				const rect = range.getBoundingClientRect()
			
				const lineation = document.createElement("div");
				lineation.style.position = "absolute";
				lineation.style.background = "rgba(255,245,109,0.3)";
				lineation.style.pointerEvents = "none";
				lineation.style.borderBottom = "1px solid #42b983";
				lineation.style.zIndex = 99999;

				lineation.style.left = `${rect.left}px`;
				lineation.style.top = `${rect.top + ( document.body.scrollTop || document.documentElement.scrollTop || 0 ) }px`;
				lineation.style.width = `${rect.width}px`;
				lineation.style.height = `${rect.height}px`;
				document.body.appendChild(lineation);
				return lineation
			})
			
			return lineationArray
		}
		return null
	}
	
	return { Render, RenderItem, AddLineation }
}

/**
 * 创建自定义的选中文本对象，包含容器（及路径）、起始偏移量、结束偏移量、选中文本本身
 * @param { document.getSelection().selection } selection 
 * @returns { container, startOffset, endOffset, selection }
 */
function selectionObj(selection) {
	const container = getSelectionContainer(selection);
	const startOffset = selection.startOffset
	const endOffset = selection.endOffset

	function getSelectionContainer(selection) {
		const findContainer = (node, pathArray = []) => {
			let parentNode = node.parentNode, currentNode = parentNode.firstChild;
			pathArray.push(0)
			while(currentNode) {
				if(currentNode === node) {
					currentNode = undefined
					if(parentNode.id) {
						console.log(pathArray, 'pathArray')
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

// 添加面板
function Panel(offsetX=0, offsetY=0) {
	let selectionInner = null, timeout = null;
	const panel = document.createElement("div");
	panel.style.position = "absolute";
	panel.style.zIndex = 99999;
	panel.className = "selection-panel";

	const getPanelStatus = () => {
		return panel.style.display === "block"
	}

	const appendPanel = (selection) => {
		panel.style.display = "block";
		panel.style.left = `${mousePosition.x + offsetX}px`;
		panel.style.top = `${mousePosition.y + offsetY}px`;
		selectionInner = selection;

		timeout = setTimeout(() => {
			removePanel()
			clearTimeout(timeout)
			timeout = null;
		}, 1500)
	}
	const removePanel = function() {
		panel.style.display = "none";
		panel.style.left = 0;
		panel.style.top = 0;
		
		tipButton.style.display = "block";
		recordPanel.style.display = "none";
		selectionInner = null
	}

	// 记录面板
	const recordPanel = document.createElement("div");
	recordPanel.className = "bookmark-record";
	recordPanel.style.display = "none";
	const openRecord = function() {
		recordPanel.style.display = "block";
		const tip = selectionInner.toString();
		recordPanel.innerHTML = `
		<pre class="__bookmark-tip">${tip}</pre>
		<textarea id="__bookmark-textarea" placeholder="请输入备注"></textarea>
		<div class="__bookmark-buttons">
			<button id="__bookmark-button">添加</button>
			<button id="__cancel-button">取消</button>
		</div>
		`
		const textarea = recordPanel.querySelector("#__bookmark-textarea");
		const button = recordPanel.querySelector("#__bookmark-button");
		const cancelButton = recordPanel.querySelector("#__cancel-button");

		const lineations = RenderLineation.RenderItem({
			startContainer: selectionInner.startContainer,
			startOffset: selectionInner.startOffset,
			endContainer: selectionInner.endContainer,
			endOffset: selectionInner.endOffset
		})
		button.addEventListener("click", () => {
			const selectionobj = selectionObj(selectionInner);
			const item = {
				text: textarea.value.trim(),
				selection: tip,
				id: arraySelection.length,
				container: selectionobj.container,
				startOffset: selectionobj.startOffset,
				endOffset: selectionobj.endOffset
			}

			RenderLineation.AddLineation(...lineations)
			notePanel.insertNoteItem(item)
			
			arraySelection.push(item)
			setStorage(hrefGlobal, arraySelection)
			removePanel();
		})
		cancelButton.addEventListener("click", () => {
			removePanel();
			lineations.forEach(lineation => {
				lineation.remove()
			})
		})
	}

	// 按钮
	const tipButton = document.createElement("div");
	tipButton.className = "__bookmark-tip-button";
	tipButton.addEventListener("click", ()=> {
		tipButton.style.display = "none";
		if(timeout) {
			clearTimeout(timeout)
			timeout = null;
		}
		openRecord();
	});
	tipButton.innerText = "记录";

	panel.appendChild(tipButton);
	panel.appendChild(recordPanel);
	document.body.appendChild(panel);

	return { panel, appendPanel, removePanel, getPanelStatus };
}

// 添加笔记面板
function NotePanel(arraySelection) {
	let isEdit = false;
	const initNodePanel = () => {
		const panel = document.createElement("div");
		panel.style.position = "fixed";
		panel.style.left = "0px";
		panel.style.top = "0px";
		panel.style.zIndex = 99999;
		panel.style.width = "300px";
		panel.style.height = "400px";
		panel.style.backgroundColor = "#fff";
		panel.style.border = "1px solid #ccc";
		panel.style.borderRadius = "5px";
		panel.style.display = "none";
		panel.style.overflow = "auto";
		panel.style.boxShadow = "0 0 5px #ccc";
		panel.innerHTML = `
		<div class="__note-panel">
			<div class="__note-title">
				<span class="__note-title-text">笔记</span>
				<button id="__close-note-button">X</button>
			</div>
			<div class="__note-content">
			</div>
		</div>
		`
		const contentDiv = panel.querySelector(".__note-content");
		

		const noteItemInit = (item) => {
			const noteItem = document.createElement("div");
			noteItem.className = "__note-item";
			noteItem.innerHTML = `
				<h3 class="__note-item-title" id="__note-item-title-${item.id}">“${item.selection}”</h3>
				<div class="__note-item-content-normal" id="__note-item-content-normal-${item.id}">
					<pre class="__note-item-content-text" id="__note-item-content-text-${item.id}">${item.text}</pre>
					<div class="__note-item-buttons">
						<button class="text-button __edit-button" id="__edit-button-${item.id}">编辑</button>
						<button class="text-button __copy-button" id="__copy-button-${item.id}">复制</button>
						<button class="text-button __delete-button" id="__delete-button-${item.id}">删除</button>
					</div>
				</div>
				<div class="__note-item-content-edit" id="__note-item-content-edit-${item.id}" style="display:none">
					<textarea id="__note-textarea-${item.id}" placeholder="请输入备注">${item.text}</textarea>
					<div class="__note-item-buttons edit-buttons">
						<button class="text-button __save-button" id="__save-button-${item.id}">保存</button>
						<button class="text-button __cancel-button" id="__cancel-button-${item.id}">取消</button>
					</div>
				</div>
			`
			
			contentDiv.appendChild(noteItem);

			const editButton = panel.querySelector(`#__edit-button-${item.id}`);
			const deleteButton = panel.querySelector(`#__delete-button-${item.id}`);
			const saveButton = panel.querySelector(`#__save-button-${item.id}`);
			const cancelButton = panel.querySelector(`#__cancel-button-${item.id}`);
			const copyButton = panel.querySelector(`#__copy-button-${item.id}`);
			const textarea = panel.querySelector(`#__note-textarea-${item.id}`);
			const textTitle = panel.querySelector(`#__note-item-title-${item.id}`);
			const textDiv = panel.querySelector(`#__note-item-content-text-${item.id}`);
			const contentNormal = panel.querySelector(`#__note-item-content-normal-${item.id}`);
			const contentEdit = panel.querySelector(`#__note-item-content-edit-${item.id}`);
			editButton.addEventListener("click", () => {
				contentNormal.style.display = "none";
				contentEdit.style.display = "block";
				isEdit = true;
			});
			deleteButton.addEventListener("click", () => {
				arraySelection.splice(arraySelection.findIndex(i => i.id === item.id), 1)
				setStorage(hrefGlobal, arraySelection)
				noteItem.remove()
			});
			saveButton.addEventListener("click", () => {
				const text = textarea.value.trim();
				contentEdit.style.display = "none";
				contentNormal.style.display = "block";
				textDiv.innerText = text;
				isEdit = false;
			});
			cancelButton.addEventListener("click", () => {
				contentEdit.style.display = "none";
				contentNormal.style.display = "block";
				isEdit = false;
			});
			copyButton.addEventListener("click", () => {
				const blobHtml = new Blob([textTitle.outerHTML,textDiv.outerHTML], { type: 'text/html' });
				const blobText = new Blob([textTitle.innerText,textDiv.innerText], { type: 'text/plain' });

				const data = [new ClipboardItem({ 
					'text/html': blobHtml,
					'text/plain': blobText
				})];
				navigator.clipboard.write(data).then((res) => {
					askNotificationPermission().then((res)=>{
						if(res) {
							const notification = new Notification("复制成功", {
								body: `${textTitle.innerText.trim()}\n${textDiv.innerText.trim()}`
							})
						}else {
							alert("复制成功")
						}
					})
				})
				
			})

		}
		arraySelection.forEach(item => {
			noteItemInit(item)
		})
		return { panel, contentDiv, noteItemInit };
	}
	const { panel, noteItemInit } = initNodePanel()

	const insertNoteItem = (item) => {
		noteItemInit(item)
	}
	
	const closeButton = panel.querySelector("#__close-note-button");
	closeButton.addEventListener("click", () => {
		panel.style.display = "none";
	});
	const titleDiv = panel.querySelector(".__note-title");
	let move = null
	titleDiv.addEventListener('mousedown',(e)=>{
		const startX = e.clientX - panel.offsetLeft;
		const startY = e.clientY - panel.offsetTop;
		move = (event)=> {
			const endX = event.clientX;
			const endY = event.clientY;
			panel.style.left = `${endX - startX}px`;
			panel.style.top = `${endY - startY}px`;
		}
		
		document.addEventListener('mousemove',move)
	})
	document.addEventListener('mouseup',(e)=>{
		if(move) {
			document.removeEventListener('mousemove',move)
			move = null
		}
	})

	document.body.appendChild(panel)
	return { panel, insertNoteItem, getIsEditStatus: () => isEdit }
}




// 延时函数
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

// const style = document.createElement('style')
// style.innerHTML = ``
// document.body.appendChild(style)

// const selectionMap = new Map();