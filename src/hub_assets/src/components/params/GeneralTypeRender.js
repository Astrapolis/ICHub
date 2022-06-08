import React, { useContext, useState, useEffect, useRef } from 'react';
import { Spin } from 'antd';
import { getGeneralTypeRender } from "../../utils/paramRenderUtils";
import PrimitiveRender from './PrimitiveRender';
import * as CONSTANT from "../../constant";

import "./styles/GeneralTypeRender.less";

const GeneralTypeRender = (props) => {
    const [renderType, setRenderType] = useState(null);
    const { mode, argIDL, paramValue, paramConfig, path } = props;

    const renderParameters = () => {
        if (renderType === null) {
            return <Spin />
        } else {
            switch (renderType) {
                case CONSTANT.RENDER_TYPE:
                    return <PrimitiveRender {...props} />
                default:
                    return <span>{renderType}</span>
            }
        }

    }

    useEffect(() => {
        let rdType = argIDL.accept(getGeneralTypeRender(), null);
        console.log('rdType ====>', rdType);
        setRenderType(rdType);
    }, []);

    return <div className='general-type-param-container'>
        {renderParameters()}
    </div>
}

export default GeneralTypeRender;