/*
 * Copyright (c) 2016-present, IBM Research
 * Licensed under The MIT License [see LICENSE for details]
 */

'use strict'

const WebSocket 	= require('ws');
const Observer 		= require("./observer");
const SyncMessages 	= require("./syncmessages");
const shortid		= require("shortid");

const DEFAULT_HEARTBEAT_INTERVAL = 30;

function SyncServer()
{
	this.sessions = {};
	this.clients = {};
	this.logLevel = 0;
	this.sessionStates = {};

	this.heartBeatInterval = DEFAULT_HEARTBEAT_INTERVAL;

	this.heartbeatBeatCallback = () =>
	{
		for(let k in this.clients)
		{
			let c = this.clients[k];
			c.ws.ping(() => {});
		}
	}

	Observer.initSubject(this);
}


SyncServer.prototype.broadcast = function(session, messages)
{
	_broadcast.call(this, null, session, messages);
}

SyncServer.prototype.updateState = function(sessionName)
{
	let state = shortid();
	this.sessionStates[sessionName] = state;

	let msg = {
		type: SyncMessages.SERVER_UPDATE_STATE,
		session: sessionName,
		data: {
			state: state
		}
	}
	_broadcast.call(this, null, sessionName, msg);
}

SyncServer.prototype.startListening = function(server)
{
	const wss = new WebSocket.Server(
	{
		server: server
	});

	
    
	wss.on('connection', (ws) =>
	{
		let clientId = shortid();
		console.log('-->connection open: #' + Object.keys(this.clients).length);
		ws.on('message', (message) =>
		{
			_onMessage.call(this, ws, clientId, message);
		});
		
		ws.on('close', () =>
		{
			console.log('-->connection closed: #' + Object.keys(this.clients).length);
			_onClose.call(this, clientId);
		});

		ws.on('pong', () =>
		{
			// console.log("pong", clientId);
		});
	});

	setInterval(this.heartbeatBeatCallback, this.heartBeatInterval * 1000);
}

SyncServer.prototype.stopListening = function()
{
	wss.close();
	clearInterval(this.heartbeatBeatCallback);
}

function _onMessage (ws, clientId, rawMessage)
{
	try
	{
		let message = JSON.parse(rawMessage);
		let type = message.type;
	
		if (type == SyncMessages.JOIN_MESSAGE)
		{
			_onJoinClient.call(this, ws, clientId, message);
		}
		else
		{
			this.notify("onSyncMessage", message.session, message);
			_broadcast.call(this, ws, message.session, [message]);
		}
	}
	catch(exp)
	{
		console.log(exp);
	}
}

function _onJoinClient(ws, clientId, message)
{
	let sessionName = message.session;
	let user = message.data.user;


	if(!this.sessions.hasOwnProperty(sessionName))
	{
		this.sessions[sessionName] = {};
		this.sessionStates[sessionName] = shortid();
	}

	let session = this.sessions[sessionName];

	if(!session.hasOwnProperty(user))
	{
		let peers = Object.keys(session);
		session[user] = {ws: ws};
		this.clients[clientId] = {user: user, ws: ws, session: sessionName};

		// Send to user that it is connected
		let successMessage = {
			type: SyncMessages.JOIN_SUCCESSFUL_MESSAGE, 
			session: sessionName,
			data: {
				user: user,
				state: this.sessionStates[sessionName]
			}
		};
		ws.send(JSON.stringify(successMessage));


		// Send to other users that a new user joined
		let newClientMsg = {
			type: SyncMessages.CLIENT_JOIN_MESSAGE, 
			session: sessionName,
			data: {user: user}
		};
		_broadcast.call(this, ws, sessionName, newClientMsg);

		// Send to the new user the already users connected
		for(let i = 0; i < peers.length; i++)
		{
			let previousUserMsg = {
				type: SyncMessages.CLIENT_JOIN_MESSAGE, 
				session: sessionName,
				data: {
					user: peers[i]
				}
			};

			ws.send(JSON.stringify(previousUserMsg));
		}
	}
	else
	{
		let failMsg = {
			type: SyncMessages.JOIN_FAILED_MESSAGE, 
			session: sessionName,
			data: {
				error: `User ${user} already connected`
			}
		};
		ws.send(JSON.stringify(failMsg));
	}

}

function _onClose(clientId)
{
	let client = this.clients[clientId];

	if(client)
	{
		if(this.sessions.hasOwnProperty(client.session))
		{
			delete this.sessions[client.session][client.user];
			let leftMsg = {
				type: SyncMessages.CLIENT_LEFT_MESSAGE,
				session: client.session,
				data: {user: client.user}
			}
			_broadcast.call(this, null, client.session, leftMsg)
		}
	}
	delete this.clients[clientId];
}

function _broadcast(wsSender, sessionName, messages = [])
{
	if(!messages)
	{
		return;
	}

	if(Array.isArray(messages))
	{
		if(messages.length === 0)
		{
			return;
		}
	}
	else
	{
		messages = [messages];
	}
	let session = this.sessions[sessionName];

	if (session)
	{
		for(let i = 0; i < messages.length; i++)
		{
			let msg = JSON.stringify(messages[i]);

			for(let k in session)
			{
				let client = session[k];
				if(client.ws !== wsSender)
				{
					client.ws.send(msg);
				}
			}
		}
	}
}

module.exports = SyncServer;