import React, { useContext, useState, useEffect, useRef } from 'react';
import { message, Spin, Button, Tabs, Typography } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../auth';
import EditMethodParamForm from './EditMethodParamForm';
const { TabPane } = Tabs;
const { Text } = Typography;

import './styles/AddMethod.less';
import './styles/EditMethod.less';

const EditMethod = (props) => {
    const { method, onMethodUpdated } = props;
    const [editForm, setEditForm] = useState(null);

    const onNewForm = (index, form) => {
        setEditForm(form);
    }
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
        method.params = editForm.getFieldsValue(true);
        method.uuid = uuidv4();
        onMethodUpdated(method);

        props.closeDrawer();
    }

    return <div className='addmethod-container'>
        <div className='content-header-container'>
            {`${method.canister_name}(${method.canister_id})`}
        </div>
        <div className='addmethod-tabs-container'>
            <Tabs activeKey={method.uuid} >
                <TabPane tab={renderTabName(method)} key={method.uuid} >
                    <EditMethodParamForm method={method} paramIndex={0} onNewForm={onNewForm} mode={"new"} />
                </TabPane>
            </Tabs>
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