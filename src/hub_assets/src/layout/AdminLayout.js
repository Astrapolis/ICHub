import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";

import { Layout, Menu, message, Spin } from 'antd';
import { DashboardOutlined, TableOutlined, AppstoreOutlined, AppstoreAddOutlined, HistoryOutlined } from '@ant-design/icons';
import AdminDashboard from '../components/AdminDashboard';
import Wellcome from '../components/Wellcome';
import Login from '../components/Login';

import AdminCaseHistory from '../components/AdminCaseHistory';
import FollowPreview from '../components/FollowPreview';
import { useAuth, RequireAuth } from '../auth';
import { getUserActiveConfigIndex } from '../utils/devhubUtils';
import "./styles/AdminLayout.less";

const { Header, Footer, Sider, Content } = Layout;

const AdminCase = React.lazy(() => import('../components/AdminCase'));
const AdminNewCase = React.lazy(() => import('../components/AdminNewCase'));
const AdminCanisters = React.lazy(() => import('../components/AdminCanisters'));

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
    const { user, refreshUserConfig } = useAuth();
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
    const loadUserConfig = async () => {
        setLoading(true);
        await refreshUserConfig();
        setLoading(false);
    }

    // TestCaseView
    const makeMenuList = (cases) => {
        let subMenus = [];
        cases.forEach(c => {
            c.config = JSON.parse(c.config);
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
            //dashboardMenu, 
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

    useEffect(() => {
        if (user) {
            // fetchCaseList();
            loadUserConfig();
        }
    }, []);

    useEffect(() => {
        if (user && user.devhubConfig) {
            console.log('user config', user.devhubConfig);
            makeMenuList(user.devhubConfig.test_cases);
        }
    }, [user]);


    useEffect(() => {
        console.log('loc ===>', loc);
        if (loc.pathname !== '/candidplus') {

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
        }
    }, [loc])
    return (<Layout className='admin-root-container'>

        {/* {!user && <Navigate to="/connect" state={{ from: loc }} />} */}

        {loading && <Spin />}
        {!loading && <>
            <Sider className='sider-container' collapsible={true}>
                <Menu items={menuList} mode="inline" defaultOpenKeys={[CASES_KEY]}
                    selectedKeys={[activeRoute]} onSelect={onMenuSelectChange} />
            </Sider>
            <Layout className='admin-content-container'>
                <Routes>
                    <Route path='dashboard' element={<Wellcome />} />

                    <Route path='prefollow/:canisterId' element={<FollowPreview />} />
                    {/* <Route path='dashboard' element={<AdminDashboard />} /> */}
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
                    {/* <Route path='history' element={<AdminCaseHistory />} /> */}
                </Routes>
            </Layout>
        </>}

    </Layout>)
}

export default AdminLayout;