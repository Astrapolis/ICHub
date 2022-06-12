import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
const { Text } = Typography;

const MethodSpec = (props) => {
    const {method} = props;
    return <div>
        <Text mark>Method spec:</Text>
        <Text code>{`${method.method[1].display()}`}</Text>
    </div>
}

export default MethodSpec;