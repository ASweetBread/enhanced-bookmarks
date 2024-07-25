/**
 * @description 笔记面板
 * @param { IEnhancedBookmarkItem[] } arraySelection 
 */
function NotePanel(arraySelection) {
	/** @description 是否处于编辑状态-用来避免重复打开记录面板 */
	let isEdit = false;
	const initNodePanel = () => {
		const panel = document.createElement("div");
		panel.style.position = "fixed";
		panel.style.left = "0px";
		panel.style.top = "0px";
		panel.style.zIndex = 999999;
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
			<div class="__note-item-zoom" ></div>
		</div>
		`
		const contentDiv = panel.querySelector(".__note-content");

		/**
		 * @description 为笔记面板渲染一条记录
		 * @param { IEnhancedBookmarkItem } item 
		 */
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
					<textarea class="__note-item-content-text" id="__note-textarea-${item.id}" placeholder="请输入备注">${item.text}</textarea>
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
				textarea.style.height = textDiv.offsetHeight + "px";
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
				item.text = text;
				setStorage(hrefGlobal, arraySelection)
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
	/** @param { IEnhancedBookmarkItem } item */
	const insertNoteItem = (item) => {
		noteItemInit(item)
	}
	const zoomDiv = panel.querySelector(".__note-item-zoom");
	let zoomFunction = null
	zoomDiv.addEventListener("mousedown",(e)=> {
		const startX = e.clientX;
		const startY = e.clientY;
		const startWidth = panel.offsetWidth;
		const startHeight = panel.offsetHeight;
		zoomFunction = (e)=>{
			const endX = e.clientX;
			const endY = e.clientY;
			const width = endX - startX;
			const height = endY - startY;
			panel.style.width = `${startWidth + width}px`;
			panel.style.height = `${startHeight + height}px`;
		}
		document.addEventListener('mousemove',zoomFunction)
	})
	zoomDiv.addEventListener('mouseup',(e)=>{
		console.log(zoomFunction,'mouseup')
		document.removeEventListener('mousemove',zoomFunction)
		zoomFunction = null
	})

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