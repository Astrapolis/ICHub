import React, { useContext, useState, useEffect, useRef } from 'react';
import { ConsoleSqlOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Space, Button, List, Typography } from 'antd';
import GeneralTypeRender from './GeneralTypeRender';
const { Text } = Typography;

const VecRender = (props) => {

    const { mode, argIDL, paramConfig, paramValue, path, vKey, valueFetchor, displayName } = props;
    const [arrayValues, setArrayValues] = useState([]);
    const [entryTypeValueFetchors, setEntryTypeValueFetchors] = useState([]);

    const setArrayValueFetchorFromChild = (index, fetchor) => {
        console.log('setter of VecRender');
        console.log('fetchor', index, fetchor);
        entryTypeValueFetchors[index] = fetchor;
        console.log('length of fetchors', entryTypeValueFetchors.length, arrayValues);
        setEntryTypeValueFetchors([...entryTypeValueFetchors]);
        if (valueFetchor) {
            valueFetchor(JSON.stringify(path), fetchVecValue);
        }
    }

    const fetchVecValue = () => {
        console.log('fetchor of VecRender');
        console.log('fetchors', entryTypeValueFetchors);
        let values = [];
        entryTypeValueFetchors.forEach((fetchor, index) => {
            console.log('itor vec fetchor', index, fetchor);
            values[index] = fetchor();
        });
        console.log('fetch array value', values);
        return values;
    }


    const onAddNewEntry = () => {
        // arrayValues.length += 1;
        arrayValues[arrayValues.length] = {
            key: `${vKey}/${arrayValues.length}`
        }
        setArrayValues([...arrayValues]);
    }
    const onRemoveEntry = (index) => {
        arrayValues.splice(index, 1);
        entryTypeValueFetchors.splice(index, 1);
        setEntryTypeValueFetchors([...entryTypeValueFetchors]);
        setArrayValues([...arrayValues]);

    }

    useEffect(() => {
        if (valueFetchor) {
            valueFetchor(JSON.stringify(path), fetchVecValue);
        }
        if (paramValue) {
            console.log('vec paramValue', paramValue);
            let values = [];
            paramValue.forEach((v, index) => {
                values[index] = {
                    key: `${vKey}/${index}`,
                    value: v
                }
            });
            setArrayValues([...values]);
        }
    }, [])

    return <List
        header={<Text>{displayName ? displayName : argIDL.display()}</Text>}
        footer={<Button type="dashed" disabled={mode === "read"} onClick={() => onAddNewEntry()} block icon={<PlusOutlined />}>
            Add
        </Button>}
        bordered
        dataSource={arrayValues}
        renderItem={(item, index) => {
            let iValue = {

            };
            iValue[index] = item.value;
            return (
                <List.Item>
                    <Space key={`${item.key}`} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <GeneralTypeRender
                            mode={mode}
                            argIDL={argIDL._type}
                            paramValue={iValue}
                            paramConfig={paramConfig}
                            valueKey={index + ''}
                            path={[index + '']}
                            key={`G/${item.key}`}
                            vKey={`${vKey}/${index}`}
                            valueFetchor={(path, fetchor) => {
                                setArrayValueFetchorFromChild(index, fetchor);
                            }} />
                        {mode === "new" && <MinusCircleOutlined onClick={() => onRemoveEntry(index)} />}
                    </Space>
                </List.Item>
            );
        }}
    />


}

export default VecRender;