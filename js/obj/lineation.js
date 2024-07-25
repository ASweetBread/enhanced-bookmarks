/** @description 划线效果对象 */
function lineationObj() {
	/**
	 * @type { HTMLDivElement[] }
	 * @description 存储的划线节点
	 */
	let lineations = [];

	/**
	 * @param { string } startContainer 容器id
	 * @returns { Promsie<Node> }
	 */
	async function findElement(startContainer) {
		let findContainer = document.getElementById(startContainer.id)
		if(findContainer) {
			await new Promise(async (resolve, reject) => {
				for (let i in startContainer.pathArray ) {
					if(!findContainer.childNodes[startContainer.pathArray[i]]) {
						await new Promise((resolve, reject) => {
							const observer = new MutationObserver(() => {
								resolve()
								observer.disconnect()
							})
							observer.observe(findContainer, { childList: true })
						})
					}
					findContainer = findContainer.childNodes[startContainer.pathArray[i]]
					if(Number(i) === startContainer.pathArray.length - 1) {
						resolve()
					}
				}
			}) 
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

	/** @param { HTMLDivElement[] } lineations */
	function AddLineation(lineations) {
		lineations.push(...lineations)
	}

	/**
	 * @description 将所有的划线渲染对象渲染到页面
	 * @param { IEnhancedBookmarkItem[] } arraySelection 
	 */
	function Render(arraySelection) {
		if(arraySelection.length === 0) {
			return
		}
		if(lineations.length > 0) {
			removeLineation()
		}
		
		arraySelection.map(async item => {
			const startContainer = await findElement(item.container.startContainer)
			const endContainer = await findElement(item.container.endContainer)
			lineations.push(...RenderItem({
				startContainer: startContainer,
				startOffset: item.startOffset,
				endContainer: endContainer,
				endOffset: item.endOffset
			})) 
		})
	}
	/**
	 * @description 渲染多个划线节点到页面
	 * @param { RenderItem } item 
	 * @returns { HTMLDivElement[] | null }
	 */
	function RenderItem(item) {
		if(item.startContainer && item.endContainer) {
			/** @type { Range[] } */
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