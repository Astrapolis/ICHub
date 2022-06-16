import React, { useState, useEffect } from 'react';
import { Checkbox, Card, Typography } from 'antd';
import { useCasesValue } from '.';
import GeneralTypeRender from './GeneralTypeRender';
import { convertPathToJson, gothroughArgType } from '../../utils/paramRenderUtils';

const { Text } = Typography;

const OptRender = (props) => {
    const { argIDL, path, fieldName } = props;
    const [isNull, setIsNull] = useState(true);

    const {
        casesValue,
        getParamValue,
        updateParamValue
    } = useCasesValue();

    const onNullValueChange = (event) => {
        let checked = event.target.checked;
        let objectValue = undefined;
        if (checked) {
            objectValue = convertPathToJson(path, null);

        } else {
            objectValue = convertPathToJson(path, gothroughArgType(argIDL._type));

        }
        updateParamValue(path.join('/'), objectValue);
        setIsNull(checked);
    }

    useEffect(() => {
        let value = getParamValue(path.join('/'));
        if (value === null) {
            setIsNull(true);
        } else {
            setIsNull(false);
        }

    }, [casesValue])


    return <Card title={<Text>{fieldName ? fieldName : argIDL.display()}</Text>}>
        <Checkbox checked={isNull}
            onChange={onNullValueChange}
        ><Text code>null</Text></Checkbox>

        {!isNull &&
            <Card type="inner">
                <GeneralTypeRender
                    argIDL={argIDL._type}
                    path={path}
                    key={`G/${path.join('/')}`}
                />
            </Card>}
    </Card>
}

export default OptRender;

