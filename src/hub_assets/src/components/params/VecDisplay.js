import React, { useContext, useState, useEffect, useRef } from 'react';
import { Typography, Collapse } from 'antd';
import { getPrimitiveValueParser, getGeneralValueParser } from '../../utils/paramRenderUtils';
import GeneralTypeDisplay from './GeneralTypeDisplay';
import { Field } from 'rc-field-form';
const { Text } = Typography;
const { Panel } = Collapse;

const VecDisplay = (props) => {
    const { argIDL, paramValue, path, fieldName } = props;

    const renderVecField = () => {
        return paramValue.map((value, index) => <GeneralTypeDisplay
            argIDL={argIDL._type}
            path={[...path, index]}
            key={`G/${path.join('/')}/${index}`}
            paramValue={paramValue[index]}
            // fieldName={field[0]}
        />)

    }

    return <Collapse>
        <Panel header={fieldName ? fieldName : argIDL.display()}>
            {renderVecField()}
        </Panel>
    </Collapse>
}
export default VecDisplay;