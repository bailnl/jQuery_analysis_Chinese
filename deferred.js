define([
	"./core",
	"./var/slice",
	"./callbacks"
], function( jQuery, slice ) {

jQuery.extend({

	Deferred: function( func ) {
		// 映射关系
		var tuples = [
				// action, add listener, listener list, final state
				// 转换状态(行为), 侦听器, 侦听器列表, 最终状态
				// [ resolve | reject ] 的回调列表参数是 "once memory"，说明只能调用一次
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],


			// 默认状态为 pending
			state = "pending",
			// 延迟对象(无状态转换)
			promise = {
				// 返回状态
				state: function() {
					return state;
				},
				// 当 [ done | fail ]  状态时执行 alwaysCallbacks
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				// 延迟对象  [ done | fail | progress ] 时，调用处理程序
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					// 返回一个新的 $.Deferred().promise()
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							// 当前项是函数时，将当前项给fn
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							// 为 deferred[ done | fail | progress ] 添加一个处理函数
							// 处理函数用于在 newDefer 的状态转换
							deferred[ tuple[1] ](function() {
								// 如果存在就执行 上下文为当前的延迟对象
								var returned = fn && fn.apply( this, arguments );
								// 如果返回值是一个延迟对象
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									// 那么直接在 当前延迟对象[done | fail | progress]下添加 转换新延迟对象状态 的回调函数
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								// 如果返回值不是延迟对象
								} else {
									// 直接转换新延迟对象的状态
									newDefer[ tuple[ 0 ] + "With" ](
										this === promise ? newDefer.promise() : this,
										fn ? [ returned ] : arguments
									);
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				// 在 deferred 下获取一个 promise
				// 如果 obj 存在，promise 合并到 object
				promise: function( obj ) {
					// 如果 obj 不为空时, 把 promise 合并到 obj
					// 否则返回 promise 对象
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			// 延迟对象
			deferred = {};

		// Keep pipe for back-compat
		// 管道
		promise.pipe = promise.then;

		// Add list-specific methods
		// 添加特定于延迟对象的方法
		jQuery.each( tuples, function( i, tuple ) {
			// 回调
			var list = tuple[ 2 ],
				// 状态  [ resolved | rejected ]
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			// 监听器 (其实就是 Callbacks 的 add)
			promise[ tuple[1] ] = list.add;

			// Handle state
			// 处理状态
			if ( stateString ) {
				// 在回调列表中增加 改变状态的三个函数
				list.add(function() {
					// state = [ resolved | rejected ]
					// 状态 只有 解决(resolved)  rejected(拒绝)
					// 修改状态
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				// 当 i == 0 时 i ^ 1 == 1
				// 当 i == 1 时 i ^ 1 == 0
				// tuples[ i ^ 1 ][ 2 ].disable
				// 当 state == resolved 时 rejected 是 disable
				// 相反 state == rejected 时 resolved 也是 disable
				// tuples[ 2 ][ 2 ].lock
				// 当 state 转换 resolved | rejected
				// notify的状态是lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				// 当 this 指向 deferred
				// 将 context 改变 promise
				// 否则 context 用 this , 并把 arguments 传入调用
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			// deferred[ resolveWith | rejectWith | notifyWith ]
			// 带 context 的 deferred[ resolve | reject | notify ]
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});



		// Make the deferred a promise
		// 把 promise 合并到 deferred
		promise.promise( deferred );

		// Call given func if any
		// 如果参数 func 存在,就调用
		// 内部用于 $.then
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	// Deferred 辅助对象，用于多个延迟对象
	when: function( subordinate /* , ..., subordinateN */ ) {
		// i 用于遍历
		var i = 0,
			// 获取所有参数转换成数组
			resolveValues = slice.call( arguments ),
			// 参数的长度
			length = resolveValues.length,

			// the count of uncompleted subordinates
			// 计数器 用于计数未完成状态数
			// 如果 参数的长度不为1 或者 第一个参数是延迟对象时  计数器为取参数的长度
			// 否则 计数器为 0
			remaining = length !== 1 ||
				( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred.
			// If resolveValues consist of only a single Deferred, just use that.
			// 如果 计数器 为 1 只有一个延迟对象 ， 那么直接用这个延迟对象
			// 否则 创建一个延迟对象
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				// 返回一个函数(形成闭包)
				return function( value ) {
					// 根据i值保存上下文以及参数在数组上
					// 数组是引用类型
					// contexts =>  progressContexts resolveContexts
					// values => resolveValues progressValues
					// 保存上下文(延迟对象的 promise)
					contexts[ i ] = this;
					// 保存转换状态时参数
					// 如果参数大于1，转换成数组
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					// 当处理 notify 时
					if ( values === progressValues ) {
						// 调用 $.when 下的 延迟对象的notify，并传入上下文
						deferred.notifyWith( contexts, values );
					// 当延迟对象 resolve 时 执行--操作
					// remaining 为 0 时
					} else if ( !( --remaining ) ) {
						// 调用 $.when 下的 延迟对象的 resolve，并传入上下文
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// Add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			// 根据长度创建 保存 progress 和 resolve 的上下文数组和值数组
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				// 如果是延迟对象
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						// 为每个延迟对象增加一个 done 的回调函数(由执行 updateFunc 返回一个函数)
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						// 当其中一个延迟对象为fail时 直接 reject 延迟对象
						.fail( deferred.reject )
						// 为每个延迟对象增加一个 progress 的回调函数(由执行 updateFunc 返回一个函数)
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					// 如果不是延迟对象，直接递减
					--remaining;
				}
			}
		}

		// If we're not waiting on anything, resolve the master
		// 如果不需要等待，直接 resolve
		// 也就是说 延迟对象计算器 为 0 时
		if ( !remaining ) {
			// 传入上下文，和$.when的所有参数
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		// 返回延迟对象的 promise对象
		return deferred.promise();
	}
});

return jQuery;
});
