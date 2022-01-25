/**
* Copyright (c) 2016-present, IBM Research
* Licensed under The MIT License [see LICENSE for details]
*/
export = SyncServer;
declare function SyncServer(authenticator: any): void;
declare class SyncServer {
    constructor(authenticator: any);
    sessions: {};
    clients: {};
    logLevel: number;
    sessionStates: {};
    authenticator: any;
    heartBeatInterval: number;
    heartbeatBeatCallback: () => void;
    broadcast(session: any, messages: any): void;
    updateState(sessionName: any): void;
    startListening(server: any): void;
    stopListening(): void;
}
