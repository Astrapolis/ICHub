import React, { useState, useEffect } from 'react';
import { Principal } from "@dfinity/principal";
import { useAuth } from '../auth';
import { useParams, useNavigate } from "react-router-dom";
import { Button, Tooltip } from 'antd';
import { LogoutOutlined, ContactsOutlined } from "@ant-design/icons";
import './styles/ProfileBar.less';

const ProfileBar = (props) => {
    const auth = useAuth();

    let principalId = auth.user.identity.getPrincipal().toText();

    return (<div className='profilebar-container'>
        <Button icon={<ContactsOutlined />} />
        <Tooltip placement="bottom" title={principalId}>
            <div className='principal-container'>
                {principalId}
            </div>
        </Tooltip>
        <Button icon={<LogoutOutlined />} onClick={() => {
            auth.signout();
        }}/>
    </div>)
}

export default ProfileBar;