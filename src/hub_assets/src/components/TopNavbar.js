import React, { useState, useEffect } from 'react';
import { Image, Button } from 'antd';
import { BrowserRouter as Router, Routes, Route, Redirect, Link, NavLink, useMatch } from "react-router-dom";
import logo from "./styles/logo.png";
import "./styles/TopNavbar.less";
import { useAuth } from '../auth';
import ProfileBar from './ProfileBar';

const TopNavbar = (props) => {
    const auth = useAuth();
    const loginMatch = useMatch({
        path: "/connect",
        end: true
    });

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
            {!loginMatch && !auth.user && <div className='login-connect-container'>

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