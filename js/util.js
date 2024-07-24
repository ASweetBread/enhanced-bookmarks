async function askNotificationPermission() {
    // 检查浏览器是否支持通知
    if (!("Notification" in window)) {
      console.log("此浏览器不支持通知。");
      return false;
    }
    let permission = await Notification.requestPermission()
    return permission === "granted";
  }
  /**
   * @description 实现面板拖动功能
   * @param {*} node 节点 
   * @param {*} callback mousemove的回调函数
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