## 增强浏览器书签

### 说明：

本插件的记录内容存储在本地，清除浏览器缓存时需要注意

### 使用：

1.划线，点击记录可以编写划线部分的笔记

2.右键菜单，打开本页面的笔记面板，笔记面板中的评论可以再编辑，笔记面板可以移动

### 剩余未完成：

- [X]  笔记面板不触发记录事件❗
- [X]  笔记面板数据的二次编辑、删除功能
- [ ]  笔记面板调整大小
- [ ]  记录面板调整位置
- [ ]  导出功能❗
- [ ]  导入功能❗
- [X]  笔记打开
- [X]  划线位置、容器记录
- [X]  划线效果渲染
- [ ]  点击划线打开笔记面板
- [ ]  `bug1`：存储与获取节点时排除非文本节点（为了兼容其他浏览器插件）
- [x]  `bug2`: 深度节点不能获取
- [ ]  划线失效情况处理

### 难点记录：

划线效果

1.获取划线文本位置（range、文本节点-深度遍历）

2.多行划线效果如何拆分（range只能提供一个块状区域-多行拆分）

3.持久化与反显（路径索引数组）
