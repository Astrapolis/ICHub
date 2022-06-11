import React, { useState, useEffect } from 'react';
import { Timeline, Typography, Divider, Card, Table, Spin } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { utf8Bytes2Str } from '../utils/stringUtils';
import './styles/RunMethodTimeline.less';
const { Text } = Typography;

const RunMethodHistoryEntry = (props) => {
    const { testCase } = props;
    const [historyData, setHistoryData] = useState([]);

    const makeHistoryData = () => {
        testCase.config = JSON.parse(testCase.config);
        let canisterMapping = testCase.config.canisterMapping;
        let datas = [];
        testCase.canister_calls.forEach((method, index) => {
            method.event.result = JSON.parse(utf8Bytes2Str(method.event.result));
            datas.push({
                uuid: uuidv4(),
                canister_id: method.canister_id,
                canister_name: canisterMapping[method.canister_id],
                function_name: method.function_name,
                ...method.event.result
            });
        })
        setHistoryData([...datas]);
    }

    const columns = [{
        title: 'index',
        width: 30,
        render: (_, record, index) => <span>{index + 1}</span>
    }, {
        title: 'canister',
        dataIndex: 'canister_name',
        ellipsis: true,
        width: 120,
        render: (_, record) => {
            return <Tooltip placement='top' title={record.canister_id}>
                <span>{record.canister_name === undefined ? "<unnamed>" : record.canister_name}</span>
            </Tooltip>
        }
    }, {
        title: 'Method',
        dataIndex: 'function_name',
        width: 150,
        ellipsis: true,
        render: (_, record) => {
            return <Tooltip placement='top' title={record.function_name}>
                <span>{record.function_name}</span>
            </Tooltip>
        }
    }, {
        title: 'Call Time/Response Time(UTC)',
        render: (_, record) => {
            return <span>{`${record.startTime}~${record.endTime}`}</span>
        }
    }];

    useEffect(() => {
        makeHistoryData();
    }, [])


    return <Table columns={columns} rowKey="uuid" dataSource={historyData}
        expandable={{
            expandedRowRender: (record) => <Card>
                <div className='runinfo-section-container'>
                    <Text>Method Spec:</Text><Text type="secondary">{record.methodSpec}</Text>
                </div>
                <div className='runinfo-section-container'>
                    <Text>Call Spec:</Text><Text type="secondary">{record.callSpec}</Text>
                </div>
                <div className='runinfo-section-container'>
                    <Text>Result:</Text><Text>{resultObject.stringifyResult}</Text>
                </div>
            </Card>,
            rowExpandable: record => true,
        }}
    />
    // <Card type="inner" title={history.function_name}>
    //     <div className='runinfo-section-container'>
    //         <Text>Method Spec:</Text><Text type="secondary">{resultObject.methodSpec}</Text>
    //     </div>
    //     <div className='runinfo-section-container'>
    //         <Text>Call Spec:</Text><Text type="secondary">{resultObject.callSpec}</Text>
    //     </div>
    //     <div className='runinfo-section-container'>
    //         <Text>Time:</Text><Text>{resultObject.startTime} - {resultObject.endTime}</Text>
    //     </div>
    //     <div className='runinfo-section-container'>
    //         <Text>Result:</Text><Text>{resultObject.stringifyResult}</Text>
    //     </div>
    // </Card>
}

export default RunMethodHistoryEntry;