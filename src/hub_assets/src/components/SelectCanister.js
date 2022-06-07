import React, { useContext, useState, useEffect, useRef } from 'react';

import { message, Button, Table, Layout } from 'antd';
import { ArrowRightOutlined } from "@ant-design/icons";

const SelectCanister = (props) => {

    const columns = [{
        title: 'No',
        render: (_, record, index) => <span>{index + 1}</span>
    }, {
        title: 'Name',
        dataIndex: 'name',
        render: (_, record) => <span>{record.name ? record.name : "<unnamed>"}</span>
    }, {
        title: 'Canister',
        dataIndex: 'canisterId',
        width: 400,
    }, {
        title: '',
        render: (_, record) => <Button type="link" icon={<ArrowRightOutlined onClick={() => {
            props.onSelectCanister(record);
        }} />} />
    }];

    return <div style={{
        width: '100%', height: "100%", display: "flex",
        overflow: "auto", alignItems: 'center', justifyContent: 'center'
    }}>
        <Table columns={columns} dataSource={props.canisterList} rowKey="canister_id" />

    </div>
}

export default SelectCanister;