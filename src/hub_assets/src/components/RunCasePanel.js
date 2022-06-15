import React, { useState, useEffect, createRef } from 'react';
import { Button, Card, Typography } from 'antd';
import RunMethodTimeline from './RunMethodTimeline';

const { Text } = Typography;

const RunCasePanel = (props) => {
    const { testCase, canisterList, closeDrawer, onSaveRunResult } = props;
    const [calling, setCalling] = useState(true);
    const [runningCases, setRunningCases] = useState([]);
    const [failed, setFailed] = useState(false);
    const [results, setResults] = useState([]);
    const methods = testCase.canister_calls;

    const onResult = (index, success, result) => {
        console.log('onResult', index, result);
        setResults([...results, result]);
        if (index === (methods.length - 1)) {
            setCalling(false);
        } else {
            console.log('adding ===>', methods[index + 1]);
            setRunningCases([...runningCases, methods[index + 1]]);
        }
    }

    const renderMethods = () => {
        return runningCases.map((method, index) => {
            let canister = canisterList.find((can) => can.canisterId === method.canister_id);
            return <RunMethodTimeline onResult={onResult} method={method} index={index}
                canisterActor={canister.actor} key={method.uuid} />

        });
    }
    const startRun = () => {
        setRunningCases([methods[0]]);
    }
    
    useEffect(() => {
        console.log('render methods', methods);
        startRun();
    }, [])

    return <Card title="Run Case" style={{ width: '100%' }}
        actions={[<Button type="primary" disabled={failed} loading={calling}
            key="run-case-result-save"
            onClick={() => {
                closeDrawer();
                onSaveRunResult(results);
            }}
        >Save To History</Button>,
        <Button loading={calling} key="run-case-result-discard" onClick={() => {
            closeDrawer();
        }}>Discard</Button>]}
    >
        {failed && <Text type="danger">Case Failed: {failed}</Text>}
        {renderMethods()}
    </Card>

}

export default RunCasePanel;