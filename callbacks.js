define([
	"./core",
	"./var/rnotwhite"
], function( jQuery, rnotwhite ) {

// String to Object options format cache
// 缓存对象
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
// 转换 字符串格式的 options 参数 为 object格式并缓存
function createOptions( options ) {
	// 将object和 optionsCache[x] 指向了同一个对象
	// 用于在 optionsCache 缓存对象中查找已缓存的某个 options
	// 例如 当首次options是 'once memory'时, 则缓存对象创建类似这样的属性 optionsCache['once memory'] = { once:true , memory:true }
	// 而当再次使用同样的 string options 时，将从缓存对象里面取对应的参数不再创建
	var object = optionsCache[ options ] = {};
	// 通过正则匹配空格转成数组
	// 再通过工具方法 each 遍历把对应的参数设置为 true 作为其属性
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	// 最后返回参数对象
	return object;
}

/*
 * Create a callback list using the following parameters:
 * 使用以下参数创建一个回调列表
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *  参数可以是以,号隔开的字符串形式或者是对象
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 * 回调列表默认像事件回调列表一样可以多次触发
 *
 * Possible options:
 * 可选参数
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *  确保回调列表只执行一次
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *  所谓"记忆",将跟踪之前的值，并会用在fire之后立即使用最新的"记忆"值并执行添加任何的回调
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *  确保回调只能添加一次到列表中（不重复）
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *  用于当callback返回false时中断后续执行
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	// 如果 options 为字符串
	options = typeof options === "string" ?
		// 那么尝试去缓存对象中取得参数，没有则通过createOptions来创建为object格式并缓存
		( optionsCache[ options ] || createOptions( options ) ) :
		// 如果不是字符串，那么直接使用工具方法 extend 来合并对象
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
        // 最后觖发的值 (上下文以及参数)
		memory,
		// Flag to know if list was already fired
        // 标记列表的是否为执行过
		fired,
		// Flag to know if list is currently firing
        // 标记列表执行状态
		firing,
		// First callback to fire (used internally by add and fireWith)
        // 执行回调的起始位置
		firingStart,
		// End of the loop when firing
        // firing 循环结束，用于缓存列表长度
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
        // 当前触发的回调函数的索引 （self.remove() 可能需要修改）
		firingIndex,
		// Actual callback list
        // 回调列表
		list = [],
		// Stack of fire calls for repeatable lists
        // 当 options.once 为 false 时， stack 为 []
        // 当 options.once 为 true 时， stack 为 false
        // stack 当是 [] 时， 用于保存 firing 的 上下文以及参数
		stack = !options.once && [],
		// Fire callbacks
		// 执行回调
		fire = function( data ) {
			// 当 options.memory 为 true 时，保存 data (上下文以及参数)
            // 当 options.memory 为 false 时， 那么 保存的是 false
			memory = options.memory && data;
			// 标记为已经执行过
			fired = true;
			// 当 firingStart 不为 0 时 那么说明有 memory 操作，将列表 firingIndex 调整
			firingIndex = firingStart || 0;
            // 重置为 0， 为下次 memory 操作
			firingStart = 0;
            // 保存 firing时的列表长度
			firingLength = list.length;
			// fire start
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				// 当调用回调时返回值为 false 且 options.stopOnFalse 为 true 时
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false &&
					options.stopOnFalse ) {

					// 将 memory 调为 false ，阻止后续 memory 操作
					memory = false; // To prevent further calls using add
					// 跳出循环
					break;
				}
			}
			// fire end
			firing = false;
			if ( list ) {
				// 当 stack 有值时保存了 上下文以及参数 ，当然 options.once 也为 false
				// options = { once : false }
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				// 如果能走到这里，那么当 options.once 为 true 时，options.memory 为 true 也不能改变 once 事实
				// options = { once : true, memory: true }
				} else if ( memory ) {
					// 所以把列表清空
					list = [];
				// 当 options.once 为 true 且 options.memory 为 false 时
				// options = { once : true }
				} else {
					// 那么就直接调用 self.disable() 禁止掉
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			// 添加一个回调或回调集合到列表中
			add: function() {
				if ( list ) {
					// First, we save the current length
					// 首先，我们先保存当前列表的长度
					var start = list.length;
					// 用于在添加回调到列表
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							// 检测arg的类型
							var type = jQuery.type( arg );
							// 函数
							if ( type === "function" ) {
								// 当 options.unique 为 false 时 或者
								// 当 options.unique 为 true , 且列表中不存在arg 时
								if ( !options.unique || !self.has( arg ) ) {
									// 将arg push进list
									list.push( arg );
								}
								// arg是数组的情况，如[a,b,c]
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								// 递归
								add( arg );
							}
						});
					// 将所有的参数传入
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					// 当我们需要在当前触发处理中时添加callbacks时
					// 如 function a(){  } function b(){ cb.add(a); } cb.add(b); cb.fire();
					if ( firing ) {
						// 修正firing的列表长度
						firingLength = list.length;

					// With memory, if we're not firing then
					// we should call right away
					// 如果 memory 存在 那么说明 options.memory 为true
					// 不在 firing 时应该立即调用
					} else if ( memory ) {
						// 修改触发开始的位置
						firingStart = start;
						// 将 memory (上下文以及回调参数) 传入执行
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			// 从列表删除指定的回调
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						// 保存对应的索引位置也作为循环时 inArray 的起始检索位置
						var index;
						//  使用循环确保没有重复回调
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							// 通过 splice 删除
							list.splice( index, 1 );
							// Handle firing indexes
							// 处理 firing 的情况
							if ( firing ) {
								// 删除一项时
								if ( index <= firingLength ) {
									// 应该把 firingLength 减1
									firingLength--;
								}
								// 当索引位置 小于等于 当前 firingIndex 时
								if ( index <= firingIndex ) {
									// 应该把当前 firingIndex 减1
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// 检测回调是否在列表中
			// If no argument is given, return whether or not list has callbacks attached.
			// 如果没有参数就返回列表中是否有回调
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			// 删除列表中所有回调
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			// 禁用回调列表中的回调
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			// 确定回调列表是否已被禁用
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			// 锁定回调列表的当前状态
			lock: function() {
				// 将 stack 设为 undefined，阻止后续的 cb.fire() 操作
				stack = undefined;
				// 当 memory 为 false
				if ( !memory ) {
					// 禁用回调
					self.disable();
				}
				return this;
			},
			// Is it locked?
			// 确定回调列表是否已被锁定
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			// 访问给定的上下文和参数列表中的所有回调
			fireWith: function( context, args ) {
				// list 不为 undefined 时( 可能被禁用 self.disable() )
				// fired用于标记是否至少执行过一次
				// 当 options.once 为 true 时，stack 为 false
				// 那么 当 fire 没有执行过
				// 或者 当 fire 至少执行过一次 且 options.once 不为 true ，也没有锁定回调列表( self.lock() )
				if ( list && ( !fired || stack ) ) {
					// 不存在args则用空数组
					args = args || [];
					// 把上下文以参数合并为一个数组
					args = [ context, args.slice ? args.slice() : args ];
					// 当 firing 时
					if ( firing ) {
						// 将 args (上下文以及参数) 压入栈中
						stack.push( args );
					// fire end 时
					} else {
						// 直接调用
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			// 传入指定的参数调用所有的回调
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			// 确定回调是否至少已经调用一次
			fired: function() {
				return !!fired;
			}
		};

	return self;
};

return jQuery;
});
