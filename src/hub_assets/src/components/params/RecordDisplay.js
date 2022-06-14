import React, { useContext, useState, useEffect, useRef } from 'react';
import { Typography, Collapse } from 'antd';
import { getPrimitiveValueParser, getGeneralValueParser } from '../../utils/paramRenderUtils';
import GeneralTypeDisplay from './GeneralTypeDisplay';
import { Field } from 'rc-field-form';
const { Text } = Typography;
const { Panel } = Collapse;

const RecordDisplay = (props) => {
    const { argIDL, paramValue, path, fieldName } = props;

    const renderRecordField = () => {
        return argIDL._fields.map(field => <GeneralTypeDisplay
            argIDL={field[1]}
            path={[...path, field[0]]}
            key={`G/${path.join('/')}/${field[0]}`}
            paramValue={paramValue[field[0]]}
            fieldName={field[0]}
        />)

    }

    return <Collapse>
        <Panel header={fieldName ? fieldName : argIDL.display()}>
            {renderRecordField()}
        </Panel>
    </Collapse>
}
export default RecordDisplay;