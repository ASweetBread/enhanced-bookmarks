/**
 * @description 笔记文本对象
 */
declare interface IEnhancedBookmarkItem {
    text: string;
    selection: string;
    id: number;
    container: string;
    startOffset: number; 
    endOffset: number;
}
/**
 * @description 鼠标位置对象
 */
declare interface MousePosition {
    x: number;
    y: number;
}

/** @description 用来渲染划线节点的单个对象 */
declare interface RenderItem {
    startContainer: Node;
    startOffset: number;
    endContainer: Node;
    endOffset: number;
}

/** @description 消息类型 */
declare interface SENDERMESSAGETYPE {
    OPEN: string;
    CHECKFAVORITES: string;
}

/** @description 常量 */
declare interface CONSTANTS {
    CONTEXTMENUS: { id: string, title: string }
    SENDERMESSAGE: SENDERMESSAGETYPE
}