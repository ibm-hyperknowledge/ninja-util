/*
 * copyright: IBM Confidential
 * copyright: OCO Source Materials
 * copyright: © IBM Corp. All Rights Reserved
 * date: 2020
 *
 * IBM Certificate of Originality
 */

"use strict";

function Memory(logger)
{
	this.logger = logger || console;
}


Memory.prototype.compreensiveBytes = function(bytesCount)
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
        console.log.apply(this.logger, args.concat([getCurrentMemory()]));
    }
    else
    {
        logger.log("N/A");
        
    }
}

module.exports = Memory;