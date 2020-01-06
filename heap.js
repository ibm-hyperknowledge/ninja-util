/*
 * Copyright (c) 2016-present, IBM Research.
 * Licensed under The MIT License [see LICENSE for details]
 */

'use strict'

function left (i)
{
	return 2*i + 1;
}

function right (i)
{
	return 2*i + 2;
}

function parent (i)
{
	return Math.floor (i/2);
}

function Heap()
{
 	this.data = [];
}

Heap.prototype.push = function(a)
{
	this.data.push (a);
	this.bubbleUp ();
}

Heap.prototype.pop = function()
{
	if (this.data.length === 0)
	{
		return false;
  }

	this.data[0] = this.data [ this.data.length - 1 ];
	this.data.splice(this.data.length - 1);
	this.heapify ();
	return true;
}

Heap.prototype.top = function()
{
	if (this.data.length > 0)
	{
		return this.data[0];
	}
	else
	{
		return null;
	}
}

Heap.prototype.bubbleUp = function ()
{
	let index = this.data.length - 1;
	let parentIndex = parent(index);

	let childValue = this.data[index];
	let parentValue = this.data[parentIndex];

	while (parentValue > childValue)
	{
	  let tmp = childValue;
		this.data[index] = parentValue;
		this.data[parentIndex] = tmp;

		index = parentIndex;
		parentIndex = parent(index);

		if (index === 0)
			break;

		childValue = this.data[index];
		parentValue = this.data[parentIndex];
	}
}

Heap.prototype.heapify = function ()
{
	let index = 0;
	let leftIndex = left (index);
	let rightIndex = right (index);

	let parentValue = this.data[index];
	let leftChild = this.data[leftIndex];
	let rightChild = this.data[rightIndex];

	function minor (a, b)
	{
		return a < b ? a : b;
	}

	let minorValue = minor (minor (parentValue, leftChild), rightChild);

	while (parentValue > minorValue)
	{
		this.data[index] = minorValue;

		if (leftChild === minorValue)
		{
			index = leftIndex;
		}
		else
		{
			index = rightIndex;
		}

		this.data[index] = parentValue;

		leftIndex = left (index);
		rightIndex = right (index);

		if (leftIndex >= this.data.length || rightIndex >= this.data.length)
			break;

		parentValue = this.data[index];
		leftChild = this.data[leftIndex];
		rightChild = this.data[rightIndex];

		minorValue = minor (minor (parentValue, leftChild), rightChild);
	}
}

module.exports = Heap;
