import React, { useState, createContext, useContext } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    useNavigate,
    useLocation
} from "react-router-dom";

import { Button, message } from "antd";
import { useAuth } from '../auth';

const Login = (props) => {
    let nav = useNavigate();
    let location = useLocation();

    const auth = useAuth();
    const [connecting, setConnecting] = useState(false);
    const [loginResult, setLoginResult] = useState(null);

    let { from } = location.state || { from: { pathname: "/" } };
    return (
        <div>

            <Button type="primary" loading={connecting} onClick={() => {
                setConnecting(true);
                auth.signin((success, provider) => {
                    setConnecting(false);
                    if (success) {
                        nav(from);
                    } else {
                        message.error(provider);
                        setLoginResult(provider);

                    }
                });

            }}>
                Connect by II
            </Button>

            {loginResult && <Button type="dashed" onClick={() => { auth.signout(() => { }) }}>Logout</Button>}
        </div>

    )
}

export default Login;