/*
 * Copyright (c) 2016-present, IBM Research
 * Licensed under The MIT License [see LICENSE for details]
 */

'use strict';

const Observer = require("./observer");

const SyncMessages = require("./syncmessages");

const onSyncConnecting   = "onSyncConnecting";
const onSyncConnected    = "onSyncConnected";
const onSyncDesconnected = "onSyncDesconnected";
const onSyncClosed       = "onSyncClosed";
const onSyncMessage      = "onSyncMessage";
const onSyncJoined       = "onSyncJoined";
const onSyncJoining      = "onSyncJoining";
const onSyncJoinFailed   = "onSyncJoinFailed";
const onClientJoined     = "onClientJoined";
const onClientLeft       = "onClientLeft";

const WEBSOCKET = typeof (window) === 'undefined' ? require ('ws') : WebSocket;

function SyncClient(url, authenticator)
{
	this._ws = null;
	this.pendingMessages = [];
	this.user = null;
	this.session = null;
	this.sessionState = null;
	this.closed = false;
	this.authenticator = authenticator;

	this._tries = 0;

	if(!url)
	{
		let wsPrefix = "ws://";

		if(window)
		{
			if (window.location.protocol.startsWith("https"))
			{
				wsPrefix = "wss://";
			}
			this._url = wsPrefix + window.location.host + window.location.pathname;
		}
	}
	else
	{
		this._url = url;
	}

	Observer.initSubject(this);
	this.connect();
}


SyncClient.prototype.connectToSession = function(user, session)
{
	_sendJoinMessage.call(this, user, session);
}

SyncClient.prototype.sendMessage = function(type, data, session = undefined)
{
	let message = {
		type: type,
		session: this.session || session,
		data: data
	};

	if (this.authenticator)
	{
		message.auth = this.authenticator.sign (message);
	}

	if(this._ws.readyState === WEBSOCKET.OPEN)
	{
		this._ws.send(JSON.stringify(message));
	}
	else
	{
		this.pendingMessages.push(message);
	}
}

SyncClient.prototype.connect = function()
{
	this.closed = false;
	this._ws = new WEBSOCKET(this._url);

	_notifyStatus.call(this);

	this._ws.onopen = (event) =>
	{
		_onOpen.call(this, event);
	}

	this._ws.onmessage = (event) =>
	{
		_onMessage.call(this, event);
	}

	this._ws.onclose = (event) =>
	{
		_onClose.call(this, event);
	}
}

SyncClient.prototype.closeSession = function()
{
	this.closed = true;
	this._ws.close();
	this.notify(onSyncClosed);

	console.log("close session");
}

function _onMessage(event)
{
	let message = JSON.parse(event.data);
	let type = message.type;

	if (type === SyncMessages.JOIN_SUCCESSFUL_MESSAGE)
	{
		this.user = message.data.user;
		this.session = message.session;

		if(!this.sessionState)
		{
			this.sessionState = message.data.state;
		}

		if(this.sessionState === message.data.state)
		{
			this.sessionState = message.data.state;
			this.notify(onSyncJoined, this.user);

			_sendPendingMessages.call(this);
		}
		else
		{
			// this.closeSession();
			this.notify(onSyncJoinFailed);
		}
	}
	else if(type === SyncMessages.JOIN_FAILED_MESSAGE)
	{
		this.notify(onSyncJoinFailed, message.data.error);
	}
	else if(type === SyncMessages.CLIENT_JOIN_MESSAGE)
	{
		this.notify(onClientJoined, message.data.user);
	}
	else if(type === SyncMessages.CLIENT_LEFT_MESSAGE)
	{
		this.notify(onClientLeft, message.data.user);
	}
	else if(type === SyncMessages.SERVER_UPDATE_STATE)
	{
		this.sessionState = message.data.state;
	}
	else
	{
		this.notify(onSyncMessage, message);
	}
}

function _sendJoinMessage(user, session)
{
	this.notify(onSyncJoining);
	this.sendMessage(SyncMessages.JOIN_MESSAGE, {user: user}, session);
}

function _onOpen(event)
{
	_notifyStatus.call(this);

	this.tries = 0;

	if(this.user && this.session)
	{
		_sendJoinMessage.call(this);
	}
	else
	{
		// In case of joining message
		_sendPendingMessages.call(this);
	}
}

function _sendPendingMessages()
{
	if(this.pendingMessages.length > 0)
	{
		for(let i = 0; i < this.pendingMessages.length; i++)
		{
			let msg = this.pendingMessages[i];
			this._ws.send(JSON.stringify(msg));
		}
	}
	this.pendingMessages = [];
}

function _onClose(event)
{
	_notifyStatus.call(this);

	if(!this.closed)
	{
		_reconnect.call(this);
	}
}

function _notifyStatus()
{
	if (this._ws.readyState === WEBSOCKET.CONNECTING)
	{
		this.notify(onSyncConnecting, this);
	}
	else if (this._ws.readyState === WEBSOCKET.OPEN)
	{
		console.log("websocket connection is open");
		this.notify(onSyncConnected, this);
	}
	else if (this._ws.readyState === WEBSOCKET.CLOSING)
	{
		// Empty.
	}
	else if (this._ws.readyState === WEBSOCKET.CLOSED)
	{
		console.log("websocket connection is closed");
		this.notify(onSyncDesconnected, this);
	}
	else
	{
		// Unknown state
		console.warn("Unknow state", this._ws.readyState);
	}
}

function _reconnect()
{
	let timeToReconnect = 0;
	if(this.tries === 0)
	{
		this.connect();
		return;
	}
	else if( this.tries === 1)
	{
		timeToReconnect = 5000;
	}
	else if(this.tries === 2)
	{
		timeToReconnect = 15000;
	}
	else if(this.tries === 3)
	{
		timeToReconnect = 30000;
	}
	else if(this.tries > 3)
	{
		timeToReconnect = 60000;
	}
	console.log(`Reconecting in ${timeToReconnect} ms`);

	this.tries++;
	setTimeout(() =>
	{
		this.connect();
	}, timeToReconnect );

}

module.exports = SyncClient;
