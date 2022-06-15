import React, { useContext, useState, useEffect, useRef } from 'react';
import {Card, Typography } from 'antd';
import GeneralTypeDisplay from './GeneralTypeDisplay';
const { Text } = Typography;

const VariantDisplay = (props) => {
    const { argIDL, paramValue, path, fieldName } = props;
    let valueKey = Object.keys(paramValue)[0];
    let keyIndex = argIDL._fields.findIndex(field => field[0] === valueKey);
    console.log('render Variant display', valueKey, keyIndex, props);
    return <Card title={fieldName ? fieldName : argIDL.display()}>
        <GeneralTypeDisplay 
        argIDL={argIDL._fields[keyIndex][1]}
        path={[...path, valueKey]}
        paramValue={paramValue[valueKey]}
        fieldName={valueKey}
        key={`G/${path.join('/')}`}
        />
    </Card>
}

export default VariantDisplay;