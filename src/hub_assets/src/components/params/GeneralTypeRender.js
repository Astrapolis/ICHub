import React, { useContext, useState, useEffect, useRef } from 'react';
import { IDL } from "@dfinity/candid";
import { Spin, Form, Typography } from 'antd';
import { getGeneralTypeRender } from "../../utils/paramRenderUtils";
import PrimitiveRender from './PrimitiveRender';
import VecRender from './VecRender';
import RecordRender from './RecordRender';
import * as CONSTANT from "../../constant";

import "./styles/GeneralTypeRender.less";

const { Text } = Typography;

const GeneralTypeRender = (props) => {
    const [renderType, setRenderType] = useState(null);
    const { mode, argIDL, paramValue, paramConfig, path, valueKey, vKey, valueFetchor, fieldName } = props;
    const [childTypeValueFetchors, setChildTypeValueFetchors] = useState({});
    // const [form] = Form.useForm();
    // console.log('render general type ', argIDL instanceof IDL.RecordClass, argIDL instanceof IDL.PrimitiveType);

    const setGeneralValueFetchorFromChild = (key, fetchor) => {
        console.log('setter of GeneralTypeRender');

        childTypeValueFetchors[key] = fetchor;
        console.log('fetchorMapping', childTypeValueFetchors);
        setChildTypeValueFetchors({ ...childTypeValueFetchors });
        if (valueFetchor) {
            valueFetchor(JSON.stringify(path), fetchGeneralValue);
        }
    }

    const fetchGeneralValue = () => {
        console.log('fetchor of GeneralTypeRender');
        let values = undefined;
        let key = JSON.stringify(path);
        if (childTypeValueFetchors[key]) {
            values = childTypeValueFetchors[key]();
        }
        console.log('get value from general type ====>', values);
        return values;
    }

    const renderParameters = () => {
        if (argIDL instanceof IDL.PrimitiveType) {
            return <PrimitiveRender
                argIDL={argIDL}
                path={path}
                fieldName={fieldName}
                key={path.join('/')}
            />
        }
        if (argIDL instanceof IDL.RecordClass) {
            return <RecordRender
                argIDL={argIDL}
                path={path}
                fieldName={fieldName}
                key={path.join('/')}
            />
        }
        if (argIDL instanceof IDL.VecClass) {
            return <VecRender
                argIDL={argIDL}
                path={path}
                fieldName={fieldName}
                key={path.join('/')}
            />
        }

        return <Text type="warning">Not Implemented</Text>

        if (renderType === null) {
            return <Spin />
        } else {
            switch (renderType) {
                case CONSTANT.RENDER_TYPE:
                    return <PrimitiveRender
                        valueFetchor={setGeneralValueFetchorFromChild}
                        mode={mode}
                        argIDL={argIDL}
                        paramValue={paramValue}
                        paramConfig={paramConfig}
                        path={path}
                        displayName={displayName}
                        key={vKey}
                    />
                case CONSTANT.RENDER_VEC:
                    return <VecRender
                        valueFetchor={setGeneralValueFetchorFromChild}
                        mode={mode}
                        argIDL={argIDL}
                        paramValue={paramValue ? paramValue[valueKey] : []}
                        paramConfig={paramConfig}
                        displayName={displayName}
                        path={path}
                        key={vKey}
                        vKey={vKey}
                    />
                case CONSTANT.RENDER_RECORD:
                    return <RecordRender
                        valueFetchor={setGeneralValueFetchorFromChild}
                        mode={mode}
                        argIDL={argIDL}
                        paramValue={paramValue ? paramValue[valueKey] : {}}
                        paramConfig={paramConfig}
                        displayName={displayName}
                        path={path}
                        key={vKey}
                        vKey={vKey}
                    />
                default:
                    return <span>{renderType}</span>
            }
        }
    }

    useEffect(() => {
        // if (valueFetchor) {
        //     valueFetchor(JSON.stringify(path), fetchGeneralValue);
        // }
        // let rdType = argIDL.accept(getGeneralTypeRender(), null);
        // console.log('rdType ====>', rdType);
        // setRenderType(rdType);
    }, []);

    return <div className='general-type-param-container'>
        {/* <Form form={form} initialValues={paramValue}> */}
        {renderParameters()}
        {/* </Form> */}
    </div>
}

export default GeneralTypeRender;