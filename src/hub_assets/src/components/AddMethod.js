import React, { useContext, useState, useEffect, useRef } from 'react';
import { Principal } from "@dfinity/principal";
import { v4 as uuidv4 } from 'uuid';
import { Actor } from "@dfinity/agent";
import { message, Spin, Button, Tabs, Typography, Form } from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import { useAuth } from '../auth';
import GeneralTypeRender from './params/GeneralTypeRender';

const { TabPane } = Tabs;
const { Text } = Typography;

import {
    getActorFromCanisterId,
    getFieldFromActor,
    getFieldNormalizedResult,
    getFuncArgsNormalizedForm,
} from "../utils/actorUtils";

import './styles/AddMethod.less';

const AddMethod = (props) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [queryMethods, setQueryMethods] = useState([]);
    const [updateMethods, setUpdateMethods] = useState([]);
    const [canisterActor, setCanisterActor] = useState(null);
    const [newMethods, setNewMethods] = useState([]);
    const [activeMethod, setActiveMethod] = useState(null);

    const initMethods = async () => {
        setLoading(true);
        try {
            let actor = await getActorFromCanisterId(props.canister.canisterId, user.agent);
            let methods = Actor.interfaceOf(actor)._fields;
            console.log('methods ==>', methods);
            let qMethods = [];
            let uMethods = [];
            methods.forEach(method => {
                if (method[1].annotations.some(value => value === 'query')) {
                    qMethods.push(method);
                } else {
                    uMethods.push(method);
                }
            });
            setQueryMethods([...qMethods]);
            setUpdateMethods([...uMethods]);
            setCanisterActor(actor);
            // setAllMethods(methods);
        } catch (err) {
            console.log('init add method failed', err);
            message.error('failed to init:' + err);
        }
        setLoading(false);
    }

    const onAddMethod = (method) => {
        let methodCfg = {
            canister_id: props.canister.canisterId,
            function_name: method[0],
            uuid: uuidv4(),
            method
        };

        setNewMethods([...newMethods, methodCfg]);
        setActiveMethod(methodCfg);
    }

    const renderQueryMethods = () => {
        return queryMethods.map(method => <Button className='add-method-button' key={method[0]} icon={<PlusOutlined />} onClick={() => {
            onAddMethod(method);
        }}>{method[0]}</Button>);
    }

    const renderUpdateMethods = () => {
        return updateMethods.map(method => <Button className='add-method-button' key={method[0]} icon={<PlusOutlined />} onClick={() => {
            onAddMethod(method);
        }}>{method[0]}</Button>);
    }

    const renderMethodParams = (method) => {
        return method[1].argTypes.map((arg, index) => <GeneralTypeRender
            mode="new"
            argIDL={arg}
            paramValue={null}
            paramConfig={null}
            path={`/${index}`}
        />)
    }
    const renderTabName = (med) => {
        let methodType = 'query';
        if (!med.method[1].annotations.some(value => value === 'query')) {
            methodType = 'update';
        }
        return <div className='method-tab-name-container'>
            <div>{med.function_name}</div>
            <div className='method-type-hint'>{methodType}</div>
        </div>
    }
    const onTabEdit = (targetKey, acttion) => {
        let index = newMethods.findIndex(ele => ele.uuid === targetKey);
        let removes = newMethods.splice(index, 1);
        if (removes[0].uuid === activeMethod.uuid) {
            if (newMethods.length > 0) {
                setActiveMethod(newMethods[0]);
            }
        }
        setNewMethods([...newMethods]);
    }
    const onTabChange = (activeKey) => {
        setActiveMethod(newMethods.find(ele => ele.uuid === activeKey));
    }
    const onValueConfigured = (values) => {
        console.log('commit values', values);
    }
    useEffect(() => {
        initMethods();
    }, []);

    return <div className='addmethod-container'>
        {loading && <Spin />}
        {!loading && <>

            <div className='addmethod-topbar-container'>
                <div className='method-zone-container'>
                    <div className='method-type-container'>update</div>
                    <div className='method-list-container'>
                        {renderUpdateMethods()}
                    </div>
                </div>
                <div className='method-zone-container'>
                    <div className='method-type-container'>query</div>
                    <div className='method-list-container'>
                        {renderQueryMethods()}
                    </div>
                </div>
            </div>

            <div className='addmethod-tabs-container'>

                {newMethods.length > 0 && <Tabs type="editable-card" activeKey={activeMethod.uuid} onEdit={onTabEdit} onChange={onTabChange} hideAdd>
                    {
                        newMethods.map(med => <TabPane tab={renderTabName(med)} key={med.uuid} closable={true}>
                            <div className='method-config-tab-content-container'>
                                <div className='method-spec-container'>
                                    <Text>Call spec:</Text>
                                    <Text type="secondary">{`${med.method[1].display()}`}</Text>
                                </div>
                                {med.method[1].argTypes.length > 0 &&
                                <Form onFinish={onValueConfigured}>
                                    <div className='method-param-config-container'>
                                        {renderMethodParams(med.method)}
                                    </div>
                                    <Form.Item>
                                        <Button className='method-footer-button' type="primary" htmlType="submit">Confirm</Button>
                                        <Button className='method-footer-button'>Cancel</Button>
                                    </Form.Item>
                                </Form>}
                                {med.method[1].argTypes.length === 0 && <Text type="success">No parameters</Text>}
                            </div>
                        </TabPane>)
                    }
                </Tabs>}
                {/* <div className='addmethod-footer-container'> */}


                {/* </div> */}

            </div>

        </>}
    </div>
}

export default AddMethod;