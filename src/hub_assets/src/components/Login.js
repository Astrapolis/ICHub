import React, { useState, createContext, useContext } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    useNavigate,
    useLocation
} from "react-router-dom";

import { Button } from "antd";
import { useAuth } from '../auth';

const Login = (props) => {
    let nav = useNavigate();
    let location = useLocation();

    const auth = useAuth();
    const [connecting, setConnecting] = useState(false);

    let { from } = location.state || { from: { pathname: "/" } };
    return (
        <div>

            <Button type="primary" loading={connecting} onClick={() => {
                setConnecting(true);
                auth.signin((success, provider) => {
                    setConnecting(false);
                    if (success) {
                        nav(from);
                    }
                });

            }}>
                Connect by II
            </Button>
        </div>

    )
}

export default Login;