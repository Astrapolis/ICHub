import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";

import { Layout, Menu } from 'antd';
import { DashboardOutlined, TableOutlined, AppstoreOutlined, AppstoreAddOutlined, HistoryOutlined } from '@ant-design/icons';
import AdminDashboard from '../components/AdminDashboard';
import AdminCase from '../components/AdminCase';
import AdminNewCase from '../components/AdminNewCase';
import AdminCanisters from '../components/AdminCanisters';
import AdminCaseHistory from '../components/AdminCaseHistory';
import { useAuth } from '../auth';
import "./styles/AdminLayout.less";

const { Header, Footer, Sider, Content } = Layout;

const DASHBOARD_KEY = "admin-dashboard";
const NEWCASE_KEY = "admin-newcases";
const CASE_KEY = "admin-case-";
const CANISTER_KEY = "admin-canisters";
const HISTORY_KEY = "admin-history";
const AdminLayout = (props) => {
    const [activeRoute, setActiveRoute] = useState(NEWCASE_KEY);
    // const [loading, setLoading] = useState(false);
    const loc = useLocation();
    const nav = useNavigate();
    const { user } = useAuth();

    const menuItems = [{ label: 'Dashboard', key: DASHBOARD_KEY, icon: <DashboardOutlined /> }, {
        label: 'Cases', key: 'admin-cases', icon: <TableOutlined />, children: [{
            label: 'New Case', key: NEWCASE_KEY, icon: <AppstoreAddOutlined />
        }]
    }, {
        label: 'Canisters', key: CANISTER_KEY, icon: <AppstoreOutlined />
    }, {
        label: 'History', key: HISTORY_KEY, icon: <HistoryOutlined />
    }
    ];

    const onMenuSelectChange = (menu) => {
        console.log('selected menu', menu);
        if (menu.key.startsWith(DASHBOARD_KEY)) {
            nav('/devhub/admin/dashboard');
        }
        if (menu.key.startsWith(NEWCASE_KEY)) {
            nav('/devhub/admin/newcase');
        }
        if (menu.key.startsWith(CANISTER_KEY)) {
            nav('/devhub/admin/canisters');
        }
        if (menu.key.startsWith(HISTORY_KEY)) {
            nav('/devhub/admin/history');
        }
        if (menu.key.startsWith(CASE_KEY)) {
            let caseid = menu.key.substring(CASE_KEY.length);
            nav('/devhub/admin/cases/' + caseid);
        }

    }

    useEffect(() => {
        // if (!user) {
        //     nav('/connect', { state: { from: loc } });
        // }
    }, []);

    useEffect(() => {
        console.log('loc ===>', loc);
        if (loc.pathname !== '/devhub/admin') {

            if (loc.pathname.startsWith('/devhub/admin/dashboard')) {

                setActiveRoute(DASHBOARD_KEY);
            }
            if (loc.pathname.startsWith('/devhub/admin/cases')) {
                let { caseid } = useParams();
                setActiveRoute(CASE_KEY + caseid);

            }
            if (loc.pathname.startsWith('/devhub/admin/newcase')) {
                setActiveRoute(NEWCASE_KEY);

            }
            if (loc.pathname.startsWith('/devhub/admin/canisters')) {
                setActiveRoute(CANISTER_KEY);

            }
            if (loc.pathname.startsWith('/devhub/admin/history')) {
                setActiveRoute(HISTORY_KEY);

            }
        }
    }, [loc])
    return (<Layout>
        {!user && <Navigate to="/connect" state={{ from: loc }} />}
        {user && <>
            <Sider className='sider-container'>
                <Menu items={menuItems} mode="inline" selectedKeys={[activeRoute]} onSelect={onMenuSelectChange} />
            </Sider>
            <Layout>
                <Routes>
                    <Route path='/' element={<Navigate replace to="dashboard" />} />

                    <Route path='dashboard' element={<AdminDashboard />} />
                    <Route path='cases/:caseid' element={<AdminCase />} />
                    <Route path='newcase' element={<AdminNewCase />} />
                    <Route path='canisters' element={<AdminCanisters />} />
                    <Route path='history' element={<AdminCaseHistory />} />
                </Routes>
            </Layout>
        </>}
    </Layout>)
}

export default AdminLayout;