import React, { useContext, useState, useEffect, useRef } from 'react';
import { Principal } from "@dfinity/principal";
import { Actor } from "@dfinity/agent";
import { message, Spin, Button } from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import { useAuth } from '../auth';

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
    const [allMethods, setAllMethods] = useState([]);

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

    const renderQueryMethods = () => {
        return queryMethods.map(method => <Button className='add-method-button' key={method[0]} icon={<PlusOutlined />}>{method[0]}</Button>);
    }

    const renderUpdateMethods = () => {
        return updateMethods.map(method => <Button className='add-method-button' key={method[0]} icon={<PlusOutlined />}>{method[0]}</Button>);
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
            <div className='addmethod-tabs-container'></div>
            <div className='addmethod-footer-container'>
                <Button className='method-footer-button' type="primary">Confirm</Button>
                <Button className='method-footer-button'>Cancel</Button>
            </div>
        </>}
    </div>
}

export default AddMethod;