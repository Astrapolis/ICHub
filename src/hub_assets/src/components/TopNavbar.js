import React, { useState, useEffect } from 'react';
import { Image, Button, Spin } from 'antd';
import { BrowserRouter as Router, Routes, Route, Redirect, Link, NavLink, useMatch, useNavigate } from "react-router-dom";
import logo from "./styles/logo.png";
import "./styles/TopNavbar.less";
import { useAuth } from '../auth';
import ProfileBar from './ProfileBar';

const TopNavbar = (props) => {
    const auth = useAuth();
    const nav = useNavigate();
    const loginMatch = useMatch({
        path: "/connect",
        end: true
    });
    const [authChecking, setAuthChecking] = useState(false);

    const doAuthCheck = async () => {
        setAuthChecking(true);
        try {
            console.log('checking auth status');
            let connected = await auth.isSignedIn();
            console.log('connect status', connected);
            if (connected) {
                auth.signin((success, relativeObject) => {
                    setAuthChecking(false);
                    if (success) {
                        nav("/devhub/admin");
                    }
                });
            } else {
                setAuthChecking(false);
            }
        } catch(err) {
            console.log('check auth error', err);
            setAuthChecking(false);
        }
        
    }
    useEffect(() => {
        doAuthCheck();
    }, []);


    return (
        <div className='main-header'>
            <div className="logo-container">
                <Image src={logo} width={108} height={28} preview={false} />
            </div>

            <div className='top-menu-container'>
                <NavLink to="/">
                    <span className='top-link'>Candid+</span>
                </NavLink>
            </div>
            {authChecking &&
                <div className='login-connect-container'>
                    <Spin />
                </div>
            }
            {!authChecking && !loginMatch && !auth.user && <div className='login-connect-container'>

                <Link to="/connect">
                    <span className='top-link emphasize-link'>Connect to IC</span>
                </Link>

                {/* {auth.user && <Button type='primary'>Disconnect from IC</Button>} */}

            </div>}
            {auth.user && <ProfileBar />}
        </div>
    )
}

export default TopNavbar;