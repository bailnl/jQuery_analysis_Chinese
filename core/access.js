define([
	"../core"
], function( jQuery ) {

// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
// 多功能的方法来获取和设置值的集合
// 如果 value 是一个执行的函数 (可选)

// elems 元素
// fn 功能处理函数  比如 jQuery.attr jQuery.prop
// key 键
// value 值
// chainable 链式操作
// emptyGet  没有选中到元素的返回值
// raw 标识 value 是否为原始数据，如果raw是true，说明 value 是原始数据，如果是false，说明 value 是个函数
var access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
        // key 是否为空
		bulk = key == null;

	// Sets many values
	// 设置多个值
    // 如果 key 是对象
	if ( jQuery.type( key ) === "object" ) {
        // 可链式操作
		chainable = true;
        // 迭代对象
		for ( i in key ) {
            // 递归调用jQuery.access 设置值
			access( elems, fn, i, key[i], true, emptyGet, raw );
		}

	// Sets one value
    // 设置 单个值
    // value 不为空
    // 是一个设置的操作
	}
    else if ( value !== undefined ) {
        // 可链式操作
		chainable = true;

        // 如果 value 不是函数
		if ( !jQuery.isFunction( value ) ) {
            // 那么 value 就是原始数据
			raw = true;
		}

        // bulk为true，那么 key的为 空
        // 如果key为空的处理
		if ( bulk ) {
			// Bulk operations run against the entire set
            // 如果 value 不是函数 或者 强制 raw 为 true
            // 说明 value 是原始数据
            // $('body').attr(null,{ a:1, b:2 })
            // data.js 走这里
            if ( raw ) {
                // 改变处理函数fn并把 value传入
				fn.call( elems, value );
                // 注销掉 fn
				fn = null;

			// ...except when executing function values
            // 如果 value 是一个函数
			} else {
                // 保存一下处理函数
				bulk = fn;
				fn = function( elem, key, value ) {
                    // 改变一下上下文
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

        // 如果 fn 存在，调用每一个元素
        // data.js 不走这里
		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn( elems[i], key,
                    // value 是否为 原始值
                    raw ?
                        // 如果是 直接传入 原始值
                        value :
                        // 否则为每个元素调用 value 函数
                        // 例如 $('body').attr('a',function(i,v){ })
                        // 但是 会先调用 jQuery.attr( elems[i], key ) 返回 value 并传入 回调
                        value.call( elems[i], i, fn( elems[i], key ) )
                );
			}
		}
	}

    // 如果 chainable 为 true，那么就是set操作
	return chainable ?
        // 返回元素为后续的链式操作
		elems :
		// Gets
        // 获取操作
		bulk ?
            // 如果 bulk 为true ，改成 处理函数fn 的上下文
			fn.call( elems ) :
            // 否则根据元素的长度做操作
			len ?
                // 当 elems 的长度 大于 0 时，获取第一个元素
                fn( elems[0], key ) :
                // 否则返回 emptyGet (没有元素的返回值)
                emptyGet;
};

return access;

});
