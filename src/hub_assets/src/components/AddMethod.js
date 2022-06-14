import React, { useContext, useState, useEffect, useRef } from 'react';
import { Principal } from "@dfinity/principal";
import { v4 as uuidv4 } from 'uuid';
import { Actor } from "@dfinity/agent";
import { message, Spin, Button, Tabs, Typography } from 'antd';
import { PlusOutlined, ExclamationOutlined, CheckOutlined } from "@ant-design/icons";
import { useAuth } from '../auth';
import { useCasesValue } from './params';

import EditMethodParamForm from './EditMethodParamForm';

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
    const [methodsReady, setMethodsReady] = useState([]);
    const [activeMethod, setActiveMethod] = useState(null);
    const [editFormMapping, setEditFormMapping] = useState({});
    
    const {
        casesValue,
        registerCaseValue,
        clearCaseValue
    } = useCasesValue();

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
            canister_name: props.canister.name,
            function_name: method[0],
            uuid: uuidv4(),
            method
        };

        setNewMethods([...newMethods, methodCfg]);
        setMethodsReady([...methodsReady, false]);
        setActiveMethod(methodCfg);
        registerCaseValue(methodCfg.uuid, method[1]);
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


    const renderTabName = (med) => {
        let methodType = 'query';
        if (!med.method[1].annotations.some(value => value === 'query')) {
            methodType = 'update';
        }
        return <div className='method-tab-name-container'>
            <div>{med.function_name}</div>
            <div className='method-type-hint'>{methodType}</div>
            {/* {med.ready && <CheckOutlined />}
            {!med.ready && <ExclamationOutlined />} */}
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
        editFormMapping[index] = undefined;
        delete editFormMapping[index];
        setEditFormMapping({ ...editFormMapping });
    }
    const onTabChange = (activeKey) => {
        setActiveMethod(newMethods.find(ele => ele.uuid === activeKey));
    }


    const onConfirm = () => {
        // console.log('confirm mapping', editFormMapping);

        newMethods.forEach(m => {
            
            m.params = JSON.parse(JSON.stringify(casesValue[m.uuid]), (key, value) => {
                if (typeof value === "bigint") {
                    return value.toString();
                } else {
                    return value;
                }
            });
            console.log('method params', m, m.params);

        });
        console.log('confirm add ====>', newMethods);
        props.onMethodsAdded(props.canister, newMethods);
        props.closeDrawer();
        setNewMethods([]);
    }
    useEffect(() => {
        initMethods();
        return () => {
            // console.log('add method destroy ======>', newMethods);
            clearCaseValue();
        }
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

                {newMethods.length > 0 && 
                    <Tabs type="editable-card" activeKey={activeMethod.uuid} onEdit={onTabEdit} onChange={onTabChange} hideAdd>
                        {
                            newMethods.map((med, index) => <TabPane tab={renderTabName(med)} key={med.uuid} closable={true}>
                                <EditMethodParamForm method={med} />
                            </TabPane>)
                        }
                    </Tabs>
                }

            </div>
            <div className='addmethod-footer-container'>
                <Button className='method-footer-button' type="primary" onClick={onConfirm}>Confirm</Button>
                <Button className='method-footer-button' onClick={() => {
                    props.closeDrawer();
                }}>Cancel</Button>
            </div>
        </>}
    </div>
}

export default AddMethod;