// src/channelview.tsx
import * as React from "react";
import * as ReactDOM from "react-dom";

import { IChannel, IUser } from "./irc";
import { UserList } from "./userlist";

interface ChannelViewProps {
    channel: IChannel;
}

interface ChannelPaneProps {
    channel?: IChannel;
}

export const ChannelPane: React.SFC<ChannelPaneProps> = (props) => {
    if (props.channel) {
        return <ChannelView channel={props.channel} />;
    } else {
        return <NoChannelView />
    }
};

export const NoChannelView: React.SFC<{}> = () => {
    return (
        <div className="empty">
            <div className="empty-icon">
                <i className="icon icon-people"></i>
            </div>
            <p className="empty-title h5">You have not joined a channel yet</p>
            <p className="empty-subtitle">Click the 'Join' button to start a conversation.</p>
            <div className="empty-action">
                <button className="btn btn-primary">Join</button>
            </div>
        </div>
    );
};

export const ChannelView: React.SFC<ChannelViewProps> = (props) => {
    return (
        <div className="fullheight columns col-gapless">
            <div className="column col-xs-12">
                <div className="fullheight panel">
                    <div className="panel-header">
                        <div className="panel-title">{props.channel.topic}</div>
                    </div>
                    <div className="divider"></div>
                    <div className="fullheight panel-body">
                        &lt;clonkbot&gt; Hello World!
                    </div>
                    <div className="panel-footer">
                        <div className="input-group">
                            <span className="input-group-addon">...</span>
                            <input type="text" className="form-input" placeholder="..."></input>
                            <button className="btn btn-primary input-group-btn">Send</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="column col-3 col-xs-12">
                <UserList users={props.channel.users} />
            </div>
        </div>
    );
};