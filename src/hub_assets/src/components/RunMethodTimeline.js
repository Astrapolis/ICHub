import React, { useState, useEffect } from 'react';
import { Timeline, Typography, Divider, Card } from 'antd';
import { getFieldNormalizedResult } from '../utils/actorUtils';

import MethodSpec from './MethodSpec';
import CallSpec from './CallSpec';
import './styles/RunMethodTimeline.less';

const { Text } = Typography;

const RunMethodTimeline = (props) => {

    const { method, index, onResult, canisterActor } = props;
    const [runDone, setRunDone] = useState(false);

    const [requestDate, setRequestDate] = useState(0);
    const [responseDate, setResponseDate] = useState(0);
    const [callStatus, setCallStatus] = useState(null);
    const [result, setResult] = useState(null);

    const runRequest = async () => {
        setRequestDate(new Date().getTime());
        try {
            console.log('canister actor', canisterActor, method);
            let callResult = await canisterActor[method.function_name](...method.params);
            setCallStatus("success");
            let stringifyResult = getFieldNormalizedResult(method.method[1], callResult);
            setResult(stringifyResult);
            onResult(index, true, stringifyResult);
            setResponseDate(new Date().getTime());
        } catch (err) {
            console.log('run error', err);
            setCallStatus("danger");
            let stringifyResult = "Error:" + err.message;
            setResult(stringifyResult);
            onResult(index, false, stringifyResult);
            setResponseDate(new Date().getTime());
        }
        setRunDone(true);
    }

    useEffect(() => {
        runRequest();
    }, []);

    return <Card type="inner" title={method.function_name}>
        <div className='runinfo-section-container'>
            <MethodSpec method={method} />
        </div>
        <div className='runinfo-section-container'>
            <CallSpec method={method} />
        </div>
        <div className='runinfo-section-container'>
            <Timeline pending={!runDone}>
                {requestDate > 0 && <Timeline.Item>
                    <Text type="success">Request has been sent at {new Date(requestDate).toLocaleTimeString()}</Text>
                </Timeline.Item>}
                {responseDate > 0 && <Timeline.Item>
                    <Text type="success">Call Result at {new Date(responseDate).toLocaleTimeString()}</Text>
                </Timeline.Item>}
                {result && <Timeline.Item>
                    <Text type={callStatus}>{`result: ${result}`}</Text>
                </Timeline.Item>}
            </Timeline>
        </div>
    </Card>
}

export default RunMethodTimeline;