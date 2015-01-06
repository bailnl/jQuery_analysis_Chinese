define([
	"../core",
	"../var/rnotwhite",
	"./accepts"
], function( jQuery, rnotwhite ) {

function Data() {
	// Support: Android<4,
	// Old WebKit does not have Object.preventExtensions/freeze method,
	// return new empty object instead with no [[set]] accessor
	// 为 this.cache 添加一个 0 属性
	// 返回一个空对象，而没有 [[set]] accessor
	// 只能获取不能设置
	// 用于不能设置 data 情况返回空对象
	Object.defineProperty( this.cache = {}, 0, {
		get: function() {
			return {};
		}
	});

	// expando 用于生成数据关联属性的唯一标识
	// 类似 <div jQuery2110344250543936482250.1582788177630381="1"></div> 这种
	// 实际是在 对象上添加
	this.expando = jQuery.expando + Math.random();
}
// uid 用于生成数据关联属性值的唯一标识
// jQuery2110344250543936482250.1582788177630381="1"
// 每次使用时自增
Data.uid = 1;
// 确定一个对象是否可以添加数据缓存
Data.accepts = jQuery.acceptData;

Data.prototype = {
	key: function( owner ) {
		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return the key for a frozen object.
		// 在现代浏览器中可以接受非元素节点添加data
		// 但是不应该出现这种情况，见  http://bugs.jquery.com/ticket/8335
		// key永远返回0, 在cache取得一个不能被修改的空对象
		if ( !Data.accepts( owner ) ) {
			return 0;
		}

		//
		var descriptor = {},
			// Check if the owner object already has a cache key
			// 检查对象是否有cache key
			unlock = owner[ this.expando ];

		// If not, create one
		// 如果没有，创建一个
		if ( !unlock ) {
			// 取一个key值，并自增
			unlock = Data.uid++;

			// Secure it in a non-enumerable, non-writable property
			// 定义不可枚举，不可写的属性，避免被修改
			try {
				descriptor[ this.expando ] = { value: unlock };
				Object.defineProperties( owner, descriptor );

			// Support: Android<4
			// Fallback to a less secure definition
			// 当不支持 defineProperties 时，回退到不安全的定义，使用 jQuery.extend 来完成
			} catch ( e ) {
				descriptor[ this.expando ] = unlock;
				jQuery.extend( owner, descriptor );
			}
		}

		// Ensure the cache object
		// 确定是否有缓存对象
		if ( !this.cache[ unlock ] ) {
			// 如果没有创建一个空对象
			this.cache[ unlock ] = {};
		}

		// 返回 key
		return unlock;
	},
	set: function( owner, data, value ) {
		var prop,
			// There may be an unlock assigned to this node,
			// if there is no entry for this "owner", create one inline
			// and set the unlock as though an owner entry had always existed
			// 有可能是有一个 unlock 分配给该节点
			// 如果没有 owner 的信息，通过this.key()创建一个并设置 unlock，
			// 使得 cache 存在
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		// Handle: [ owner, key, value ] args
		// 处理 data 是字符串的情况
		if ( typeof data === "string" ) {
			// 直接设置值
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		// 处理 data 是 对象的情况
		} else {
			// Fresh assignments by object are shallow copied
			// 当 cache 为空时
			if ( jQuery.isEmptyObject( cache ) ) {
				// 使用 extend 浅拷贝
				jQuery.extend( this.cache[ unlock ], data );
			// Otherwise, copy the properties one-by-one to the cache object
			// 否则使用 for 一个一个的复制到缓存对象
			} else {
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
		}
		// 返回 owner 的 cache
		return cache;
	},
	get: function( owner, key ) {
		// Either a valid cache is found, or will be created.
		// New caches will be created and the unlock returned,
		// allowing direct access to the newly created
		// empty data object. A valid owner object must be provided.
		// 在缓存中查找，或者创建。
		// 将创建新的cache和unlock并返回，
		// 允许直接访问新创建的空数据对象
		// 必须提供一个有效的 owner
		var cache = this.cache[ this.key( owner ) ];

		// 如果 key 不存在， 那么取得 cache
		// 否则从 cache 找到 key 对应的 value
		return key === undefined ?
			cache : cache[ key ];
	},
	access: function( owner, key, value ) {
		// 用于 owner 的 cache 临时存储
		var stored;
		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		// 以下情况：
		// 1. key 没有指定    2. 指定了 key ,没指定value
		// 采用 get 方法，get方法来确定返回值
		// 1. 整个缓存对象 2.指定 key 对应的 value

		// 如果 key 为空 或者 指定了key没有指定 value
		if ( key === undefined ||
				((key && typeof key === "string") && value === undefined) ) {

			// 取得 cache
			stored = this.get( owner, key );

			// 如果 cache 不为 undefined 那么返回 cache
			// 否则按照 key 不为驼峰处理， 转换后获取 cache
			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase(key) );
		}

		// [*]When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		// 当 key 不是一个字符串时 或 一键值对
		// 则设置 或者 扩展(现有对象)
		// 1. 对象  2. 一键值对
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		// 由于 set 有两种类型的可能，
		// 预期返回的数据采用了哪一种可能
		// 如果 value 不为 空 返回 value 否则 key
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name, camel,
			// 取得key
			unlock = this.key( owner ),
			// 取得缓存
			cache = this.cache[ unlock ];

		// 如果 key 为空
		if ( key === undefined ) {
			// 清空缓存
			this.cache[ unlock ] = {};

		} else {
			// Support array or space separated string of keys
			// 支持数组或者用空格隔开的字符串形式的 key
			// 如果是数组
			if ( jQuery.isArray( key ) ) {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.

				// 如果 name 是数组 key 的 keys
				// 将key通过map调用jQuery.camelCase转换成驼峰表示法
				// "add-num" => "addNum"
				// 并用 concat 连接起来
				// ["del-num","add-num"] => ["del-num","add-num","delNum","addNum"]
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				// 如果 key 是单个的， 将 key 转换为驼峰表示法
				camel = jQuery.camelCase( key );
				// Try the string as a key before any manipulation
				// 尝试 key 是否为 cache 的属性
				if ( key in cache ) {
					// 组合起来
					name = [ key, camel ];
				} else {
					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					// 将转换后的key传给name
					name = camel;
					// 再次尝试 转换后的key是否是cache的属性
					name = name in cache ?
						// 如果是，那么保存为数组
						// 否则 转换后的key 当以空白为分隔符的多个key值  "addNum delNum"
						// 用正则 rnotwhite 通过 match 转换成数组 如果匹配失败使用空数组
						[ name ] : ( name.match( rnotwhite ) || [] );
				}
			}

			// ["del-num","add-num"] => ["del-num","add-num","delNum","addNum"]
			// "add-num" => ["add-num","addNum"]
			// "addNum" => ["addNum"]
			// "add-num delNum" => ["addNum","delNum"]
			// !("xxx" in cache) => []

			// 遍历处理后的key
			i = name.length;
			while ( i-- ) {
				// 删除对应的属性
				delete cache[ name[ i ] ];
			}
		}
	},
	// 此方法判断 owner 是否有data
	hasData: function( owner ) {
		// 求反判断是否为空对象
		return !jQuery.isEmptyObject(
			// 尝试去取 owner 的 cache ，如果没有返回 {}
			this.cache[ owner[ this.expando ] ] || {}
		);
	},
	// 此方法用于从 cache
	discard: function( owner ) {
		// 如果 owner 的 cache 关联属性存在
		if ( owner[ this.expando ] ) {
			// 那么直接删除 cache 中 key(unlock) 属性
			delete this.cache[ owner[ this.expando ] ];
		}
	}
};

return Data;
});
