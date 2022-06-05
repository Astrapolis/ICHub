import React, { useContext, useState, useEffect, useRef } from 'react';
import { Principal } from "@dfinity/principal";
import { message, Button, Table, Layout } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useAuth } from '../auth';
import { getUserActiveConfigIndex, extractCanisterCfgList } from '../utils/devhubUtils';

const { Header, Content } = Layout;

const AdminCanisters = (props) => {
    const [listLoading, setListLoading] = useState(false);
    const [listData, setListData] = useState([]);
    const { user } = useAuth();

    const postData = (rawCanisterList) => {
        let data = [];
        rawCanisterList.forEach((entry, index) => {
            let row = {
                no: index + 1,
                name: entry.config.name || "<unnamed>",
                canisterId: entry.canister_id.toText(),
                historyCalls: 0,
                lastCallAt: 0
            }
            data.push(row);
        });
        console.log('canister list ===>', data);
        setListData(data);
    }

    const getCanisterList = async () => {
        setListLoading(true);
        try {
            let userConfig = await user.devhubActor.get_user_config(getUserActiveConfigIndex(user));
            if (userConfig.UnAuthenticated) {
                console.log('list failed', userConfig.UnAuthenticated);
                message.error(userConfig.UnAuthenticated)
            } else {
                let canisterList = extractCanisterCfgList(userConfig);
                postData(canisterList);
            }

            // TODO: extract call history summary data

        } catch (err) {
            console.log('get canister list failed', err)
            message.error('get canister list failed ' + err);
        }

        setListLoading(false);
    }

    useEffect(() => {
        getCanisterList();
    }, []);

    let columns = [{
        title: 'No',
        dataIndex: 'no',
        key: 'no'
    }, {
        title: 'Name',
        dataIndex: 'name',
        key: 'name'
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
        <div className='content-header-container'>Canisters Followed</div>
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