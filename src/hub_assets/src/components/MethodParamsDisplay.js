import React, { useContext, useState, useEffect, useRef } from 'react';
import GeneralTypeRender from './params/GeneralTypeRender';
import { Form } from 'antd';

const MethodParamsDisplay = props => {
    const [form] = Form.useForm();
    const { method } = props;
    console.log('render MethodParamsDisplay with ===>', method);
    return <Form
        form={form}
        initialValues={method.params}>
        {method.method && method.method[1].argTypes.map((argIDL, index) => {
            // console.log('render params with', record.params);
            return (
                <GeneralTypeRender
                    mode={"read"}
                    argIDL={argIDL}
                    paramConfig={null}
                    path={[index + '']}
                    key={`/${index}`}
                />
            );
        })}
    </Form>
}

export default MethodParamsDisplay;