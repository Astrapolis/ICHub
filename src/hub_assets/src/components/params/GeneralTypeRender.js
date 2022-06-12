import React, { useContext, useState, useEffect, useRef } from 'react';
import { Spin, Form } from 'antd';
import { getGeneralTypeRender } from "../../utils/paramRenderUtils";
import PrimitiveRender from './PrimitiveRender';
import VecRender from './VecRender';
import * as CONSTANT from "../../constant";

import "./styles/GeneralTypeRender.less";

const GeneralTypeRender = (props) => {
    const [renderType, setRenderType] = useState(null);
    const { mode, argIDL, paramValue, paramConfig, path, vKey, valueFetchor } = props;

    const [form] = Form.useForm();

    const renderParameters = () => {
        if (renderType === null) {
            return <Spin />
        } else {
            switch (renderType) {
                case CONSTANT.RENDER_TYPE:
                    return <PrimitiveRender {...props} />
                case CONSTANT.RENDER_VEC:
                    return <VecRender {...props} />
                default:
                    return <span>{renderType}</span>
            }
        }

    }
    const fetchValue = () => {
        let values = form.getFieldsValue(true);
        return values;
    }

    useEffect(() => {
        if (valueFetchor) {
            valueFetchor(vKey, fetchValue);
        }
        let rdType = argIDL.accept(getGeneralTypeRender(), null);
        console.log('rdType ====>', rdType);
        setRenderType(rdType);
    }, []);

    return <div className='general-type-param-container'>
        <Form form={form} initialValues={paramValue}>
            {renderParameters()}
        </Form>
    </div>
}

export default GeneralTypeRender;