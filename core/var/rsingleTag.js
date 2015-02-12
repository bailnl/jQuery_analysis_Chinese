define(function() {
	// Match a standalone tag
    // 匹配独立的标签
    // 类似<div /> 或者 <div></div>
	return (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);
});
