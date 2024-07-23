async function askNotificationPermission() {
    // 检查浏览器是否支持通知
    if (!("Notification" in window)) {
      console.log("此浏览器不支持通知。");
      return false;
    }
    let permission = await Notification.requestPermission()
    return permission === "granted";
  }
  