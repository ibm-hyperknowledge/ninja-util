/*
 * Copyright (c) 2016-present, IBM Research
 * Licensed under The MIT License [see LICENSE for details]
 */

"use strict";

Object.defineProperty(global, '__stack',
{
	get: function()
	{
		var orig = Error.prepareStackTrace;
		Error.prepareStackTrace = function(_, stack)
		{
			return stack;
		};
		var err = new Error;
		Error.captureStackTrace(err, arguments.callee);
		var stack = err.stack;
		Error.prepareStackTrace = orig;
		return stack;
	}
});

Object.defineProperty(global, '__line',
{
	get: function()
	{
		return __stack[3].getLineNumber();
	}
})

Object.defineProperty(global, '__function',
{
	get: function()
	{
		return __stack[3].getFunctionName() || '<anonymous>';
	}
});

const ENABLE_LOG_ARG = '--enable-log';

let LOG_ENABLED = false;
for (let i = 0; !LOG_ENABLED && i < process.argv.length; i++)
{
	LOG_ENABLED = process.argv[i] == ENABLE_LOG_ARG;
}

function Logger(enable)
{
	this._isEnabled;
	this.setEnabled(enable);
}

Logger.prototype.setEnabled = function(enable)
{
	this._isEnabled = (enable || true) && LOG_ENABLED;
};

Logger.prototype.log = function(...log)
{
	if (this._isEnabled)
	{
		console.log(...this._msg(log));
	}
};

Logger.prototype.error = function(...log)
{
	if (this._isEnabled)
	{
		console.error(...this._msg(log));
	}
};

Logger.prototype._msg = function(...log)
{
	const prefix = __function + ':' + __line + ':'
	return [prefix].concat(...log);
};


exports.Logger = Logger;