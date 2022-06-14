import React, { useContext, useState, useEffect, useRef } from 'react';

import { Button, Form, Input } from 'antd';
import { getPrimitiveValueParser, convertPathToJson } from '../../utils/paramRenderUtils';
import { useCasesValue } from '.';

const PrimitiveRender = (props) => {
    const [form] = Form.useForm();
    const { mode, argIDL, path, fieldName } = props;
    // const [formInitialValue, setFormInitialValue] = useState(null);
    const {
        casesValue,
        updateParamValue,
        getParamValue
    } = useCasesValue();


    const onPrimitiveValueChanged = (changedValues, allValues) => {
        updateParamValue(path.join('/'), changedValues);
    }

    useEffect(() => {
        if (form) {
            let value = getParamValue(path.join('/'));
            let formValue = convertPathToJson(path, value);
            form.setFieldsValue(formValue);
        }
    }, [form]);
    useEffect(() => {
        let value = getParamValue(path.join('/'));
        let formValue = convertPathToJson(path, value);
        form.setFieldsValue(formValue);
    }, [casesValue])

    return <Form form={form}
        onValuesChange={onPrimitiveValueChanged}
    >
        <Form.Item
            name={path}
            label={fieldName ? fieldName : argIDL.display()}
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