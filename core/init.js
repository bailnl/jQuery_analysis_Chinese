// Initialize a jQuery object
define([
	"../core",
	"./var/rsingleTag",
	"../traversing/findFilter"
], function( jQuery, rsingleTag ) {

// A central reference to the root jQuery(document)
// 声明一个 rootjQuery 变量，用于将 document 封装成 jQuery 对象并缓存
var rootjQuery,

	// A simple way to check for HTML strings
	// 一个简单的方式来检查 HTML 字符串
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// #id 优先 <tag> 以避免通过location.hash XSS （#9521)
	// Strict HTML recognition (#11290: must start with <)
	// 严格的识别 HTML (#11290： 必须以开头 < )

	// rquickExpr
	// /^(?:pattern)$/  非获取匹配 并且 （匹配输入/字符串的开始 以及 匹配输入/字符串的结尾）
	// pattern: \s*(<[\w\W]+>)[^>]*|#([\w-]*)
	// pattern 用|分割得到 \s*(<[\w\W]+>)[^>]* 以及 #([\w-]*)
	// 最后合并分解成  /^(?:\s*(<[\w\W]+>)[^>]*)$/  或者  /^(?:#([\w-]*))$/
	// 前者是匹配简单的<tag>，必须是以 < 开头，当然 < 前面可任意空白符\s。
	// 后者是匹配#id,符合#[A-Za-z0-9_-]
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	// jQuery真实的构造函数
	init = jQuery.fn.init = function( selector, context ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		// 处理： "", null, undefined, false
		// 返回一个空的jQuery对象
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		// 处理 HTML 字符串
		// 检测 selector 是否为 string 类型
		if ( typeof selector === "string" ) {
			// 如果 selector 第一个字符是 "<" 且 最后一个字符 ">" 并且 selector的长度 大于 3  例如： <x>
			if ( selector[0] === "<" &&
				selector[ selector.length - 1 ] === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				// 假定是 html 标签 就跳过 正则 检查
				match = [ null, selector, null ];

			} else {
				// 否则用正则检查
				// match = [ selector, html or undefined, id or undefined]
				// 匹配成功 则 html 或 id 其中一项 相反是 undefined
				// [selector, html, undefined]  或者 [ selector, undefined, id]
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			// 匹配 html 或者 没有指定上下文的 #id
			// 其实是这样子  if ( match && (match[1] || match[2] && !context) ) {
			// 如果 match 存在， 并且 (( match[1] 不是 undefined ) 或 ( match[2] 不是 undefined 且没有指定上下文 ))
			// 如果 match[1] 是 undefined ， 那么 match[2] 必然不是 undefined 所以省去了对 match[2] 的判断
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
                // 处理：$(html) -> $(数组)
				if ( match[1] ) {
					// 如果 context 是 jQuery对象 返回 context第一个元素(也就是原生js对象)，  否则 直接 使用 context
					context = context instanceof jQuery ? context[0] : context;

					// Option to run scripts is true for back-compat
                    // 运行脚本 选项设置为true 保证向后兼容
					// Intentionally let the error be thrown if parseHTML is not present
                    // 如果 parseHTML 不存在，有意抛出错误
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						// 传入上下文
						// 如果 context 存在 且 context 是节点
						// 那么取 context.ownerDocument (有可能是frame) 作为上下文 (document.ownerDocument => null)
						// 否则用 document
						context && context.nodeType ? context.ownerDocument || context : document,
						// 包含script标签
						true
					) );

					// HANDLE: $(html, props)
                    // 处理$(html,属性)
                    // 判断是否简单的标签 且 context 的普通对象
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
                        // 遍历context
						for ( match in context ) {
							// Properties of context are called as methods if possible
                            // 可能context的属性是方法
							if ( jQuery.isFunction( this[ match ] ) ) {
                                // 调用方法
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
                            // 设置属性
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

                    // 返回对象
					return this;

				// HANDLE: $(#id)
				// 处理 id
                } else {
                    // 直接通过  getElementById 获取元素
					elem = document.getElementById( match[2] );

					// Support: Blackberry 4.6
					// gEBID returns nodes no longer in the document (#6963)
                    // 通过id获取的节点元素不在文档中（有可能在fragment）
					if ( elem && elem.parentNode ) {
						// Inject the element directly into the jQuery object
                        // 将元素注入到jQuery对象
						this.length = 1;
						this[0] = elem;
					}

                    // 通过id获取的元素 context为 document
					this.context = document;
                    // 保存 选择器
					this.selector = selector;
                    // 返回jQuery对象
					return this;
				}

			// HANDLE: $(expr, $(...))
			// 处理：$(选择器，jQuery对象上下文)
            // 如果不存在 context 而在  rootjQuery 中find selector
            // 如果context存在且context.jquery存在时，认为context为jQuery对象且在其find selector
            } else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
            // $(选择器，上下文)
			// (which is just equivalent to: $(context).find(expr)
            // 这相当于$(context).find(expr)
			} else {
                // 通过this.constructor也就是jQuery将context转化成jquery对象再 find　选择器
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		// 处理：$(dom元素)
        // 如果元素有.nodeType属性 那么就是单个元素
        } else if ( selector.nodeType ) {
            // 保存元素以及上下文
			this.context = this[0] = selector;
            // 设置jQuery对象的length
			this.length = 1;
            // 返回jQuery对象
			return this;

		// HANDLE: $(function)
        // 处理： $(函数)
		// Shortcut for document ready
        // document ready 的快捷方式
		} else if ( jQuery.isFunction( selector ) ) {
            // 如果document ready不为空也就是存在
			return rootjQuery.ready !== undefined ?
                // 那么将selector传入document ready事件中
				rootjQuery.ready( selector ) :
				// Execute immediately if ready is not present
                // 如果 ready 不存在则传入jQuery并立即执行函数
				selector( jQuery );
		}

        // 如果 selector 不为 undefined
		if ( selector.selector !== undefined ) {
            // 保存 选择器 以及  上下文
			this.selector = selector.selector;
			this.context = selector.context;
		}

        // 处理 []、object（类数组）
        // 最后只能将 selector 合并到 this（jQuery对象中）
		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
// 给init方法实例化的jQuery原型
// 由于
init.prototype = jQuery.fn;

// Initialize central reference
// 初始化document对象为jQuery对象
rootjQuery = jQuery( document );

return init;

});
