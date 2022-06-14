import React, { useState, useEffect } from 'react';
import { List, Typography, Space } from 'antd';
import GeneralTypeRender from './GeneralTypeRender';
import { useCasesValue } from '.';

const { Text } = Typography;

const RecordRender = (props) => {

    const { argIDL, path, displayName } = props;
    const [objectValues, setObjectValues] = useState([])

    const {
        getParamValue
    } = useCasesValue();
    
    useEffect(() => {
        let listData = [];
        let value = getParamValue(path.join('/'));
        

        argIDL._fields.forEach((field, index) => {
            listData[index] = {
                key: `${path.join('/')}/${field[0]}`,
                value: value[field[0]]
            }
        });
        setObjectValues([...listData]);

    }, []);

    return <List
        header={<Text>{displayName ? displayName : argIDL.display()}</Text>}
        bordered
        dataSource={objectValues}
        renderItem={(item, index) => {
            return (<List.Item>
                <Space key={`RecItemSp/${item.key}`} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <GeneralTypeRender
                        argIDL={argIDL._fields[index][1]}
                        path={[...path,`${argIDL._fields[index][0]}`]}
                        key={`RecItemG/${item.key}`}
                        fieldName={`${argIDL._fields[index][0]}`}
                        />
                </Space>
            </List.Item>)
        }}
    />


}

export default RecordRender;