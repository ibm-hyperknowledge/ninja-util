/**
* Copyright (c) 2016-present, IBM Research
* Licensed under The MIT License [see LICENSE for details]
*/
/** Execute and convert callback based methods on promises
 *
 * @param {*} owner the object that calls, the "this" of the method
 * @param {*} method the method itself, must receive a `callback(err, data)` as last argument
 * @param  {...any} args
 */
export function exec(owner: any, method: any, ...args: any[]): any;
