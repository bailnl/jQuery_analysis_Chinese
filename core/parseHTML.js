define([
	"../core",
	"./var/rsingleTag",
	"../manipulation" // buildFragment
], function( jQuery, rsingleTag ) {

// data: string of html
// data: html字符串
// context (optional): If specified, the fragment will be created in this context,
// context (可选): 指定那么文档碎片创建的上下文
// defaults to document
// 默认为document
// keepScripts (optional): If true, will include scripts passed in the html string
// keepScripts (可选): 如果为真，html字符串将包含 script标签
jQuery.parseHTML = function( data, context, keepScripts ) {
	// 如果data不存在或者 data不是string类型
	if ( !data || typeof data !== "string" ) {
		// 直接返回null
		return null;
	}
	// 如果 context 为boolean 那么就是 ( data, keepScripts ) 情况
	if ( typeof context === "boolean" ) {
		// 将 context 赋值给 keepScripts
		keepScripts = context;
		// context 赋值为 false
		context = false;
	}
	// context 为 false 时, context 默认 document
	context = context || document;

	// 用正则 rsingleTag 匹配 data 判断是否为 简单的标签
	var parsed = rsingleTag.exec( data ),
		// 当 keepScripts 不为 true 时，用 [] 来存放 script标签
		scripts = !keepScripts && [];

	// Single tag
	// 简单的标签
	if ( parsed ) {
		// 直接用createElement创建标签放进数组里并返回
		return [ context.createElement( parsed[1] ) ];
	}

	// 处理复杂标签的情况
	parsed = jQuery.buildFragment( [ data ], context, scripts );

	// 处理不需要script标签的情况
	if ( scripts && scripts.length ) {
		// 将 script 标签在 html中删除
		jQuery( scripts ).remove();
	}

	//  返回dom元素数组
	return jQuery.merge( [], parsed.childNodes );
};

return jQuery.parseHTML;

});
