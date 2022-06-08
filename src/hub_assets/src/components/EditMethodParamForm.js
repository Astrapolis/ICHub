import React, { useContext, useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { message, Spin, Button, Tabs, Typography, Form } from 'antd';
import GeneralTypeRender from './params/GeneralTypeRender';

const { Text } = Typography;
const EditMethodParamForm = (props) => {
    const { method, paramIndex, onNewForm } = props;
    const [form] = Form.useForm();
    const renderMethodParams = (method) => {
        return method[1].argTypes.map((arg, index) => <GeneralTypeRender
            mode="new"
            argIDL={arg}
            paramValue={null}
            paramConfig={null}
            path={[index + '']}
            key={`/${index}`}
        />)
    }

    useEffect(() => {
        onNewForm(paramIndex, form);
    }, [form])


    return <div className='method-config-tab-content-container'>
        <div className='method-spec-container'>
            <Text>Call spec:</Text>
            <Text type="secondary">{`${method.method[1].display()}`}</Text>
        </div>
        {method.method[1].argTypes.length > 0 && <Form form={form}>
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