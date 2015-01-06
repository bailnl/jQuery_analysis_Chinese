define([
	"../core"
], function( jQuery ) {

/**
 * Determines whether an object can have data
 * 确定一个对象是否可以添加数据缓存
 */
jQuery.acceptData = function( owner ) {
	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	/* jshint -W018 */

	// 仅接受 元素对象，文档对象以及js对象
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};

return jQuery.acceptData;
});
