import React, { useContext, useState, useEffect, useRef } from 'react';
import { Principal } from "@dfinity/principal";
import { message, Button, Table, Layout } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useAuth } from '../auth';
import { getCanisterList } from '../utils/devhubUtils';

const { Header, Content } = Layout;

const AdminCanisters = (props) => {
    const [listLoading, setListLoading] = useState(false);
    const [listData, setListData] = useState([]);
    const { user } = useAuth();


    const fetchCanisterList = async () => {
        setListLoading(true);

        let data = await getCanisterList(user);
        setListData(data);

        setListLoading(false);
    }

    useEffect(() => {
        fetchCanisterList();
    }, []);

    let columns = [{
        title: 'No',
        render: (_,record,index) => <span>{index}</span>
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
        <div className='content-header-container canister-toolbar'>Canisters Followed</div>
        <div>
            <Table bordered
            rowKey={'canisterId'}
            columns={columns} 
            dataSource={listData} 
            loading={listLoading} />
        </div>

    </>
}

export default AdminCanisters;