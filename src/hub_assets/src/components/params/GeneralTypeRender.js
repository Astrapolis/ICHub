import React, { useContext, useState, useEffect, useRef } from 'react';
import { Spin, Form } from 'antd';
import { getGeneralTypeRender } from "../../utils/paramRenderUtils";
import PrimitiveRender from './PrimitiveRender';
import VecRender from './VecRender';
import * as CONSTANT from "../../constant";

import "./styles/GeneralTypeRender.less";

const GeneralTypeRender = (props) => {
    const [renderType, setRenderType] = useState(null);
    const { mode, argIDL, paramValue, paramConfig, path, valueKey, vKey, valueFetchor } = props;
    const [childTypeValueFetchors, setChildTypeValueFetchors] = useState({});
    // const [form] = Form.useForm();

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
                        key={vKey}
                    />
                case CONSTANT.RENDER_VEC:
                    return <VecRender
                        valueFetchor={setGeneralValueFetchorFromChild}
                        mode={mode}
                        argIDL={argIDL}
                        paramValue={paramValue ? paramValue[valueKey] : []}
                        paramConfig={paramConfig}
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
        if (valueFetchor) {
            valueFetchor(JSON.stringify(path), fetchGeneralValue);
        }
        let rdType = argIDL.accept(getGeneralTypeRender(), null);
        console.log('rdType ====>', rdType);
        setRenderType(rdType);
    }, []);

    return <div className='general-type-param-container'>
        {/* <Form form={form} initialValues={paramValue}> */}
        {renderParameters()}
        {/* </Form> */}
    </div>
}

export default GeneralTypeRender;