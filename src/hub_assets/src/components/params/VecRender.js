import React, { useContext, useState, useEffect, useRef } from 'react';
import { ConsoleSqlOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Space, Button, List, Typography } from 'antd';
import { useCasesValue } from '.';
import GeneralTypeRender from './GeneralTypeRender';
const { Text } = Typography;

const VecRender = (props) => {

    const { argIDL, path, fieldName } = props;
    const [arrayValues, setArrayValues] = useState([]);

    const {
        casesValue,
        removeParamValue,
        addParamValue,
        getParamValue
    } = useCasesValue();


    const onAddNewEntry = () => {
        // arrayValues.length += 1;
        let pathString = `${path.join('/')}/${arrayValues.length}`;
        // arrayValues[arrayValues.length] = {
        //     key: pathString
        // }
        // setArrayValues([...arrayValues]);
        addParamValue(pathString, argIDL._type);
    }
    const onRemoveEntry = (index) => {
        console.log('onRemoveEntry', index);
        let pathString = `${path.join('/')}/${index}`;
        removeParamValue(pathString);
    }

    useEffect(() => {
        console.log('fetch vec value by path', path.join('/'));
        let paramValue = getParamValue(path.join('/'));


        // if (paramValue) {
        console.log('vec paramValue', paramValue);
        let values = [];
        paramValue.forEach((v, index) => {
            values[index] = {
                key: `${path.join('/')}/${index}`,
                value: v
            }
        });
        setArrayValues([...values]);
        // }
    }, [casesValue])

    return <List
        header={<Text>{fieldName ? fieldName : argIDL.display()}</Text>}
        footer={<Button type="dashed" onClick={() => onAddNewEntry()} block icon={<PlusOutlined />}>
            Add
        </Button>}
        bordered
        dataSource={arrayValues}
        renderItem={(item, index) => {
            return (
                <List.Item>
                    <Space key={`VecItem/${item.key}`} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <GeneralTypeRender
                            argIDL={argIDL._type}
                            path={[...path, index]}
                            key={`G/${item.key}`}
                        />
                        <MinusCircleOutlined onClick={() => onRemoveEntry(index)} />
                    </Space>
                </List.Item>
            );
        }}
    />


}

export default VecRender;