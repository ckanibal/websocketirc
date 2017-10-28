// src/menu.tsx
import * as React from "react";
import * as ReactDOM from "react-dom";

import { IChannel } from "./irc";

interface IMenuProps {
    server: string,
    nick: string,
    channels: IChannel[];
}

interface IMenuState {
}


export class Menu extends React.Component<IMenuProps, IMenuState> {
    constructor(props: IMenuProps) {
        super(props);
    }


    render() {
        const channelItems = this.props.channels.map((channel, idx) =>
            <div key = {idx} className="tile tile-centered">
                <span className="chip">#</span>
                <div className="tile-content">
                    <div className="tile-title">{channel.name.replace(/^\#+/g, '')}</div>
                </div>
                <div className="tile-action">
                    <button className="btn btn-link btn-action btn-lg"><i className="icon icon-cross"></i></button>
                </div>
            </div>
        );

        return (
            <div className="fullheight panel">
                <div className="panel-header text-center">
                    <figure className="avatar avatar-lg">
                        <img src={`https://api.adorable.io/avatars/128/${this.props.nick}`} alt="Avatar"></img>
                    </figure>
                    <div className="panel-title h5 mt-10">{this.props.nick}</div>
                    <div className="panel-subtitle text-ellipsis">{this.props.server}</div>
                </div>
                <div className="fullheight panel-body">
                    {channelItems}
                </div>
                <div className="panel-footer">
                    <button className="btn btn-primary btn-block">Disconnect</button>
                </div>
            </div>
        );
    }
}