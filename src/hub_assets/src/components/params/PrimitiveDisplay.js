import React, { useContext, useState, useEffect, useRef } from 'react';
import { Typography } from 'antd';
import { getPrimitiveValueParser, getGeneralValueParser } from '../../utils/paramRenderUtils';
const { Text } = Typography;

const PrimitiveDisplay = (props) => {
    const { argIDL, paramValue, path, fieldName } = props;
    let displayValue = paramValue;
    if (displayValue !== undefined) {
        try {
            displayValue = argIDL.valueToString(argIDL.accept(getGeneralValueParser(), displayValue));
        } catch (err) {
            
        }
    }

    return <div>
        <Text mark >{fieldName ? fieldName : argIDL.display()}{":"}</Text><Text code>
            {displayValue}
        </Text>
    </div>
}
export default PrimitiveDisplay;