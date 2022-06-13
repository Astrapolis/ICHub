import React, { useContext, useState, useEffect, useRef } from 'react';
import GeneralTypeRender from './params/GeneralTypeRender';
import { Form } from 'antd';

const MethodParamsDisplay = props => {
    // const [form] = Form.useForm();
    const { method } = props;
    return <>
        {/* <Form
        form={form}
        initialValues={method.params}> */}
        {method.method && method.method[1].argTypes.map((argIDL, index) => {
            // console.log('render params with', record.params);
            let paramV = undefined;
            if (method.params && method.params[index] !== undefined) {
                paramV = {};
                paramV[index] = method.params[index];
            }
            return (
                <GeneralTypeRender
                    mode={"read"}
                    argIDL={argIDL}
                    paramConfig={null}
                    paramValue={paramV}
                    valueKey={index + ''}
                    path={[index + '']}
                    key={`/${index}`}
                    vKey={`/${index}`}
                />
            );
        })}
        {/* </Form> */}
    </>
}

export default MethodParamsDisplay;
