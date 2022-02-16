/*
 * Copyright (c) 2016-present, IBM Research.
 * Licensed under The MIT License [see LICENSE for details]
 */

"use strict";

const NHttpError = require('./nhttperror')
const Timer      = require('./timer');
const uid        = require('shortid');
const boolParser = require('express-query-boolean');

function ExpressWrapper(app)
{
	this.auth_mode = ExpressWrapper.AUTH_NONE;
	this.auth_arg = null;
	app.use(boolParser());
	this.app = app;
	this.logLevel = ExpressWrapper.LOG_NONE;
	this.logOptions = {};

	this.console = console;

};

ExpressWrapper.prototype.setConsole = function(c)
{
	this.console = c || console;
}

ExpressWrapper.prototype.setLogLevel = function(level, options)
{
	switch (level)
	{
		case ExpressWrapper.LOG_NONE:
		case ExpressWrapper.LOG_REQUESTS:
		{
			this.logLevel = level;
			this.logOptions = options || this.logOptions;
			break;
		}
		default:
		{
			/* do nothing */
			this.console.error ('Unkown loglevel');
		}
	}
};

ExpressWrapper.prototype.logRequest = function(req)
{
	let requestId = uid();

	req.requestId = requestId;
	req.timer = new Timer ();
	if (this.logLevel === ExpressWrapper.LOG_REQUESTS)
	{
		this.console.log (`[${req.requestId}]`, req.method, req.originalUrl);
	}
};

ExpressWrapper.prototype.logResponse= function(req, code, data)
{
	if (this.logLevel === ExpressWrapper.LOG_REQUESTS)
	{
		let _data = this.logOptions.logResponseBody === true ? data : '';

		this.console.log (`[${req.requestId}]`,
			`${req.timer.getTimeString()};`,
			`${code};`, _data);
	}
};

ExpressWrapper.prototype.setAuthMode = function(...args)
{
	let ret = true;
	if (args[0] === ExpressWrapper.AUTH_NONE)
	{
		this.auth_mode = ExpressWrapper.AUTH_NONE;
		this.auth_arg = null;
	}
	else if (args[0] === ExpressWrapper.AUTH_SECRET)
	{
		this.auth_mode = ExpressWrapper.AUTH_SECRET;
		this.auth_arg = args[1];
	}
	else if (args[0] === ExpressWrapper.AUTH_CERT)
	{
		const fs = require('fs');

		this.auth_mode = ExpressWrapper.AUTH_CERT;
		this.auth_arg = fs.readFileSync(args[1]);
	}
	else if (args[0] === ExpressWrapper.AUTH_JUST_DECODE)
	{
		this.auth_mode = ExpressWrapper.AUTH_JUST_DECODE;
		this.auth_arg = null;
	}
	else
	{
		this.auth_mode = ExpressWrapper.AUTH_NONE;
		this.auth_arg = null;
		ret = false;
	}

	return ret;
};

ExpressWrapper.prototype.setAuthMode(ExpressWrapper.AUTH_NONE);

function _getTokenFromHeaderField(field)
{
	let token = null;
	if (field && field.startsWith("Bearer"))
	{
		let str = field.split(' ');
		if (str.length > 1)
			token = str[1];
	}
	else
	{
		token = field;
	}

	return token;
};

function _streamObject(res, obj)
{
	res.write('{');
	let chunk = null;
	let previous = null;
	for (let key in obj)
	{
		if (previous)
		{
			res.write(previous);
		}
		previous = chunk;
		chunk = '"' + key + '":' + JSON.stringify(obj[key]) + ',';
		obj[key] = null;
	}

	if (previous)
	{
		res.write(previous);
	}

	if (chunk)
	{
		chunk = chunk.slice(0, -1);
		res.write(chunk);
	}
	res.write('}');
	res.end();
}

function _streamArray(res, array)
{
	res.write('[');
	let chunk = null;
	let previous = null;
	for (let i = 0; i < array.length; i++)
	{
		if (previous)
		{
			res.write(previous);
		}
		previous = chunk;
		chunk = JSON.stringify(array[i]) + ',';
		array[i] = null;
	}

	if (previous)
	{
		res.write(previous);
	}

	if (chunk)
	{
		chunk = chunk.slice(0, -1);
		res.write(chunk);
	}
	res.write(']');
	res.end();
}

function _extractParams(req)
{
	let tokendata;
	switch (this.auth_mode)
	{
		case ExpressWrapper.AUTH_NONE:
        {
            /* nothing to do */
            break;
        }
		case ExpressWrapper.AUTH_SECRET:
		case ExpressWrapper.AUTH_CERT:
		case ExpressWrapper.AUTH_JUST_DECODE:
        {
            const jwt = require('jsonwebtoken');

            let token = _getTokenFromHeaderField(req.headers.authorization);

            if (this.auth_mode == ExpressWrapper.AUTH_JUST_DECODE)
                tokendata = jwt.decode(token);
            else
                tokendata = jwt.verify(token, this.auth_arg);

            break;
        }
		default:
			tokendata = null;
	}

	if (req.headers['content-type'] == 'application/octet-stream'){
		return {
			tokendata: tokendata,
			headers: req.headers,
			query: req.query,
			params: req.params,
			stream: req,
			outMimeType: null
		};
	} else{
		return {
			tokendata: tokendata,
			headers: req.headers,
			query: req.query,
			params: req.params,
			body: req.body,
			outMimeType: null
		};
	}
};

function sendResponse (req, res, err, streamResponse, data, outMimeType = null)
{
	let code;
	let chain = null;
	if (!err)
	{
		if (!data)
		{
			code = 204;
		}
		else
		{
			if (streamResponse)
			{
				switch (data.constructor)
				{
					case Object:
						_streamObject(res, data);
						break;
					case Array:
						_streamArray(res, data);
						break;
					default:
						code = 200;
						chain = 'send';
				}
			}
			else
			{
				code = 200;
				if (data.constructor === Object)
				{
					chain = 'json';
				}
				else
				{
					chain = 'send';
				}
			}
		}

	}
	else
	{
		chain = 'json';
		if (err instanceof NHttpError)
		{
			code = err.code;
			data = err.payload;
		}
		else if(err instanceof Error)
		{
			code = 500;
			data = err.message;
		}
		else
		{
			code = 500;
			data = err;
		}

		if(typeof data === "string")
		{
			res.set("content-type", "text/plain");
			chain = "send";
		}
	}

	this.logResponse (req, code, data);

	if(outMimeType && !err)
	{
		res.set("content-type", outMimeType);
	}

	if (chain)
	{
		res.status(code)[chain](data);
	}
	else
	{
		res.sendStatus (code);
	}
}

function _request(method, route, streamResponse, callback)
{
	if (method === "post" || method === "put" || method === "delete" || method === "get")
	{
		this.app[method](route, (req, res) =>
		{
			try
			{
				this.console.debug(`Route ${req.originalUrl} accessed with method ${method}`);
				let params = _extractParams.call(this, req);

				this.logRequest (req);


				let out = callback(params, (err, data) =>
				{
					sendResponse.call (this, req, res, err, streamResponse, data, params.outMimeType);
				});

				if(out instanceof Promise)
				{
					out.then((data) =>
					{
						sendResponse.call (this, req, res, null, streamResponse, data, params.outMimeType);
					})
					.catch((err) =>
					{
						this.console.error(err);
						sendResponse.call (this, req, res, err, streamResponse);
					});
				}

			}
			catch (err)
			{
				this.console.error(err);
				if (err.name === 'JsonWebTokenError')
				{
					res.status(401).json('Authentication Failed');
				}
				else
				{
					sendException.call(this, res, err)
				}
			}
		});
	}
	else
	{
		throw "Request method not supported";
	}
};

ExpressWrapper.prototype.get = function(route, streamResponse, callback)
{
	if (typeof(streamResponse) === 'function')
	{
		callback = streamResponse;
		streamResponse = false;
	}

	_request.call(this, "get", route, streamResponse, callback);
};

ExpressWrapper.prototype.post = function(route, streamResponse, callback)
{
	if (typeof(streamResponse) === 'function')
	{
		callback = streamResponse;
		streamResponse = false;
	}

	_request.call(this, "post", route, streamResponse, callback);
};

ExpressWrapper.prototype.put = function(route, streamResponse, callback)
{
	if (typeof(streamResponse) === 'function')
	{
		callback = streamResponse;
		streamResponse = false;
	}
	_request.call(this, "put", route, streamResponse, callback);
};

ExpressWrapper.prototype.delete = function(route, streamResponse, callback)
{
	if (typeof(streamResponse) === 'function')
	{
		callback = streamResponse;
		streamResponse = false;
	}
	_request.call(this, "delete", route, streamResponse, callback);
};

ExpressWrapper.prototype.getApp = function()
{
	return this.app;
};

function sendException(res, exp)
{
	this.console.trace(`[Exception handled by express wrapper] ${exp}`);

	res.status(500).send("Internal Error");
}

ExpressWrapper.AUTH_NONE        = 1;
ExpressWrapper.AUTH_SECRET      = 2;
ExpressWrapper.AUTH_CERT        = 3;
ExpressWrapper.AUTH_JUST_DECODE = 4;

ExpressWrapper.LOG_NONE         = 0;
ExpressWrapper.LOG_REQUESTS     = 1;

module.exports = ExpressWrapper;

