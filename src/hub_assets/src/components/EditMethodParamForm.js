import React, { useContext, useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { message, Spin, Button, Tabs, Typography, Form } from 'antd';
import GeneralTypeRender from './params/GeneralTypeRender';
import MethodSpec from './MethodSpec';

const { Text } = Typography;
const EditMethodParamForm = (props) => {
    const { method, methodIndex, setValueFetchor, mode } = props;
    // const [form] = Form.useForm();
    // const [paramValues, setParamValues] = useState(method.params ? [...method.params] : []);
    const [childValueFetchors, setChildValueFetchors] = useState({})


    const setEditMethodFormValueFetchorFromChild = (key, fetchor) => {
        console.log('setter of EditMethodParamForm');

        childValueFetchors[key] = fetchor;
        console.log('fetchorMapping', childValueFetchors);
        setChildValueFetchors({ ...childValueFetchors });
        setValueFetchor(methodIndex, fetchEditValue);
    }

    const fetchEditValue = (index) => {
        // let paramValues = [];
        // method.method[1].argTypes.forEach((arg, index) => {
        //     paramValues[index] = childValueFetchors[`/${index}`]();
        // });
        console.log('fetchor of EditMethodParamForm');
        let values = childValueFetchors[JSON.stringify([index + ''])]();
        console.log('get value from edit method form', values);
        let value = {};
        value[index] = values;
        return value;
    }

    const renderMethodParams = (method) => {
        let paramValues = [];
        if (method.params) {
            paramValues = [...method.params];
        }

        return method.method[1].argTypes.map((arg, index) => {
            let paramV = undefined;
            if (paramValues[index] !== undefined) {
                paramV = {};
                paramV[index] = paramValues[index];
            }
            return <GeneralTypeRender
                mode={mode}
                argIDL={arg}
                paramValue={paramV}
                paramConfig={null}
                valueKey={index + ''}
                path={[index + '']}
                key={`/${index}`}
                vKey={`/${index}`}
                valueFetchor={setEditMethodFormValueFetchorFromChild}
            />
        })
    }

    useEffect(() => {
        setValueFetchor(methodIndex, fetchEditValue);
    }, [])


    return <div className='method-config-tab-content-container'>
        <MethodSpec method={method} />
        {method.method[1].argTypes.length > 0 &&
            // <Form form={form} initialValues={method.params}>
            <div className='method-param-config-container'>
                {/* <Form.List name={method.function_name}> */}

                {renderMethodParams(method)}

                {/* </Form.List> */}
            </div>
            // </Form>
        }
        {method.method[1].argTypes.length === 0 && <Text type="success">No parameters</Text>}
    </div>
}

export default EditMethodParamForm;