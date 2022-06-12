import React, { useContext, useState, useEffect, useRef } from 'react';

import { Button, Form, Input } from 'antd';
import { getPrimitiveValueParser } from '../../utils/paramRenderUtils';

const PrimitiveRender = (props) => {

    const { mode, argIDL, paramValue, paramConfig, path } = props;
    console.log('render primitive value with path ===>', path);
    return <Form.Item
        name={path}
        label={paramConfig && paramConfig.name ? paramConfig.name : argIDL.display()}
        validateFirst
        rules={[{
            required: true,
            message: 'Please input value'
        }, {
            message: 'value is not of ' + argIDL.display(),
            validator: (_, value) => {
                try {
                    let valueProbe = argIDL.accept(
                        getPrimitiveValueParser(),
                        value
                    );
                    if (!argIDL.covariant(valueProbe)) {
                        return Promise.reject('invalid value');
                    }
                    return Promise.resolve();
                } catch (e) {
                    return Promise.reject('invalid value');
                }
            }
        }]}
    >
        <Input className='primitive-input' readOnly={mode === 'read'} />
    </Form.Item>


}

export default PrimitiveRender;