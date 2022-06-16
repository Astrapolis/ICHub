import React, { useContext, useState, useEffect, useRef } from 'react';
import GeneralTypeDisplay from './params/GeneralTypeDisplay';


const MethodParamsDisplay = props => {
    // const [form] = Form.useForm();
    const { method } = props;
    return <>
        {/* <Form
        form={form}
        initialValues={method.params}> */}
        {method.method && method.method[1].argTypes.map((argIDL, index) => {
            // console.log('render params with', record.params);
            // let paramV = undefined;
            // if (method.params && method.params[index] !== undefined) {
            //     paramV = {};
            //     paramV[index] = method.params[index];
            // }
            let path = [method.uuid, index+''];
            return (
                <GeneralTypeDisplay
                    argIDL={argIDL}
                    paramValue={method.params[index]}
                    path={path}
                    key={path.join('/')}
                />
            );
        })}
        {/* </Form> */}
    </>
}

export default MethodParamsDisplay;
