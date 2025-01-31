console.log("get-lineation-array.js is running");

// 获取选中区域的行内范围数组
function getLineationArray(item) {
  const { startContainer, endContainer, startOffset, endOffset } = item
  const nodeArray = getTextNodesByDfs(startContainer,endContainer)
  let rangeArray = []
  for (let i = 0; i < nodeArray.length; i++) {
    let currentItem = { 
      container: nodeArray[i], 
      startOffset: i === 0? startOffset : 0, 
      endOffset: nodeArray[i] === nodeArray[nodeArray.length - 1]? endOffset : nodeArray[i].length 
    }
    const rangesCurrent = splitRange(currentItem.container, currentItem.startOffset, currentItem.endOffset)
    rangeArray.push(...rangesCurrent)
  }
  return rangeArray
}

// 将一个跨行的 range 切割为多个不跨行的 range
function splitRange(node, startOffset, endOffset) {
    const range = document.createRange()
    const rowTop = getCharTop(node, startOffset)
    // 字符数小于两个不用判断是否跨行
    // 头尾高度一致说明在同一行
    if ((endOffset - startOffset < 2) || rowTop === getCharTop(node, endOffset - 1)) {
      range.setStart(node, startOffset)
      range.setEnd(node, endOffset)
      return [range]
    } else {
      const last = findRowLastChar(rowTop, node, startOffset, endOffset - 1)
      range.setStart(node, startOffset)
      range.setEnd(node, last + 1)
      const others = splitRange(node, last + 1, endOffset)
      return [range, ...others]
    }
  }
  
  // 二分法找到 range 某一行的最右字符
  function findRowLastChar(top, node, start, end) {
    if (end - start === 1) {
      return getCharTop(node, end) === top ? end : start
    }
    const mid = (end + start) >> 1
    return getCharTop(node, mid) === top
      ? findRowLastChar(top, node, mid, end)
      : findRowLastChar(top, node, start, mid)
  }
  
  // 获取 range 某个字符位置的 top 值
  function getCharTop(node, offset) {
    return getCharRect(node, offset).top
  }
  
  // 获取 range 某个字符位置的 DOMRect
  function getCharRect(node, offset) {
    const range = document.createRange()
    range.setStart(node, offset)
    range.setEnd(node, offset + 1 > node.textContent.length ? offset : offset + 1)
    return range.getBoundingClientRect()
  }
  