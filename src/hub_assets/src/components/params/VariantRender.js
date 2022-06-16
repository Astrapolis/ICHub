import React, { useState, useEffect } from 'react';
import { Select, Card, Typography, Form } from 'antd';
import { useCasesValue } from '.';
import GeneralTypeRender from './GeneralTypeRender';
import { convertPathToJson, gothroughArgType } from '../../utils/paramRenderUtils';
const { option } = Select;
const { Text } = Typography;

const VariantRender = (props) => {
    const { argIDL, path, fieldName } = props;
    const [form] = Form.useForm();
    const [activeField, setActiveField] = useState(0)
    const {
        casesValue,
        getParamValue,
        updateParamValue,
        existsParamValueAtPath
    } = useCasesValue();
    

    const onFieldSelectChange = (fieldIndex) => {
        let newPath = [...path, argIDL._fields[fieldIndex][0]];
        let objectValue = convertPathToJson(newPath,
            gothroughArgType(argIDL._fields[fieldIndex][1]));
        updateParamValue(path.join('/'), objectValue);
        setActiveField(fieldIndex);
        let formValue = {optkey: fieldIndex};
        form.setFieldsValue(formValue);

    }
    const onVariantValueChanged = (changedValues, allValues) => {
        onFieldSelectChange(changedValues.optkey);
    }

    const updateFormValue = () => {
        let value = getParamValue(path.join('/'));
        console.log('varaint value', value);
        let fieldName = Object.keys(value)[0];
        console.log('variant field name', fieldName);
        let fieldIndex = argIDL._fields.findIndex(f => f[0] === fieldName);
        let formValue = {optkey: fieldIndex};
        form.setFieldsValue(formValue);
        setActiveField(fieldIndex);
    
    }
    useEffect(() => {
        console.log('variant opt change by form')
        if (form) {
            updateFormValue()
        }
    }, [form])

    useEffect(() => {
        console.log('in variant value hook', JSON.stringify(casesValue));
        updateFormValue();
        // setActiveField(fieldIndex);
    }, [casesValue])

    console.log('render with activeField', activeField, argIDL._fields[activeField][0]);
    return <Card title={<Text>{fieldName ? fieldName : argIDL.display()}</Text>}>
        <Form form={form} onValuesChange={onVariantValueChanged}>
            <Form.Item name={"optkey"}>
                <Select 
                // onChange={onFieldSelectChange} 
                style={{ width: 300 }}
                    options={argIDL._fields.map((field, index) => {
                        return {
                            label: field[0],
                            value: index
                        }
                    })}

                >
                    {/* {argIDL._fields.map((field, index) => <Option value={index} key={index}>
                {field[0]}
            </Option>)} */}
                </Select>
            </Form.Item>

        </Form>
        {existsParamValueAtPath([...path, argIDL._fields[activeField][0]].join('/')) &&
            <Card type="inner">
                <GeneralTypeRender
                    argIDL={argIDL._fields[activeField][1]}
                    path={[...path, argIDL._fields[activeField][0]]}
                    key={`G/${path.join('/')}/${argIDL._fields[activeField][0]}`}
                />
            </Card>}
    </Card>
}

export default VariantRender;

