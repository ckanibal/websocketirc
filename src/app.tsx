// src/app.tsx
import * as React from "react";
import * as ReactDOM from "react-dom";
import xs from "xstream";

import { Client, IChannel } from "./irc";
import { Menu } from "./menu";
import { ChannelPane } from "./channelview";

const SERVER_ADDR = "ws://irc.cob.de.euirc.net:8080/irc";
const NICK = "clonkbot" + Math.ceil(Math.random() * 100);
const CHANNELS = ["#clonkbot"];

interface IAppState {
    client: Client;
    channels: IChannel[];
}

interface IAppProps extends React.Props<any> {
    server: string,
    nick: string,
    user?: string,
    realname?: string
}

class App extends React.Component<IAppProps, IAppState> {
    constructor(props: IAppProps) {
        super(props);

        const client = new Client(this.props.server, this.props.nick);
        xs.create(client).addListener({
            next: evt => {
                console.log("stream:", evt);

                switch (evt.cmd) {
                    case "376": // end of motd
                        CHANNELS.forEach(client.join);
                        break;
                    case "353":
                    case "JOIN":
                        this.handleChange(evt);
                        break;
                }
            },
            error: err => console.error(err),
            complete: () => console.log("completed"),
        });

        this.state = {
            client,
            channels: []
        }
    }

    handleChange(e) {
        this.setState({
            channels: this.state.client.channels
        });
    }

    render() {
        return (
            <div className="fullheight container">
                <div className="fullheight columns col-gapless">
                    <div className="column col-3 col-xs-12">
                        <Menu server={this.props.server} nick={this.props.nick} channels={this.state.channels}/>
                    </div>
                    <div className="column col-xs-12">
                        <ChannelPane channel={this.state.channels[0]}/>
                    </div>
                </div>
            </div>
        );
    }

    componentWillUnmount() {
        this.state.client.quit("Client exited");
    }
}

ReactDOM.render(
    <App server={SERVER_ADDR} nick={NICK}/>,
    document.getElementById("root")
);