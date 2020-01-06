/*
 * Copyright (c) 2016-present, IBM Research
 * Licensed under The MIT License [see LICENSE for details]
 */

'use strict';

const DEFAULT_ERROR_CODE = 500;
const ERROR_NAME = 'NHttpError';

const MESSAGES = require('./http-error-messages.json');

class NHttpError extends Error
{
	constructor(code, payload)
	{
		super(payload);
		this.name = ERROR_NAME;
		this.code = (code >= 400 && code < 600 ? code : DEFAULT_ERROR_CODE);

		if (payload)
		{
			this.payload = payload;
		}
		else
		{
			if (MESSAGES.hasOwnProperty(this.code))
			{
				this.payload = MESSAGES[this.code];
			}
			else
			{
				this.payload = '';
			}
		}
	}
}

module.exports = NHttpError;