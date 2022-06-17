import React, { useState, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { Layout, Menu, PageHeader, Image, Button, Spin, Typography, Space } from 'antd';
import { InternetIdentity } from "@connect2ic/core/providers/internet-identity"
import { useConnect, useDialog, useProviders, Connect2ICProvider, ConnectButton, ConnectDialog } from "@connect2ic/react"
import { BrowserRouter as Router, Routes, Route, Redirect, Link, NavLink, useMatch, useLocation, Navigate } from "react-router-dom";

// import "@connect2ic/core/style.css"
// import "antd/dist/antd.css";
import "./index.less";

import * as hub from "../../../.dfx/local/canisters/hub";
import { AuthProvide, RequireAuth } from './auth';
import Login from './components/Login';
import Wellcome from './components/Wellcome';
import NotFoundPage from './components/NotFoundPage';
import TopNavbar from './components/TopNavbar';
const FollowPreview = React.lazy(() => import('./components/FollowPreview'));
const AdminLayout = React.lazy(() => import('./layout/AdminLayout'));
const AdminCase = React.lazy(() => import('./components/AdminCase'));
const AdminNewCase = React.lazy(() => import('./components/AdminNewCase'));
const AdminCanisters = React.lazy(() => import('./components/AdminCanisters'));
const { Sider, Content, Header } = Layout;
const { Text } = Typography;

// const host = window.location.origin
const App = (props) => {
    return (
        // <Connect2ICProvider
        //     /*
        //      * Disables dev mode in production
        //      * Should be enabled when using local canisters
        //      */
        //     dev={true}
        //     /*
        //      * Can be consumed throughout your app like this:
        //      *
        //      * const [counter] = useCanister("counter")
        //      *
        //      * The key is used as the name. So { canisterName } becomes useCanister("canisterName")
        //      */
        //     canisters={{
        //         hub,
        //     }}
        //     /*
        //      * List of providers
        //      */
        //     providers={[InternetIdentity]}
        //     host={host}
        // >

        <AuthProvide>
            <Router>
                {/* <div className="root-layout"> */}
                <Layout className='root-layout'>
                    {/* <Header className='top-nav-container'>
                        <TopNavbar />
                    </Header> */}

                    <Content className='root-content'>
                        <Routes>
                            <Route path='/' element={<Navigate to="candidplus/dashboard" replace />} />
                            <Route path='connect' element={<Login />} />
                            <Route path='candidplus' element={
                                // <React.Suspense fallback={<Spin />}>
                                //     <RequireAuth>
                                <AdminLayout />
                                //     </RequireAuth>
                                // </React.Suspense>
                            } >
                                <Route index element={<Wellcome />} />
                                <Route path="dashboard" element={<Wellcome />} />
                                <Route path='prefollow/:canisterId' element={<FollowPreview />} />
                                <Route path='testcases/:caseid' element={
                                    <React.Suspense fallback={<Spin />}>
                                        <RequireAuth>
                                            <AdminCase />
                                        </RequireAuth>
                                    </React.Suspense>
                                } />
                                <Route path='newcase' element={
                                    <React.Suspense fallback={<Spin />}>
                                        <RequireAuth>
                                            <AdminNewCase />
                                        </RequireAuth>
                                    </React.Suspense>
                                } />
                                <Route path='canisters' element={
                                    <React.Suspense fallback={<Spin />}>
                                        <RequireAuth>
                                            <AdminCanisters />
                                        </RequireAuth>
                                    </React.Suspense>
                                } />

                            </Route>
                            <Route path='*' element={<NotFoundPage />} />
                        </Routes>
                    </Content>
                </Layout>
                {/* </div> */}
            </Router>
        </AuthProvide>

        // {/* </Connect2ICProvider> */}
    );
}
const container = document.getElementById('ichub_app');
const root = createRoot(container)
root.render(<App />);
