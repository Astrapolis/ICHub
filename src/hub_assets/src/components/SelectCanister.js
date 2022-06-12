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

    return <Table columns={columns} dataSource={props.canisterList} pagination={false} rowKey="canisterId" />

}

export default SelectCanister;