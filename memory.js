/*
 * Copyright (c) 2016-present, IBM Research
 * Licensed under The MIT License [see LICENSE for details]
 */

"use strict"; 


function compreensiveBytes(bytesCount)
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

function getCurrentMemory(asNumber = false)
{
    return asNumber ? process.memoryUsage().heapUsed : compreensiveBytes(process.memoryUsage().heapUsed)
}

function checkMemory (log = null)
{
	if(global.gc)
	{
		global.gc();
    }
    if(process)
    {
        if(log)
        {
            console.log(log, getCurrentMemory());
        }
        else
        {
            console.log(getCurrentMemory());
        }
    }
    else
    {
        if(log)
        {
            console.log(log, "N/A");
        }
        else
        {
            console.log("N/A");
        }
    }
}

exports.checkMemory = checkMemory;
exports.getCurrentMemory = getCurrentMemory;
exports.compreensiveBytes = compreensiveBytes;