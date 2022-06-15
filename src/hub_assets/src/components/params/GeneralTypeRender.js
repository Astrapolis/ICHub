import React, { useContext, useState, useEffect, useRef } from 'react';
import { IDL } from "@dfinity/candid";
import { Spin, Form, Typography } from 'antd';
import { getGeneralTypeRender } from "../../utils/paramRenderUtils";
import PrimitiveRender from './PrimitiveRender';
import VecRender from './VecRender';
import RecordRender from './RecordRender';
import OptRender from './OptRender';


import "./styles/GeneralTypeRender.less";

const { Text } = Typography;

const GeneralTypeRender = (props) => {

    const { argIDL, path, fieldName } = props;


    const renderParameters = () => {
        if (argIDL instanceof IDL.PrimitiveType) {
            return <PrimitiveRender
                argIDL={argIDL}
                path={path}
                fieldName={fieldName}
                key={path.join('/')}
            />
        }
        if (argIDL instanceof IDL.RecordClass) {
            return <RecordRender
                argIDL={argIDL}
                path={path}
                fieldName={fieldName}
                key={path.join('/')}
            />
        }
        if (argIDL instanceof IDL.VecClass) {
            return <VecRender
                argIDL={argIDL}
                path={path}
                fieldName={fieldName}
                key={path.join('/')}
            />
        }
        if (argIDL instanceof IDL.OptClass) {
            return <OptRender
                argIDL={argIDL}
                path={path}
                fieldName={fieldName}
                key={path.join('/')}
            />
        }


        return <Text type="warning">{`Support of ${argIDL.display()} is comming soon!`}</Text>

    }

    useEffect(() => {

    }, []);

    return <div className='general-type-param-container'>

        {renderParameters()}

    </div>
}

export default GeneralTypeRender;