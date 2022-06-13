import React, { useContext, useState, useEffect, useRef } from 'react';

import { Button, Form, Input } from 'antd';
import { getPrimitiveValueParser } from '../../utils/paramRenderUtils';

const PrimitiveRender = (props) => {
    const [form] = Form.useForm();
    const { mode, argIDL, paramValue, paramConfig, path, vKey, valueFetchor } = props;
    console.log('render primitive value with path ===>', path, paramValue);

    const fetchPrimitiveValue = () => {
        console.log('fetchor of PrimitiveRender');
        let values = form.getFieldsValue(true);
        console.log('get value from primitive form', values);
        return values[path];
    }

    useEffect(() => {
        if (valueFetchor) {
            valueFetchor(JSON.stringify(path), fetchPrimitiveValue);
        }
    }, []);

    return <Form form={form} initialValues={paramValue}>
        <Form.Item
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
    </Form>

}

export default PrimitiveRender;