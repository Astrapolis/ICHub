import React, { useContext, useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { message, Spin, Button, Tabs, Typography, Form } from 'antd';
import { useCasesValue } from './params';
import GeneralTypeRender from './params/GeneralTypeRender';
import MethodSpec from './MethodSpec';

const { Text } = Typography;
const EditMethodParamForm = (props) => {
    const { method } = props;


    const renderMethodParams = (method) => {


        return method.method[1].argTypes.map((arg, index) => {
            let path = [method.uuid, index + ''];
            return <GeneralTypeRender
                argIDL={arg}
                path={path}
                key={`G/${path.join('/')}`}
            />
        })
    }

    useEffect(() => {

    }, [])


    return <div className='method-config-tab-content-container'>
        <MethodSpec method={method} />
        {method.method[1].argTypes.length > 0 &&
            <div className='method-param-config-container'>
                {renderMethodParams(method)}
            </div>
        }
        {method.method[1].argTypes.length === 0 && <Text type="success">No parameters</Text>}
    </div>
}

export default EditMethodParamForm;