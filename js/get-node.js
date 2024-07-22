// 获取 start 到 end 深度优先遍历之间的所有 Text Node 节点
function getTextNodesByDfs(start, end) {
    if (start === end) return [start]
    const iterator = nodeDfsGenerator(start, false)
    const textNodes = []
    let value = iterator.next().value, whileBreaker = true
    while (value && whileBreaker) {
        if(value === end) {
            whileBreaker = false
        }
        if (value.nodeType === 3) {
            textNodes.push(value)
        }
        value = iterator.next().value
    }
    
    return textNodes
  }
  
  // 返回节点的深度优先迭代器
  // 对于有子节点的 Node 会遍历到两次，不过 Text Node 肯定没有子节点，所以不会重复统计到
  function * nodeDfsGenerator(node, isGoBack = false) {
    yield node
    // isGoBack 用于判断是否属于子节点遍历结束回退到父节点，如果是那么该节点不再遍历其子节点
    if (!isGoBack && node.childNodes.length > 0) {
      yield * nodeDfsGenerator(node.childNodes[0], false)
    } else if (node.nextSibling) {
      yield * nodeDfsGenerator(node.nextSibling, false)
    } else if (node.parentNode) {
      yield * nodeDfsGenerator(node.parentNode, true)
    }
  }