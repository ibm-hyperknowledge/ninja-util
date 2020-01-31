/*
 * copyright: IBM Confidential
 * copyright: OCO Source Materials
 * copyright: © IBM Corp. All Rights Reserved
 * date: 2020
 *
 * IBM Certificate of Originality
 */

"use strict";

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;

function Timer(logger)
{
	this.currentTime = new Date();

	this.logger = logger || console;
}

Timer.prototype.getCurrentTime = function()
{
	let past = parseFloat(this.currentTime.getTime());
		
	let now = new Date().getTime();
	now = parseFloat(now);
	
	return (now - past) / SECOND_MS;
}

Timer.prototype.getTimeString = function()
{
	let past = parseFloat(this.currentTime.getTime());

	let now = new Date().getTime();
	now = parseFloat(now);

	let deltaT = now - past;

	if(deltaT > HOUR_MS)
	{
		return (deltaT / HOUR_MS).toFixed(2) + "hrs";
	}
	else if(deltaT > MINUTE_MS)
	{
		return (deltaT / MINUTE_MS).toFixed(2) + "min";
	}
	else if(deltaT > SECOND_MS)
	{
		return (deltaT / SECOND_MS).toFixed(2) + "s";
	}
	else
	{
		return deltaT + "ms";
	}
}

Timer.prototype.restart = function()
{
	this.currentTime = new Date();
}

Timer.prototype.tick = function(...args)
{
    console.log.apply(this.logger, args.concat([this.getTimeString()]));
	this.restart();
}

module.exports = Timer;