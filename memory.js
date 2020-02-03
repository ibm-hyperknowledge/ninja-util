/*
 * Copyright (c) 2016-present, IBM Research
 * Licensed under The MIT License [see LICENSE for details]
 */

"use strict";



function compreensiveBytes (bytesCount)
{
	if(bytesCount < 1024)
	{
		return `${bytesCount}b`;
	}
	else if(bytesCount < 1024 * 1024)
	{
		return `${ (bytesCount / 1024).toFixed(2)}kb`;
	}
	else
	{
		return `${ (bytesCount / (1024 * 1024)).toFixed(2)}mb`;
	}
}

function Memory(logger)
{
	this.logger = logger || console;
}

Memory.prototype.getCurrentMemory = function (asNumber = false)
{
    return asNumber ? process.memoryUsage().heapUsed : compreensiveBytes(process.memoryUsage().heapUsed)
}

Memory.prototype.checkMemory = function (...args)
{
    if(global.gc)
	{
        global.gc();
    }
    if(process)
    {
        this.logger.log.apply(this.logger, args.concat([this.getCurrentMemory()]));
    }
    else
    {
        logger.log("N/A");
        
    }
}

function checkMemory(...args)
{
	let memory = new Memory();
	memory.checkMemory(...args);
}

Memory.checkMemory = checkMemory;
module.exports = Memory;