import React, { useContext, useState, useEffect, useRef } from 'react';
import {Card, Typography } from 'antd';
import GeneralTypeDisplay from './GeneralTypeDisplay';
const { Text } = Typography;

const OptDisplay = (props) => {
    const { argIDL, paramValue, path, fieldName } = props;

    return <Card title={fieldName ? fieldName : argIDL.display()}>
        {paramValue === null && <Text code>null</Text>}
        {paramValue !== null && <GeneralTypeDisplay 
            argIDL={argIDL._type}
            path={path}
            paramValue={paramValue}
            fieldName={fieldName}
            key={`G/${path.join('/')}`}
        />}
    </Card>
}

export default OptDisplay;