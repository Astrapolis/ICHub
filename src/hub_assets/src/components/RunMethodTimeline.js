import React, { useState, useEffect } from 'react';
import { Timeline, Typography, Divider, Card } from 'antd';
import { getFieldNormalizedResult } from '../utils/actorUtils';
import { getCallSpec,GeneralValueParser } from '../utils/paramRenderUtils';
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
        let startTime = new Date().getTime();
        setRequestDate(startTime);
        try {
            console.log('ready to run', method.function_name, method.params);
            let paramValues = [];
            method.params.forEach((param, idx) => {
                paramValues[idx] = method.method[1].argTypes[idx].accept(new GeneralValueParser(), param);
            });
            let callResult = await canisterActor[method.function_name](...paramValues);
            setCallStatus("success");
            let stringifyResult = getFieldNormalizedResult(method.method[1], callResult);
            let endTime = new Date().getTime();
            setResult(stringifyResult);

            setResponseDate(endTime);
            onResult(index, true, {
                methodSpec: method.method[1].display(),
                callSpec: getCallSpec(method),
                stringifyResult,
                startTime,
                endTime,
                success: true
            });
        } catch (err) {
            console.log('run error', err);
            setCallStatus("danger");
            let stringifyResult = "Error:" + err.message;
            let endTime = new Date().getTime();
            setResult(stringifyResult);
            setResponseDate(endTime);
            onResult(index, false, {
                methodSpec: method.method[1].display(),
                callSpec: getCallSpec(method),
                stringifyResult,
                startTime,
                endTime,
                success: false
            });
            
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
                    <Text type="success">Request has been sent at {new Date(requestDate).toUTCString()}</Text>
                </Timeline.Item>}
                {responseDate > 0 && <Timeline.Item>
                    <Text type="success">Call Result at {new Date(responseDate).toUTCString()}</Text>
                </Timeline.Item>}
                {result && <Timeline.Item>
                    <Text type={callStatus}>{`result: ${result}`}</Text>
                </Timeline.Item>}
            </Timeline>
        </div>
    </Card>
}

export default RunMethodTimeline;