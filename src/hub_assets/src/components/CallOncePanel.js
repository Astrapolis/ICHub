import React, { useState, useEffect } from 'react';
import { Button, Card } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import RunMethodTimeline from './RunMethodTimeline';

const CallOncePanel = (props) => {
    const { method, index, canisterActor, closeDrawer } = props;
    const [calling, setCalling] = useState(true);

    const onResult = (index, success, result) => {
        setCalling(false);
    }

    return <Card title="Call Method Once" style={{ width: '100%' }}
        extra={<Button type="primary" loading={calling}
            onClick={() => {
                closeDrawer();
            }}
            icon={<CloseOutlined
            />} />}
    >
        <RunMethodTimeline onResult={onResult} method={method}
            index={index} canisterActor={canisterActor}
        />
    </Card>
}

export default CallOncePanel;