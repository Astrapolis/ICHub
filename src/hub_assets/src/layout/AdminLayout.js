import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams, Outlet } from "react-router-dom";

import { Layout, Menu, message, Spin, Image, Row, Col } from 'antd';
import { DashboardOutlined, TableOutlined, AppstoreOutlined, AppstoreAddOutlined, HistoryOutlined } from '@ant-design/icons';
import AdminDashboard from '../components/AdminDashboard';
import Wellcome from '../components/Wellcome';
import Login from '../components/Login';
import TopNavbar from '../components/TopNavbar';

import AdminCaseHistory from '../components/AdminCaseHistory';
import FollowPreview from '../components/FollowPreview';
import { useAuth, RequireAuth } from '../auth';
import { getUserActiveConfigIndex } from '../utils/devhubUtils';
import "./styles/AdminLayout.less";
import logo from "../components/styles/logo.png";

const { Header, Footer, Sider, Content } = Layout;

// const AdminCase = React.lazy(() => import('../components/AdminCase'));
// const AdminNewCase = React.lazy(() => import('../components/AdminNewCase'));
// const AdminCanisters = React.lazy(() => import('../components/AdminCanisters'));

const DASHBOARD_KEY = "admin-dashboard";
const NEWCASE_KEY = "admin-newcases";
const CASE_KEY = "admin-case-";
const CASES_KEY = "admin-cases";
const CANISTER_KEY = "admin-canisters";
const HISTORY_KEY = "admin-history";
const AdminLayout = (props) => {
    const [activeRoute, setActiveRoute] = useState(NEWCASE_KEY);
    const [menuList, setMenuList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [caseList, setCaseList] = useState([]);
    const loc = useLocation();
    const nav = useNavigate();
    const { user, refreshUserConfig, isSignedIn, signin } = useAuth();
    let { caseid } = useParams();

    const dashboardMenu = {
        label: 'Dashboard',
        key: DASHBOARD_KEY,
        icon: <DashboardOutlined />
    };
    const caseMenu = {
        label: 'Test Cases', key: CASES_KEY, icon: <TableOutlined />
    };
    const canisterMenu = {
        label: 'Canisters', key: CANISTER_KEY, icon: <AppstoreOutlined />
    };
    const historyMenu = {
        label: 'History', key: HISTORY_KEY, icon: <HistoryOutlined />
    };

    const [authChecking, setAuthChecking] = useState(false);

    const doAuthCheck = async () => {
        setAuthChecking(true);
        try {
            console.log('checking auth status');
            let connected = await isSignedIn();
            console.log('connect status', connected);
            if (connected) {
                // if (!user) {
                console.log('ready signin to get user info')
                signin((success, relativeObject) => {
                    console.log('signin result', success, relativeObject);
                    setAuthChecking(false);
                });
                // }
            } else {
                setAuthChecking(false);
            }
        } catch (err) {
            console.log('check auth error', err);
            setAuthChecking(false);
        }

    }
    useEffect(() => {
        doAuthCheck();
    }, []);


    const loadUserConfig = async () => {
        setLoading(true);
        console.log('===========>call refresh user config');
        await refreshUserConfig();
        setLoading(false);
    }

    // TestCaseView
    const makeMenuList = (cases) => {
        console.log('makeMenuList', cases);
        let subMenus = [];
        cases.forEach(c => {
            if (typeof c.config === 'string') {
                c.config = JSON.parse(c.config);
            }
            let subm = {
                label: c.config.name,
                key: CASE_KEY + c.tag
            }
            subMenus.push(subm);
        });
        setCaseList([...cases]);
        caseMenu.children = [...subMenus, {
            label: 'New Case', key: NEWCASE_KEY, icon: <AppstoreAddOutlined />
        }];
        setMenuList([
            dashboardMenu,
            caseMenu, canisterMenu,
            // historyMenu
        ]);
    }

    const onMenuSelectChange = (menu) => {
        console.log('selected menu', menu);
        if (menu.key.startsWith(DASHBOARD_KEY)) {
            nav('dashboard');
        }
        if (menu.key.startsWith(NEWCASE_KEY)) {
            nav('newcase');
        }
        if (menu.key.startsWith(CANISTER_KEY)) {
            nav('canisters');
        }
        if (menu.key.startsWith(HISTORY_KEY)) {
            nav('history');
        }
        if (menu.key.startsWith(CASE_KEY)) {
            let cid = menu.key.substring(CASE_KEY.length);
            console.log('cid', cid);
            nav('testcases/' + cid, {
                state: {
                    caseid: cid
                }
            });
        }

    }

    // useEffect(() => {
    //     if (user) {
    //         // fetchCaseList();
    //         loadUserConfig();
    //     }
    // }, []);

    useEffect(() => {
        console.log('admin layout user changed', user);
        if (user) {
            if (user.devhubConfig) {
                console.log('user config', user.devhubConfig);
                makeMenuList(user.devhubConfig.test_cases);
            } else {
                // console.log('ready to refresh user config', callTimes);
                loadUserConfig();

            }
        } else {
            makeMenuList([]);
        }
    }, [user]);


    useEffect(() => {
        console.log('loc ===>', loc);
        // if (loc.pathname !== '/candidplus') {

        if (loc.pathname.startsWith('/candidplus/dashboard')) {

            setActiveRoute(DASHBOARD_KEY);
        }
        if (loc.pathname.startsWith('/candidplus/testcases')) {
            if (caseid) {
                setActiveRoute(CASE_KEY + caseid);
            } else {
                if (loc.state && loc.state.caseid) {
                    setActiveRoute(CASE_KEY + loc.state.caseid);
                } else {
                    nav('/candidplus/newcase');
                }
            }

        }
        if (loc.pathname.startsWith('/candidplus/newcase')) {
            setActiveRoute(NEWCASE_KEY);

        }
        if (loc.pathname.startsWith('/candidplus/canisters')) {
            setActiveRoute(CANISTER_KEY);

        }
        if (loc.pathname.startsWith('/candidplus/history')) {
            setActiveRoute(HISTORY_KEY);

        }

        // }
    }, [loc])
    console.log('render admin layout ', loading, authChecking);
    return (<Layout className='admin-root-container'>

        {/* {!user && <Navigate to="/connect" state={{ from: loc }} />} */}

        {(loading || authChecking) && <Spin />}
        {!loading && !authChecking && <>

            <Sider className='sider-container' collapsible={true}>
                <div className='logo-container'>
                    <Image src={logo} width={108} height={28} preview={false} />
                </div>


                <Menu items={menuList} mode="inline" defaultOpenKeys={[DASHBOARD_KEY]}
                    selectedKeys={[activeRoute]} onSelect={onMenuSelectChange} />
            </Sider>
            <div className='admin-content-container'>
                {/* <Header > */}
                <TopNavbar />
                {/* </Header> */}
                <Outlet />
            </div>
        </>}

    </Layout>)
}

export default AdminLayout;