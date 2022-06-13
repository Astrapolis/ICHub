import React, { useState, useEffect } from 'react';
import { List, Typography, Space } from 'antd';
import GeneralTypeRender from './GeneralTypeRender';
const { Text } = Typography;

const RecordRender = (props) => {

    const { mode, argIDL, paramConfig, paramValue, path, vKey, valueFetchor, displayName } = props;
    const [objectValues, setObjectValues] = useState([]);
    const [objectFieldValueFetchors, setObjectFieldValueFetchors] = useState({});

    console.log('render record argIDL',argIDL);
    const setObjectFieldFetchorFromChild = (index, fetchor) => {
        objectFieldValueFetchors[index] = fetchor;
        setObjectFieldValueFetchors({ ...objectFieldValueFetchors });
        updateFetchor();
    }

    const updateFetchor = () => {
        if (valueFetchor) {
            valueFetchor(JSON.stringify(path), fetchRecordValue);
        }
    }

    const fetchRecordValue = () => {
        let value = undefined;
        argIDL._fields.forEach((field, index) => {

            let v = objectFieldValueFetchors[field[0]]();
            if (v !== undefined) {
                if (!value) {
                    value = {}
                }
                value[field[0]] = v;
            }
        });
        return value;
    }

    useEffect(() => {
        updateFetchor();
        if (paramValue) {
            console.log('record paramValue', paramValue);
            let values = [];
            argIDL._fields.forEach((field, index) => {
                values[index] = {
                    key: `${vKey}/${field[0]}`,
                    value: paramValue[field[0]]
                }
            });
            setObjectValues([...values]);
        }
    }, []);

    return <List
        header={<Text>{displayName ? displayName : argIDL.display()}</Text>}
        bordered
        dataSource={objectValues}
        renderItem={(item, index) => {
            let iValue = {

            };
            iValue[argIDL._fields[index][0]] = item.value;
            return (<List.Item>
                <Space key={`${item.key}`} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <GeneralTypeRender
                            mode={mode}
                            argIDL={argIDL._fields[index][1]}
                            paramValue={iValue}
                            paramConfig={paramConfig}
                            valueKey={`${argIDL._fields[index][0]}`}
                            path={[`${argIDL._fields[index][0]}`]}
                            key={`G/${item.key}`}
                            vKey={`${vKey}/${index}`}
                            displayName={`${argIDL._fields[index][0]}`}
                            valueFetchor={(path, fetchor) => {
                                setObjectFieldFetchorFromChild(argIDL._fields[index][0], fetchor);
                            }} />
                    </Space>
            </List.Item>)
        }}
    />


}

export default RecordRender;