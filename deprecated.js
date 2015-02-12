define([
	"./core",
	"./traversing"
], function( jQuery ) {

// The number of elements contained in the matched element set
// 匹配的元素集合中包含的元素数量
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;

});
