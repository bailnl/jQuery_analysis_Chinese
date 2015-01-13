define([
	"./core",
	"./var/rnotwhite",
	"./core/access",
	"./data/var/dataPriv",
	"./data/var/dataUser"
], function( jQuery, rnotwhite, access, dataPriv, dataUser ) {

//	Implementation Summary
//
//	1. Enforce API surface and semantic compatibility with 1.9.x branch
//	2. Improve the module's maintainability by reducing the storage
//		paths to a single mechanism.
//	3. Use the same single mechanism to support "private" and "user" data.
//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
//	5. Avoid exposing implementation details on user objects (eg. expando properties)
//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

//	执行摘要
//
//	1. 强制API表现和语义 与 1.9.x分支兼容
//	2. 通过简单机制来减少路径，提高模块的可维护性
//	3. 使用相同的简单机制来支持"private" 和 "user"的数据.
//	4. 不会将"private"数据暴露给用户代码 (TODO: Drop _data, _removeData)
//	5. 避免在用户对象上暴露实现细节(例如. expando properties)
//	6. 在2014为实现升级到WeakMap(ES6)提供一个清晰的路径


// 匹配以{或[开头 内容为[A-Za-z0-9_][^A-Za-z0-9_] 以}或[结尾的字符串
var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
    // 匹配 A-Z
	rmultiDash = /([A-Z])/g;

// 用于设置 HTML5 data-* 属性到cache中，并返回 属性值
function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	// 如果在cache没有找到数据，
    // 尝试从  HTML5 data-* 属性中 查找

    // data 如果为空 且  元素类型为 节点
	if ( data === undefined && elem.nodeType === 1 ) {
        // 将 key 转换成 HTML5 data-* 属性
        // addName => data-add-name
		name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
        // 获取属性值
		data = elem.getAttribute( name );

        // 如果 数据的类型为 string, 说明有其属性
		if ( typeof data === "string" ) {
			try {
                // 尝试转换属性值成原始值
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
                    // 如果不会更改字符串，只转换为数字
					+data + "" === data ? +data :
                    // rbrace 测试是否为 json 字符串，jQuery.parseJSON 来解析成 json
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
                    // 否则当是普通的字符串
					data;
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
            // 确定我们set data, 所以之后不会改变
            // "<div data-aaa='abc'></div>"
            // $($0).data('aaa')  => 'abc'
            // $($0).attr('data-aaa','xxx')
            // $($0).data('aaa')  => 'abc'
			dataUser.set( elem, key, data );

        //否则 undefined
		} else {
			data = undefined;
		}
	}
    // 返回数据
	return data;
}

jQuery.extend({
    // 判断是有 data
	hasData: function( elem ) {
        // 从来 User 中判断，如果没有则在 Priv 中判断
		return dataUser.hasData( elem ) || dataPriv.hasData( elem );
	},

    // 设置或者获取 data
	data: function( elem, name, data ) {
        // 通过 access 方法来做多功能操作
		return dataUser.access( elem, name, data );
	},

    // 删除 data
	removeData: function( elem, name ) {
        // 从 User 中删除
		dataUser.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
    // _data 和 _removeDate 已经被替换，这些可以被废弃，直接调用dataPriv的方法

    // 设置或者获取 dataPriv data
	_data: function( elem, name, data ) {
		return dataPriv.access( elem, name, data );
	},
    // 删除 dataPriv data
	_removeData: function( elem, name ) {
		dataPriv.remove( elem, name );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var i, name, data,
            // 获取第一元素
			elem = this[ 0 ],
            // 获取元素的所有的属性  attributes
			attrs = elem && elem.attributes;
		// Gets all values
        // 如果没有key说明是获取所有的 value
		if ( key === undefined ) {
            // 元素长度存在
			if ( this.length ) {
                // 获取所有的 cache data
				data = dataUser.get( elem );

                // 如果是 元素 节点  并且是   "没有获取过" data-* 属性时
				if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
                    // 遍历元素的 attributes的每个属性
					while ( i-- ) {
						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
                            // 查找 data-* 的属性
							if ( name.indexOf( "data-" ) === 0 ) {
                                // 将元素转换为 驼峰的写法
								name = jQuery.camelCase( name.slice(5) );
                                // 获取 data-* 的属性值
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
                    // 将设置为 "获取过" data-* 属性
					dataPriv.set( elem, "hasDataAttrs", true );
				}
			}

            // 返回 data cache
			return data;
		}

		// Sets multiple values
        // 设置多个属性值
		if ( typeof key === "object" ) {
            // 遍历jQuery对象
			return this.each(function() {
                // 为每一个dom元素设置 cache data
				dataUser.set( this, key );
			});
		}

        // 设置
		return access( this, function( value ) {
			var data,
                // 转驼峰
				camelKey = jQuery.camelCase( key );

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
            // 调用的 jQuery对象(匹配的元素) 不为空
            // (也因此会有一个元素在在 this[ 0 ] 上 )
            // 且 value 不是 未定义
            // 一个空的jQuery对象，将 elem = this[ 0 ] 会导致结果为 未定义
            // 如果尝试去获取 数据缓存，会抛出一个异常。
			if ( elem && value === undefined ) {
				// Attempt to get data from the cache
				// with the key as-is
                // 尝试直接用 key 在 cache中获取
				data = dataUser.get( elem, key );
                // 如果不为空
				if ( data !== undefined ) {
                    // 返回数据
                    return data;
				}

				// Attempt to get data from the cache
				// with the key camelized
                // 尝试用转换成的驼峰 key 在 cache 中获取
				data = dataUser.get( elem, camelKey );
                // 如果不为空
				if ( data !== undefined ) {
                    // 返回数据
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
                // 尝试在 HTML5 自定义属性 data-* 中获取 data
				data = dataAttr( elem, camelKey, undefined );
                // 如果不为空
				if ( data !== undefined ) {
                    // 返回数据
                    return data;
				}

				// We tried really hard, but the data doesn't exist.
                // 我们真的很努力，但是该数据不存在。
				return;
			}

			// Set the data...
            // 设置 data
            // 遍历元素
			this.each(function() {
				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
                // 首先，尝试用 驼峰key 去复制或者是引用已存储的数据
				var data = dataUser.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
                // HTML5 data-* 属性互操作，
                // 我们不得不存储 驼峰key 的 属性名称
                // 这可能不适合所有的属性
				dataUser.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
                // 在属性中有破折号的情况下，我们也需要存储副本
				if ( key.indexOf("-") !== -1 && data !== undefined ) {
					dataUser.set( this, key, value );
				}
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
        // 遍历jQuery对象
		return this.each(function() {
            // 为每一个元素删除 对应的 data
			dataUser.remove( this, key );
		});
	}
});

return jQuery;
});
