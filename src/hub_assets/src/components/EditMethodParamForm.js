import React, { useContext, useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { message, Spin, Button, Tabs, Typography, Form } from 'antd';
import GeneralTypeRender from './params/GeneralTypeRender';
import MethodSpec from './MethodSpec';

const { Text } = Typography;
const EditMethodParamForm = (props) => {
    const { method, methodIndex, onNewForm, mode } = props;
    const [form] = Form.useForm();
    const renderMethodParams = (method) => {
        
        return method[1].argTypes.map((arg, index) => <GeneralTypeRender
            mode={mode}
            argIDL={arg}
            paramValue={method.params}
            paramConfig={null}
            path={[index + '']}
            key={`/${index}`}
        />)
    }

    useEffect(() => {
        if (onNewForm) {
            onNewForm(methodIndex, form);
        }
    }, [form])


    return <div className='method-config-tab-content-container'>
        <MethodSpec method={method} />
        {method.method[1].argTypes.length > 0 && <Form form={form} initialValues={method.params}>
            <div className='method-param-config-container'>
                {/* <Form.List name={method.function_name}> */}

                {renderMethodParams(method.method)}

                {/* </Form.List> */}
            </div>
        </Form>
        }
        {method.method[1].argTypes.length === 0 && <Text type="success">No parameters</Text>}
    </div>
}

export default EditMethodParamForm;