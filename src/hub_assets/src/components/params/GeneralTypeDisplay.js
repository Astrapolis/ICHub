import React, { useContext, useState, useEffect, useRef } from 'react';
import { IDL } from "@dfinity/candid";
import { Typography, Card } from 'antd';
import PrimitiveDisplay from './PrimitiveDisplay';
import RecordDisplay from './RecordDisplay';
import VecDisplay from './VecDisplay';
import OptDisplay from './OptDisplay';
import VariantDisplay from './VariantDisplay';
import "./styles/GeneralTypeRender.less";

const { Text } = Typography;

const GeneralTypeDisplay = (props) => {
    const { argIDL, paramValue, path, fieldName } = props;
    console.log('render general type display', props);
    const renderParameters = () => {
        if (argIDL instanceof IDL.PrimitiveType) {
            return <PrimitiveDisplay
                argIDL={argIDL}
                paramValue={paramValue}
                path={path}
                fieldName={fieldName}
            />
        }
        if (argIDL instanceof IDL.RecordClass) {
            return <RecordDisplay
                argIDL={argIDL}
                paramValue={paramValue}
                path={path}
                fieldName={fieldName}
            />
        }
        if (argIDL instanceof IDL.VecClass) {
            return <VecDisplay
                argIDL={argIDL}
                paramValue={paramValue}
                path={path}
                fieldName={fieldName}
            />
        }
        if (argIDL instanceof IDL.OptClass) {
            return <OptDisplay
                argIDL={argIDL}
                paramValue={paramValue}
                path={path}
                fieldName={fieldName}
            />
        }
        if (argIDL instanceof IDL.VariantClass) {
            return <VariantDisplay
                argIDL={argIDL}
                paramValue={paramValue}
                path={path}
                fieldName={fieldName}
            />
        }
        return <Text type="warning">Not Implemented</Text>
    }

    return <Card>
        {renderParameters()}
    </Card>
    // <div className='general-type-param-container'>

    // </div>
}

export default GeneralTypeDisplay;