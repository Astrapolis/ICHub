import React, { useState, useEffect } from 'react';
import { Typography, List, Divider, Spin } from 'antd';
import { getPrimitiveValueParser, getGeneralValueParser } from '../utils/paramRenderUtils';
const { Text } = Typography;

const CallSpec = (props) => {
    const { method } = props;
    const [callSpec, setCallSpec] = useState(null);

    const prepareCallSpecs = () => {
        let specs = [];
        method.method[1].argTypes.forEach((arg, index) => {
            let valueDesc = {
                type: arg.display(),
                value: arg.valueToString(arg.accept(getGeneralValueParser(), method.params[index]))
            };
            let valueObject = {
                title: arg.display(),
                desc: JSON.stringify(valueDesc)
            }
            specs.push(valueObject);
        });
        setCallSpec([...specs]);
    }

    useEffect(() => {
        prepareCallSpecs();
    }, []);


    return <>
        {!callSpec && <Spin />}
        {callSpec && callSpec.length === 0 && <Text type="success">Empty Parameters</Text>}
        {callSpec && callSpec.length > 0 &&
            <List
                header={<Text strong>Call Values:</Text>}
                itemLayout="horizontal"
                dataSource={callSpec}
                renderItem={item => (<List.Item>
                    <List.Item.Meta
                        title={<Text mark>{item.title}</Text>}
                        description={<Text code>{item.desc}</Text>} />
                </List.Item>)}
            />}
    </>
}

export default CallSpec;