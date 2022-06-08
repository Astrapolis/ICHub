import React, { useContext, useState, useEffect, useRef } from 'react';
import { Principal } from "@dfinity/principal";
import { v4 as uuidv4 } from 'uuid';
import { Actor } from "@dfinity/agent";
import { message, Spin, Button, Tabs } from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import { useAuth } from '../auth';

const { TabPane } = Tabs;

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
    const onTabEdit = (targetKey, acttion) => {
        let index = newMethods.findIndex(ele => ele.uuid === targetKey);
        let removes = newMethods.splice(index,1);
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
                {newMethods.length > 0 && <Tabs activeKey={activeMethod.uuid} onEdit={onTabEdit} onChange={onTabChange} hideAdd>
                    {
                        newMethods.map(med => <TabPane tab={med.function_name} key={med.uuid} closable={true}>
                            {med.method[1].display()}
                        </TabPane>)
                    }
                </Tabs>}
            </div>
            <div className='addmethod-footer-container'>
                <Button className='method-footer-button' type="primary">Confirm</Button>
                <Button className='method-footer-button'>Cancel</Button>
            </div>
        </>}
    </div>
}

export default AddMethod;