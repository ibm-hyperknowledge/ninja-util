/*
 * copyright: IBM Confidential
 * copyright: OCO Source Materials
 * copyright: © IBM Corp. All Rights Reserved
 * date: 2020
 *
 * IBM Certificate of Originality
 */
'use strict'

const jwt = require("jsonwebtoken");

class SyncJWTAuth
{
	constructor (secret)
	{
		this._secret = secret;
	}

	sign (message)
	{
		return { bearer: jwt.sign(message || {}, this._secret) };
	}

	verify ( { bearer } )
	{
		try
		{
			let decoded = jwt.verify (bearer, this._secret);
			return decoded;
		}
		catch (err)
		{
			return false;
		}
	}
}

module.exports = SyncJWTAuth;
