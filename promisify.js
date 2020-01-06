/*
 * Copyright (c) 2016-present, IBM Research
 * Licensed under The MIT License [see LICENSE for details]
 */


'use strict';

/** Execute and convert callback based methods on promises
 * 
 * @param {*} owner the object that calls, the "this" of the method
 * @param {*} method the method itself, must receive a `callback(err, data)` as last argument
 * @param  {...any} args 
 */
function exec(owner, method, ...args)
{
	return new Promise((accept, reject) =>
	{
		let cb = (err, data) =>
		{
			if(err)
			{
				reject(err);
			}
			else
			{
				accept(data);
			}
		}
		method.apply(owner, [...args, cb]);

	})
}

exports.exec = exec;
