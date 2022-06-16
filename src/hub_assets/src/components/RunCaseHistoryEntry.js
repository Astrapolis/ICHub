import React, { useState, useEffect } from 'react';
import { Timeline, Typography, Divider, Card, Table, Spin, Tooltip, List } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { utf8Bytes2Str } from '../utils/stringUtils';
import './styles/RunMethodTimeline.less';
const { Text } = Typography;

const RunMethodHistoryEntry = (props) => {
    const { testCase } = props;
    const [historyData, setHistoryData] = useState([]);

    const makeHistoryData = () => {
        console.log('ready to make history data ====>', testCase);
        testCase.config = JSON.parse(testCase.config);
        let canisterMapping = testCase.config.canisterMapping;
        let datas = [];
        testCase.canister_calls.forEach((method, index) => {

            if (method.event && method.event.length > 0) {
                let converted = utf8Bytes2Str(method.event[0].result);

                method.event[0].result = JSON.parse(converted);
                // console.log("convert ===========>", method.event[0].result);
                if (method.event[0].result.callSpec && method.event[0].result.callSpec.length > 0) {
                    method.event[0].result.callSpec.forEach(spec => {
                        spec.spec = JSON.parse(spec.spec);
                    });
                }
                datas.push({
                    uuid: uuidv4(),
                    canister_id: method.canister_id,
                    canister_name: canisterMapping[method.canister_id],
                    function_name: method.function_name,
                    ...method.event[0].result
                });
            }
        })
        setHistoryData([...datas]);
    }

    const columns = [{
        title: '',
        width: 30,
        render: (_, record, index) => <span>{index + 1}</span>
    }, {
        title: 'canister',
        dataIndex: 'canister_name',
        ellipsis: true,
        width: 150,
        render: (_, record) => {
            return <Tooltip placement='top' title={record.canister_id.toText()}>
                <span>{record.canister_name === undefined ? "<unnamed>" : record.canister_name}</span>
            </Tooltip>
        }
    }, {
        title: 'Method',
        dataIndex: 'function_name',
        width: 200,
        ellipsis: true,
        render: (_, record) => {
            return <Tooltip placement='top' title={record.function_name}>
                <span>{record.function_name}</span>
            </Tooltip>
        }
    }, {
        title: 'Call Time/Response Time(TimeStamp)',
        render: (_, record) => {
            return <span>{`${record.startTime}~${record.endTime}`}</span>
        }
    }];

    useEffect(() => {
        makeHistoryData();
    }, [])


    return <Table columns={columns} rowKey="uuid" dataSource={historyData} pagination={false}
        expandable={{
            expandedRowRender: (record) => {
                console.log('expand record', record);

                return <Card>
                    <div className='runinfo-section-container'>
                        <Text mark>Method Spec:</Text><Text code>{record.methodSpec}</Text>
                    </div>
                    {record.callSpec && record.callSpec.length > 0 &&
                        <div className='runinfo-section-container'>
                            <List header={<Text strong>Call Spec:</Text>}
                                itemLayout="horizontal"
                                dataSource={record.callSpec}
                                renderItem={item => (<List.Item>
                                    <List.Item.Meta
                                        title={<Text mark>{item.spec.type}</Text>}
                                        description={<Text code>{item.spec.value}</Text>}
                                    />
                                </List.Item>)}
                            />
                        </div>
                    }
                    <div className='runinfo-section-container'>
                        <Text mark>Result:</Text><Text code>{record.stringifyResult}</Text>
                    </div>
                </Card>
            },
            rowExpandable: record => true,
        }}
    />

}

export default RunMethodHistoryEntry;