define([
	"./var/arr",
	"./var/slice",
	"./var/concat",
	"./var/push",
	"./var/indexOf",
	"./var/class2type",
	"./var/toString",
	"./var/hasOwn",
	"./var/support"
], function( arr, slice, concat, push, indexOf, class2type, toString, hasOwn, support ) {
	 // 模块化
	// IDE  集成开发环境

var
	// Use the correct document accordingly with window argument (sandbox)
	// 从参数 window 获取正确的相应的 document
	document = window.document,

	// jQuery版本号
	version = "@VERSION",

	// Define a local copy of jQuery
	// 定义一份局部的jQuery的拷贝
	//  $('div')
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// jQuery 对象是实际上只是 '加强' 的初始化构造函数
		// Need init if jQuery is called (just allow error to be thrown if not included)
		// 如果调用 jQuery，需要init (如果不是包括，只允许错误抛出)

		// 可以看出来，jQuery对象其实是jQuery.fn.init是实例
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	// 此正则匹配头尾的空白符
	// 也匹配全角字符
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	// 用于匹配ie
	rmsPrefix = /^-ms-/,

	// 用于匹配类似-webkit-transform中的-w -t之类的
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	// jQuery.camelCase 使用 fcamelCase 作为 replace() 的回调函数
	fcamelCase = function( all, letter ) {
		//将$1转换为大写并返回
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	// jQuery当前的版本号
	jquery: version,

	// 修正jQuery的构造函数的指针
	constructor: jQuery,

	// Start with an empty selector
	// 保存jQuery对象的选择器 默认为 ""
	selector: "",

	// The default length of a jQuery object is 0
	// jQuery对象是一个类数组，默认 长度为 0
	length: 0,

	// 把jQuery对象转换成 dom元素集合
	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	// 检索匹配jQuery对象获取对应的DOM元素 或者
	// 检索匹配jQuery对象设置为一个干净的数组 (与toArray一样)
	// 此方法用于获取jQuery中某个dom元素, 当无参时获取全部dom元素的集合
	get: function( num ) {
		// num不为空
		return num != null ?

			// Return just the one element from the set
			// 返回匹配的某个dom元素
			// 当参数 num 小于0时从 元素匹配集合中(jQuery对象是一个类数组) 末尾开始倒数
			// 否则从 0 开始计数
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			// 当 num 为空时返回所有的元素在一个干净的数组
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// 将一个元素压入jQuery对象栈中
	// (returning the new matched element set)
	// (返回一个新的匹配元素的集合)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		// 建立一个新的jQuery 匹配元素集合
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		// 旧对象添加到堆栈上(作为参考)
		// jQuery中的回溯设计
		// 保存旧对象
		ret.prevObject = this;
		// 保存旧对象的 context 属性在新的jQuery对象的 context
		// 上下文不变
		ret.context = this.context;

		// Return the newly-formed element set
		// 返回新的元素集(jQuery对象)
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// 匹配集合中执行的每个元素的回调。
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	// 你可以使用参数数组args，但这只是在内部使用
	// 此方法用于遍历当前jQuery对象，为每个匹配元素执行一个函数。
	each: function( callback, args ) {
		//返回  jQuery 工具方法 each 把当前的jQuery对象、以及回调函数和args数组作为参数传入执行结果
		return jQuery.each( this, callback, args );
	},

	// 此方法用于遍历当前jQuery对象，产生一个包含新的jQuery对象
	map: function( callback ) {
		// 经过工具方法 map 来遍历当前jQuery对象，返回一个数组(合并每个元素调用 callback 的返回值)
		// 将返回的数组 通过 pushStack 方法产生一个新的jQuery对象并返回
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	// 取指定下标范围的元素，产生一个新的jQuery对象
	slice: function() {
		// 调用数组的 slice 方法 取指定下标范围的元素，通过 pushStack 方法产生一个新的jQuery对象并返回
		return this.pushStack( slice.apply( this, arguments ) );
	},

	// 取jQuery对象中的第一个元素
	first: function() {
		return this.eq( 0 );
	},

	// 取jQuery对象中的最后一个元素
	last: function() {
		return this.eq( -1 );
	},

	// 匹配指定索引的元素 (参数i为负数时，从后面匹配)
	eq: function( i ) {
		// 保存当前jQuery对象的length
		var len = this.length,

			// 修正为负数的索引
			j = +i + ( i < 0 ? len : 0 );
		// 如果修正后的索引越过了 当前jQuery对象length的范围
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	// 返回上一个对象，如果没有返回一个空jQuery对象
	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// 仅供内部使用
	// Behaves like an Array's method, not like a jQuery method.
	// 就象一个数组的方法,不像一个jQuery方法。
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	// options 指向某源对象
	// name 指向某源对象的key
	// src 指向目标对象的某个value
	// copy 指向某源对象的某个value
	// copyIsArray 指求copy是否为数组
	// clone 深拷贝时原始值的修正
	var options, name, src, copy, copyIsArray, clone,
		// target 保存第1个参数或者是空对象
		target = arguments[0] || {},
		// 拷贝位置
		i = 1,
		// 保存参数的长度
		length = arguments.length,
		// 默认是浅拷贝
		deep = false;

	// Handle a deep copy situation
	// 处理深拷贝的情况
	// 如果target是boolean
	// $.extend(deep,target)
	if ( typeof target === "boolean" ) {

		// target赋值给deep，表示拷贝程度
		deep = target;

		// Skip the boolean and the target
		// 并将第2个参数或{}作为target
		target = arguments[ i ] || {};

		// 拷贝位置+1
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	// 处理target是一个string或者是其他时(可能是在深拷贝)
	// 如果target不是一个对象或函数
	// $.extend("string")
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {

		// 修正target为{}
		target = {};
	}

	// Extend jQuery itself if only one argument is passed
	// 只有一个参数时，扩展jQuery对象本身
	// $.extend({ a:1 })
	if ( i === length ) {

		// 目标为 this, this指向了jQuery或者是jQuery.prototype, 扩展jQuery的工具方法或者是jQuery的实例方法
		target = this;

		// 拷贝位置-1
		i--;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		// $.extend( target,null/undefined )
		// 遍历源对象并保证不是null或undefined
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {

				// 当前target的value(原始值)
				src = target[ name ];

				// 当前源对象的value(复制值)
				copy = options[ name ];

				// Prevent never-ending loop
				// 避免循环引用
				if ( target === copy ) {
					// 跳过本次循环
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				// 如果是 深拷贝 且 copy不能转为false 并且 copy是一个纯粹的对象或者是一个数组
				if ( deep && copy && ( jQuery.isPlainObject(copy) ||
					(copyIsArray = jQuery.isArray(copy)) ) ) {

					// 如果 copy是一个数组
					if ( copyIsArray ) {

						// copyIsArray 重新赋值 false
						copyIsArray = false;

						// 如果src不能转为false 且 src是一个数组，就把src赋值给clone
						// 否则用空数组 []，原始值修正
						clone = src && jQuery.isArray(src) ? src : [];

					// 如果不是一个数组，是一个对象
					} else {

						// 如果src不能转为false 且 src是一个纯粹的对象，就把src赋值给clone
						// 否则用空对象 {}，原始值修正
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					// 不移动原始对象，复制他们
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				// 非undefined的值
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	// 返回已修改的对象
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	// 生成类似 "jQuery1110028437914578794354" 的字符串
	// 内部key（随即生成），之后会作为key添加到dom的属性集中，而key对应的value则是该dom对应的缓存对象
	// 用于数据缓存
	// 而replace将( version + Math.random() ) 生成的字符串中的.替换为空
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	// 假设jQuery准备好了所有模块
	isReady: true,

	// 抛一个新的错误消息
	error: function( msg ) {
		throw new Error( msg );
	},

	// 空函数
	noop: function() {},

	// 此方法用于检测obj是否为函数
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	// 此方法用于检测obj是否为数组( 引用原生Array.isArray )
	isArray: Array.isArray,

	// 此方法用于检测obj是否为window
	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	// 此方法用于检测obj是否是有效的数字(包括字符串型 如 "12313.11321")
	isNumeric: function( obj ) {
		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		// parseFloat将(null|true|false|"")转为NaN
		// 但是在数字字符串，特殊是在十六进制时 parseFloat 会转换成0  parseFloat('0xff') => 0
		// +1 用于是纠正精度损失的情况
		// http://bugs.jquery.com/ticket/15100
		// !jQuery.isArray( obj ) 是为了防止 parseFloat([1]) 返回1而不是NaN的奇葩情况
		// https://github.com/jquery/jquery/commit/10efa1f5b44046aab6bcc8423322a41923faa290
		return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
	},

	// 此方法用于检测对象是否是纯粹的对象 ({} 或者 new Object 创建)
	isPlainObject: function( obj ) {

		// Not plain objects:
		// 不是一个纯粹的对象：
		// Any object or value whose internal [[Class]] property is not "[object Object]"
		// 任何 对象或值 内部的[[Class]]属性不是 "[object Object]"
		// DOM nodes
		// DOM 节点
		// window
		// window对象

		// jQuery.type(obj) 返回的是obj的类型，当自定义对象时返回的是object
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		// obj的构造函数存在 且 obj的构造函数的原型对象下没有 isPrototypeOf 方法
		if ( obj.constructor &&
				// !({}).hasOwnProperty.call( obj.constructor.prototype, "isPrototypeOf" )
				// 只有Object.prototype才拥有isPrototypeOf的方法
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {

			// 说明不是 {} 或者 new Object创建
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		// 如果方法没有返回，我们相信这是一个纯粹的对象，由{} 或者 new Object 创建
		return true;
	},

	// 此方法于检测obj是否是一个空对象
	isEmptyObject: function( obj ) {
		// 变量name用于key的迭代
		var name;
		for ( name in obj ) {
			// 如果能进入for……in循环那就直接返回false
			return false;
		}
		// 如果能执行到这里说明obj是一个空对象
		return true;
	},

	// 此方法是用于JavaScript对象的类型检测
	type: function( obj ) {
		// 如果obj是null
		if ( obj == null ) {
			// 返回 "null"
			return obj + "";
		}
		// Support: Android<4.0, iOS<6 (functionish RegExp)
		// 如果obj是对象object或者是function
		return typeof obj === "object" || typeof obj === "function" ?
			// 则返回 class2type[({}).toString.call(obj)]  或者是 "object"
			class2type[ toString.call(obj) ] || "object" :
			// 否则返回 typeof obj;
			typeof obj;
	},

	// Evaluates a script in a global context
	// 此方法用于在全局作用域下调用 javascript 代码
	globalEval: function( code ) {

		// 创建 script 标签
		var script = document.createElement( "script" );

		// 放入代码
		script.text = code;

		// 在文档head插入 script 标签 ，并删除掉 script标签
		document.head.appendChild( script ).parentNode.removeChild( script );
	},

	// Convert dashed to camelCase; used by the css and data modules
	// 此方法用于将字符串转换成小驼峰，用于css以及数据模块
	// Support: IE9-11+
	// Microsoft forgot to hump their vendor prefix (#9572)
	// jQuery.camelCase 用于类似-webkit-transform转化为驼峰表示法 例如：-webkit-transform 转成 WebkitTransform
	// 而在ie -ms-transform 转化为驼峰表示法 msTransform
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	// 此方法用于检测是否存在指定节点名称( 忽略大小写 )
	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// 此方法用于遍历数组或者是类数组
	// args is for internal usage only
	// args 只供内部使用
	each: function( obj, callback, args ) {

		// value 保存 callback 的返回值，用于跳出循环
		var value,
			// 当前遍历的索引
			i = 0,
			// 保存对象的长度
			length = obj.length,
			// 判断obj是否长得像数组
			isArray = isArraylike( obj );

		// 如果参数args存在
		if ( args ) {

			// 如果obj长的像数组
			if ( isArray ) {

				// 长得数组用for遍历
				for ( ; i < length; i++ ) {

					// 当前元素附出一个callback，且将参数args数组传入函数
					// 保存当前callback的返回值
					value = callback.apply( obj[ i ], args );
					// 当前回调的返回值为false
					if ( value === false ) {
						// 直接终止循环
						break;
					}
				}

			// 如果长的不像数组
			} else {

				// 那就用for...in遍历
				for ( i in obj ) {

					// 当前元素附出一个callback，且将参数args数组传入函数
					// 保存当前callback的返回值
					value = callback.apply( obj[ i ], args );
					// 当前回调的返回值为false
					if ( value === false ) {
						// 直接终止循环
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		// 如果参数args不存在
		} else {

			// 如果obj长的像数组
			if ( isArray ) {

				// 长得数组用for遍历
				for ( ; i < length; i++ ) {

					// 当前元素附出一个callback，且将当前元素以及key和value传入
					// 保存当前callback的返回值
					value = callback.call( obj[ i ], i, obj[ i ] );

					// 当前回调的返回值为false
					if ( value === false ) {
						// 直接终止循环
						break;
					}
				}

			// 如果长的不像数组
			} else {

				// 那就用for...in遍历
				for ( i in obj ) {

					// 当前元素附出一个callback，且将当前元素以及key和value传入
					// 保存当前callback的返回值
					value = callback.call( obj[ i ], i, obj[ i ] );

					// 当前回调的返回值为false
					if ( value === false ) {
						// 直接终止循环
						break;
					}
				}
			}
		}

		//
		return obj;
	},

	// Support: Android<4.1
	// 此方法用于去掉头尾空格符
	trim: function( text ) {
		// 如果 text不为空
		return text == null ?
			//直接返回空字符串
			"" :
			// 为了确保text是字符串先将text和空字符串拼接
			// 然后用正则rtrim匹配空格符将其替换成空字符串
			( text + "" ).replace( rtrim, "" );
	},

	// 此方法用于把类数组对象转换成一个直正的数组
	// results is for internal usage only
	// results 仅供内部使用
	makeArray: function( arr, results ) {

		// 如果 results 存在，就直接用results，否则用[]
		var ret = results || [];

		// 如果 arr不为空
		if ( arr != null ) {

			// 如果 arr(一律用Object(arr)来转换) 长的是像数组，调用jQuery.merge方法合并
			// http://javascript.ruanyifeng.com/stdlib/object.html#toc2
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					// typeof Object("xxxx") =>  "object" , 所以此次要再检测是"string"
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				// 如果arr长的不像数组，那么直接将arr push进ret
				push.call( ret, arr );
			}
		}

		// 返回转换后的结果
		return ret;
	},

	// 此方法用于在数组中查找指定值并返回它的索引
	// 参数i 指定查找开始位置
	// 如果没有找到，则返回-1
	inArray: function( elem, arr, i ) {
		// 如果arr为空返回-1，否则调用原生数组的indexOf方法
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	// 此方法用于合并两个数组内容到第一个数组
	merge: function( first, second ) {

		// 保存第二个数组的length, 为避免 length的值是字符串类型前面加+来转换类型
		var len = +second.length,
			j = 0,
			i = first.length;

		// 遍历第二个数组
		for ( ; j < len; j++ ) {
			// 将第二个数组的每个元素从第一数组的尾部插入
			first[ i++ ] = second[ j ];
		}

		// 修正第一个数组的length (有可能是jQuery对象)
		first.length = i;

		// 返回合并后的第一个数组 (有可能是jQuery对象)
		return first;
	},

	// 此方法用于查找满足此过滤函数的元素，原数组不受影响
	// 如果 invert 为 false 取过滤函数返回true的元素
	// 如果 invert 为 true  则相反 取过滤函数返回false的元素
	grep: function( elems, callback, invert ) {

		// 用于保存过滤函数回调求反的返回值
		var callbackInverse,
			// 匹配的结果集
			matches = [],
			// 初始索引
			i = 0,
			// 元素的长度
			length = elems.length,

			// 回调返回的期望值
			// 当参数 invert 值为 true 时，取得是没有通过验证的 items
			// 默认值为 false , 取得是 通过验证的 items

			// 求反之后更直观的表示
			// false 代表没有通过验证的 items
			// true 代表通过验证的 items
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		// 过滤该数组，仅保存通过验证函数的 items
		// 遍历数组
		for ( ; i < length; i++ ) {

			// 由于invert求反了，所以把返回值也求反了，这样更方便比较也是为了防止类型不同
			// 函数没有返回值的时候 默认为 undefined
			callbackInverse = !callback( elems[ i ], i );
			// 实际反转后返回值 不等于 期待返回值
			if ( callbackInverse !== callbackExpect ) {
				// 就把元素插入结果集
				matches.push( elems[ i ] );
			}
		}

		// 返回最终结果集
		return matches;
	},

	// 此方法用于将一个数组中的所有元素转换到另一个数组中
	// arg is for internal usage only
	// arg 仅供内部使用
	map: function( elems, callback, arg ) {
		// 用于保存临时保存返回值
		var value,
			// 保存 index
			i = 0,
			// 保存 elems的长度
			length = elems.length,
			// 判断 elems 长得像数组
			isArray = isArraylike( elems ),
			// 用于ret保存回调返回值的集合
			ret = [];

		// Go through the array, translating each of the items to their new values
		// 通过数组，遍历每项转换新值
		if ( isArray ) {
			// 遍历数组
			for ( ; i < length; i++ ) {
				// 保存claaback的返回值
				value = callback( elems[ i ], i, arg );

				// value非空
				if ( value != null ) {
					// 将返回值push到ret里
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			// 遍历对象
			for ( i in elems ) {
				// 保存claaback的返回值
				value = callback( elems[ i ], i, arg );

				// value非空
				if ( value != null ) {
					// 将返回值push到ret里
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		// 返回拼合任何嵌套的数组
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	// 一个全局的计数器，用于事件模块和缓存模块
	// 唯一标识，用于关联
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	// 绑定一个函数到一个指定的上下文、任意数量的附加参数
	// 此方法用于接受一个函数，然后返回一个保持特定上下文的函数
	proxy: function( fn, context ) {
		// tmp 用于临时交换fn和context
		// args 用于保存fn的参数
		// proxy 代理函数
		var tmp, args, proxy;

		// 参数context是一个字符串
		// 那么就是这种情况 var context = {  fn: function(){ console.log(this); } }
		// $.proxy( context, 'fn')
		// 那么就要 交换 fn、context的位置
		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		// 快速检测目标是否可调用的，在 spec 中会引发 TypeError ,但仅将返回 undefined
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		// 模拟绑定
		// 保存任意数量的附加参数(去除参数 fn 和 context)
		args = slice.call( arguments, 2 );
		proxy = function() {
			// 返回一个指定上下文的函数
			// 当context为null或undefined,代理函数将this对象作为context
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		// 统一guid，所以它可以被删除
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		// 返回处理后的代理函数
		return proxy;
	},

	// 用于获取当前时间戳
	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	// jQuery.support 不用在Core中，但其他附加模块会用，因此需要存在
	support: support
});

// Populate the class2type map
// 填充 class2type
// 储存JavaScript内置对象(包括宿主)
// 用于JavaScript对象的检测结果对应匹配
// 如：匹配 key:"[object Boolean]"得到value:boolean
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),
function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

// 此方法用于检测obj是否长得像数组
function isArraylike( obj ) {
	// 保存 obj的length属性
	var length = obj.length,
		// 执行 jQuery.type 工具方法 返回 obj 的类型
		type = jQuery.type( obj );

    // 判断 obj 是否为 function 或 obj 是 window 全局对象
    // 如果是返回 false
	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

    // 判断 obj 是否为 dom元素 且 其长度存在
    // 说白了就是一个有元素的元素集
    // 如果是返回 true
	if ( obj.nodeType === 1 && length ) {
		return true;
	}

    // obj类型既不是 function 也不是 window 更不是dom元素集时
    // obj类型是 array,直接返回 true 如：[1,2,3]
    // 若 obj的类型不是 array,则其 length 为 0 返回true  如：({ length:0 }).length 这样的类数组对象
	return type === "array" || length === 0 ||
	    // 若 obj的类型不是 array,且其 length不为 0 时  如： { 0:"first key", length:1 }
		// 其 length的类型应为 number、大于0且 (长度-1) 的 key在 obj里。
		// type length ！== 'number' 如： { length:"1" }
		// !( length > 0 )  如： { length:-1 }  如果length === 0之前已经判断，所以此处只有负数才不符合条件
		// !(( length - 1 ) in obj)  如： ({ length:3 }).length  而 3(length) - 1，key 为 2 , 压根 在{ length:3 } 就没有
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}

return jQuery;
});
