define([
	"../core",
	"../core/init",
	"../deferred"
], function( jQuery ) {

// The deferred used on DOM ready
// 在dom准备好时使用
var readyList;

jQuery.fn.ready = function( fn ) {
	// Add the callback
    // 增加回调
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend({
	// Is the DOM ready to be used? Set to true once it occurs.
    // dom是否ready? 当 ready 时将其设置为true
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
    // 一个计数器统计有多少项等待 ready 后事件触发
	readyWait: 1,

	// Hold (or release) the ready event
    // 暂停 或者 恢复 ready事件
	holdReady: function( hold ) {
		if ( hold ) {
            // 需要暂停，且等待数加1
			jQuery.readyWait++;
		} else {
            // 恢复 ready
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
    // 处理 dom已经ready
	ready: function( wait ) {
        // wait 表示是否需要等待

		// Abort if there are pending holds or we're already ready
        // 如果还有等待 或者是 已经ready 直接中止（return）

        // 处理  jQuery.holdReady(false); 的情况 表示恢复一次 ready 事件

        // 如果 wait === true （需要等待）
        // 判断 Wait计数器是否还有 等待数量， 如果有 直接中止

        // 否则 wait !== true （不需要等待）
        // 判断 isReady 是否为true ，当 isReady 为 true时表示 dom 已经 ready， 直接中止
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
            // 换句话说 jQuery.readyWait 大于１（需要等待） 或者 jQuery.isReady 为 true
			// 就直接返回 中止掉
            return;
		}

		// Remember that the DOM is ready
        // 标记为dom已经ready

        // 当走到这里时，wait不为true,且dom还没有ready,不需要等待
        // 或者 readyWait 为 1（readyWait默认为1） 也就是不需要待
        // 设置为true表明 dom已经ready了
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
        // 如果一个正常的dom ready事件被触发，减量，需要等待

        // 如果 wait 不为 true 且 jQuery.readyWait自减 还大于0时
        // 直接中止，说明还 需要等待
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
        // 执行，如果绑定有方法
        // 转换成 resolve ，并转入上下文以及 参数　
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
        // 触发所有的绑定事件
		if ( jQuery.fn.triggerHandler ) {
            // 触发 document 的 ready 事件
            jQuery( document ).triggerHandler( "ready" );
            // 取消绑定document的ready事件
			jQuery( document ).off( "ready" );
		}
	}
});

/**
 * The ready event handler and self cleanup method
 * ready事件处理以及事件取消绑定
 */
function completed() {
    // 事件取消绑定
	document.removeEventListener( "DOMContentLoaded", completed, false );
	window.removeEventListener( "load", completed, false );
    // ready 事件处理
	jQuery.ready();
}

jQuery.ready.promise = function( obj ) {
    // 如果 ready列表不存在
	if ( !readyList ) {
        // 创建一个延迟对象
		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called
        // 捕获 $(document).ready() 调用过的情况
		// after the browser event has already occurred.
		// We once tried to use readyState "interactive" here,
        // 我们曾经在这里尝试使用 readyState 做 interactive
		// but it caused issues like the one
        // 但它引起类似的问题
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
        // 来自 ChrisS 的发现 地址： http://bugs.jquery.com/ticket/12282#comment:15
        // 判断 document 的readyState 是否为 complete (完成)
        if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
            // 以异步方式使得脚本处理延迟ready
			setTimeout( jQuery.ready );

		} else {

            // 绑定 DOMContentLoaded 以及 load 事件
			// Use the handy event callback
            // 使用方便的事件回调
            // DOMContentLoaded dom加载完毕事件
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
            // 回退到 window.onlad 事件，也将起作用
			window.addEventListener( "load", completed, false );
		}
	}
    // 返回延迟对象的 promise
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
// 即使用户没有做准备也启动 dom　ready 检查
// 调用 jQuery.ready.promise 开始 DOM ready
jQuery.ready.promise();

});
