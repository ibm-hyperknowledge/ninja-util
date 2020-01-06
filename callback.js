/*
 * Copyright (c) 2016-present, IBM Research.
 * Licensed under The MIT License [see LICENSE for details]
 */

"use strict"; 

function invokeCallback (callback, ...args)
{
  if (callback && typeof (callback) === 'function')
    callback (...args);
}

exports.invoke = invokeCallback;
