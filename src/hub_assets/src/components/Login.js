import React, { useState, createContext, useContext } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    useNavigate,
    useLocation
} from "react-router-dom";


import { Button, message, Card } from "antd";
import { useAuth } from '../auth';
import "./styles/login.less";

const Login = (props) => {
    let nav = useNavigate();
    let location = useLocation();

    const auth = useAuth();
    const [connecting, setConnecting] = useState(false);
    const [loginResult, setLoginResult] = useState(null);

    let { from } = location.state || { from: { pathname: "/" } };
    return (
        <div className='login-content-container'>
            <Card title="Connect To II">

                <Button type="primary" loading={connecting} size="large" onClick={() => {
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
                    Connect
                </Button>

                {loginResult && <Button type="dashed" onClick={() => { auth.signout(() => { }) }}>Logout</Button>}
            </Card>
        </div>

    )
}

export default Login;