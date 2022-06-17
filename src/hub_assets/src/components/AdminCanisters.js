import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Principal } from "@dfinity/principal";
import {
    message, Button, Table, Layout, Typography, PageHeader,
    Row, Col, Form, Input
} from 'antd';
import { PlusOutlined } from "@ant-design/icons"
import { DownloadOutlined } from '@ant-design/icons';
import { useAuth } from '../auth';
import { getCanisterList } from '../utils/devhubUtils';
import "./styles/AdminCanisters.less";

const { Header, Content } = Layout;
const { Text, Title } = Typography;

const AdminCanisters = (props) => {
    const [listLoading, setListLoading] = useState(false);
    const [listData, setListData] = useState([]);
    const { user } = useAuth();
    const nav = useNavigate();
    const [addMore, setAddMore] = useState(false);
    let loc = useLocation();

    const fetchCanisterList = async () => {
        setListLoading(true);

        let data = await getCanisterList(user);
        setListData(data);

        setListLoading(false);
    }

    const onFollowNew = async (values) => {
        nav('/candiplus/prefollow/' + values.newCanisterId, {
            state: {
                from: loc
            }
        });
    }

    useEffect(() => {
        fetchCanisterList();
    }, []);

    let columns = [{
        title: 'No',
        render: (_, record, index) => <span>{index}</span>
    }, {
        title: 'Name',
        dataIndex: 'name',
        render: (_, record) => <span>{record.name ? record.name : "<unnamed>"}</span>
    }, {
        title: 'Canister',
        dataIndex: 'canisterId',
        key: 'canisterId'
    }, {
        title: 'History Calls',
        dataIndex: 'historyCalls',
        key: 'historyCalls'
    }, {
        title: 'Last Call',
        dataIndex: 'lastCallAt',
        key: 'lastCallAt'
    }, {
        title: 'Candid',
        render: (_, entry) => <Button type="dashed" icon={<DownloadOutlined />} />
    }, {
        title: 'Operations',
        render: (_, entry) => <Button type="link">Unfollow</Button>
    }];

    return <>
        <PageHeader
            title="Canisters Followed"
            extra={[!addMore ? <Button size="large" type="primary" icon={<PlusOutlined />} onClick={() => {
                setAddMore(true);
            }} /> : <Form layout="inline" onFinish={onFollowNew}>
                <Form.Item name="newCanisterId"
                    validateFirst

                    rules={[{ required: true, message: 'Please enter canisterId!' }, {
                        message: 'not a principal format!',
                        validator: (_, value) => {
                            try {
                                let p = Principal.fromText(value);
                                return Promise.resolve();
                            } catch (err) {
                                return Promise.reject('invalid principal');
                            }
                        }
                    }]}
                >
                    <Input className='canisterid-input' placeholder='Enter New CanisterId' />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType='submit' size="large" >Follow</Button>
                </Form.Item>
                <Form.Item>
                    <Button htmlType='reset' size="large" onClick={
                        () => {
                            setAddMore(false);
                        }
                    } >Cancel</Button>
                </Form.Item>
            </Form>]} />
        <Layout>
            <Content>
                <Table bordered
                    rowKey={'canisterId'}
                    columns={columns}
                    pagination={false}
                    dataSource={listData}
                    loading={listLoading} />
            </Content>
        </Layout>
    </>

}

export default AdminCanisters;