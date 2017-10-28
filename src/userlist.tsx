// src/userlist.tsx
import * as React from "react";
import * as ReactDOM from "react-dom";

import { IChannel, IUser } from "./irc";

interface UserListProps {
    users: IUser[];
}

interface UserProps {
    user: IUser,
}
const User: React.SFC<UserProps> = (props) => {
    return (<li className="menu-item"><a href="#">{props.user.nick}</a></li>);
};

export const UserList: React.SFC<UserListProps> = (props) => {
    return (
        <ul className="menu">
            {
                props.users.map((user,idx) => (
                    <User key={idx} user={user} />
                ))
            }
        </ul>
    );
};