// irc.ts
import { Listener, Producer } from "xstream"

export interface User {
    address: string,
    nick: string,
    user: string,
    host: string,
}

export interface Event {
    raw: string,
    source?: string,
    cmd?: string,
    user?: User,
    params?: string[],
    target?: string,
    text?: string,
}

export class Client implements Producer<Event> {
    private socket: WebSocket;
    private nick: string;
    private user: string;
    private realname: string;
    private _channels: IChannel[] = [];
    get channels() {
        return this._channels;
    }

    set channels(channels) {
        this._channels = channels;
    }

    private listener: Listener<Event>;

    constructor(server_addr: string, nick: string, user: string = nick, realname: string = user) {
        this.nick = nick;
        this.user = user;
        this.realname = realname;
        this.channels = [];

        console.log("start socket ...");
        this.socket = new WebSocket(server_addr);
        this.socket.onmessage = this.onmessage;
        this.socket.onerror = this.onerror;
        this.socket.onopen = this.onopen;
    }

    start(listener: Listener<Event>) {
        this.listener = listener;
    }

    stop() {
        this.listener = null;
    }

    onmessage = (event) => {
        event.data.split(/\r\n|\n/).forEach((line) => {
            console.log(line);
            const args = Protocol.parseMessage(line);
            if (args) {
                switch (args.cmd) {
                    case "PING":
                        this.onping(args);
                        break;
                    case "JOIN":
                        this.onjoin(args);
                        break;
                    case "PART":
                        this.onpart(args);
                        break;
                    case "332":
                    case "353":
                    case "376":
                        this.onnumeric(args);
                    default:
                        break;
                }
            }
        });
    };

    onerror = (event) => {
        console.log(event);
    };

    onopen = (event) => {
        // send NICK
        this.socket.send(`NICK ${this.nick}`);
        // send USER
        this.socket.send(`USER ${this.user} 0 * :${this.realname}`)
    };

    onping = (args) => {
        this.socket.send(`PONG :${args.text}`);
    };

    onjoin = (args) => {
        this._channels.push({
            name: args.text,
            users: [],
            topic: "",
        });
        if (this.listener) {
            this.listener.next(args);
        }
    };

    onpart = (args) => {
        this.channels = this.channels.filter(chan => chan.name != args.text);

        if (this.listener) {
            this.listener.next(args);
        }
    };

    onnumeric = (args) => {
        switch (args.cmd) {
            // TOPIC
            case "332":
                this.channels.find(chan => chan.name === args.params[1]).topic = args.text;
                break;
            // NAMES
            case "353":
                this.channels.find(chan => chan.name === args.params[2]).users = args.text.trim().split(" ")
                    .map(nick => ({
                        address: undefined,
                        nick,
                        user: undefined,
                        host: undefined,
                    }));
                break;
            default:
                break;
        }

        if (this.listener) {
            this.listener.next(args);
        }
    };

    join = (channel) => {
        this.socket.send(`JOIN ${channel}`);
    };

    part = (channel, reason?) => {
        if (reason) {
            this.socket.send(`PART ${channel} ${reason}`);
        } else {
            this.socket.send(`PART ${channel}`);
        }
    };

    quit = (reason?) => {
        if (reason) {
            this.socket.send(`QUIT :${reason}`);
        } else {
            this.socket.send(`QUIT:`);
        }
    }
}

class Protocol {
    public static parseMessage = (line: string): Event => {
        const m = line.match(/^(:(\S+)\s+)?(\S+)(\s+(?!:)(.+?))?(\s+:(.+))?\r?$/);
        if (m) {
            let [raw, , source, cmd, , param_string, , text] = m;
            let params = [];
            if (param_string) {
                params = param_string.trim().split(/\s+/);
            }
            let target = params ? params[0] : null;
            let user = source ? source.match('([^!]+)!([^@]+)@(\\S+)') : null;
            if (!user) user = [source, source];
            return {
                raw: raw,
                source: source,
                cmd: cmd,
                user: user ? {
                    address: user[0],
                    nick: user[1],
                    user: user[2],
                    host: user[3]
                } : null,
                params: params,
                target: target,
                text: text
            };
        }
    }
}

export interface IChannel {
    name: string;
    users: IUser[];
    topic: string;
}

export interface IUser {
    nick: string;
}
