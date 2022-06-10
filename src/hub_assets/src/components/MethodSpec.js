import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
const { Text } = Typography;

const MethodSpec = (props) => {
    const {method} = props;
    return <div>
        <Text>Method spec:</Text>
        <Text type="secondary">{`${method.method[1].display()}`}</Text>
    </div>
}

export default MethodSpec;