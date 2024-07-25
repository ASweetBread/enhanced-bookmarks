/**
 * @description 记录面板对象
 * @param { number } offsetX 
 * @param { number } offsetY 
 * @param { IEnhancedBookmarkItem[] } arraySelection 
 * @returns 
 */
function Panel(offsetX=0, offsetY=0, arraySelection) {
	let /** @type { Range } */
		selectionInner = null,
		/**
		 * @description 定时关闭面板 
		 * @type { number } 
		 */
		timeout = null
	const panel = document.createElement("div");
	panel.style.position = "absolute";
	panel.style.zIndex = 999999;
	panel.className = "selection-panel";

	const getPanelStatus = () => {
		return panel.style.display === "block"
	}
	/**
	 * @param { Range } selection 
	 * @param { MousePosition } mousePosition 
	 */
	const appendPanel = (selection, mousePosition) => {
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
		<textarea id="__bookmark-textarea" class="__note-item-content-text __bookmark-content-textarea" placeholder="请输入备注"></textarea>
		<div class="__bookmark-buttons">
			<button id="__bookmark-button">添加</button>
			<button id="__cancel-button">取消</button>
		</div>
		`
		const textarea = recordPanel.querySelector("#__bookmark-textarea");
		const button = recordPanel.querySelector("#__bookmark-button");
		const cancelButton = recordPanel.querySelector("#__cancel-button");
		const tipDiv = panel.querySelector(".__bookmark-tip");

		// 随着输入框高度变化自动调整高度
		const resizeTextarea = delay(() => {
			textarea.style.height = textarea.scrollHeight + "px";
		}, 300)
		textarea.addEventListener("input", resizeTextarea)

		nodeMoveEvent(tipDiv, (e)=>{
			console.log('movedown')
			const startX = e.clientX;
			const startY = e.clientY;
			const panelStartX = panel.offsetLeft;
			const panelStartY = panel.offsetTop;
			return move = (event) => {
				console.log('move')
				const endX = event.clientX;
				const endY = event.clientY;
				const offsetX = endX - startX;
				const offsetY = endY - startY;
				panel.style.left = `${panelStartX + offsetX}px`;
				panel.style.top = `${panelStartY + offsetY}px`;
			}
		})

		const lineations = RenderLineation.RenderItem({
			startContainer: selectionInner.startContainer,
			startOffset: selectionInner.startOffset,
			endContainer: selectionInner.endContainer,
			endOffset: selectionInner.endOffset
		})
		button.addEventListener("click", () => {
			const selectionobj = selectionObj(selectionInner);
			/**
			 * @type { IEnhancedBookmarkItem } 存储的选中文本对象
			 */
			const item = {
				text: textarea.value.trim(),
				selection: tip,
				id: arraySelection.length,
				container: selectionobj.container,
				startOffset: selectionobj.startOffset,
				endOffset: selectionobj.endOffset
			}

			RenderLineation.AddLineation(lineations)
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