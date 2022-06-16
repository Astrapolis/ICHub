import React, { useContext, useState, useEffect, useRef } from 'react';
import { message, Spin, Button, Tabs, Typography, Card } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../auth';
import { useCasesValue } from './params';
import EditMethodParamForm from './EditMethodParamForm';
const { TabPane } = Tabs;
const { Text } = Typography;

import './styles/AddMethod.less';
import './styles/EditMethod.less';

const EditMethod = (props) => {
    const { method, onMethodUpdated } = props;

    const {
        casesValue,
        registerCaseValue,
        clearCaseValue
    } = useCasesValue();

    const renderTabName = (med) => {
        let methodType = 'query';
        if (!method.method[1].annotations.some(value => value === 'query')) {
            methodType = 'update';
        }
        return <div className='method-tab-name-container'>
            <div>{med.function_name}</div>
            <div className='method-type-hint'>{methodType}</div>
            {/* {med.ready && <CheckOutlined />}
            {!med.ready && <ExclamationOutlined />} */}
        </div>
    }

    const onConfirm = () => {

        method.params = casesValue[method.uuid];
        // method.uuid = uuidv4();
        onMethodUpdated(method);

        props.closeDrawer();
    }

    useEffect(() => {
        registerCaseValue(method.uuid, method.method[1], JSON.parse(JSON.stringify(method.params, (key, value) => {
            if (typeof value === "bigint") {
                return value.toString();
            } else {
                return value;
            }
        })));
        return () => {
            clearCaseValue();
        }
    }, [])

    return <div className='addmethod-container'>

        <div className='addmethod-tabs-container'>
            <Card title={<Text>{`${method.canister_name}(${method.canister_id})`}</Text>}>
                {casesValue[method.uuid] &&
                    <Tabs activeKey={method.uuid} >
                        <TabPane tab={renderTabName(method)} key={method.uuid} >
                            <EditMethodParamForm method={method} />
                        </TabPane>
                    </Tabs>
                }
            </Card>
        </div>

        <div className='addmethod-footer-container'>
            <Button className='method-footer-button' type="primary" onClick={onConfirm}>Confirm</Button>
            <Button className='method-footer-button' onClick={() => {
                props.closeDrawer();
            }}>Cancel</Button>
        </div>
    </div>
}

export default EditMethod;