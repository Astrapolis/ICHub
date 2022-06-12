import React, { useContext, useState, useEffect, useRef } from 'react';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Form, Space, Button } from 'antd';
import GeneralTypeRender from './GeneralTypeRender';

const VecRender = (props) => {

    const { mode, argIDL, paramConfig, path } = props;

    return <Form.Item
        label={paramConfig && paramConfig.name ? paramConfig.name : argIDL.display()}
    >
        <Form.List name={path}
        >
            {(fields, { add, remove }) => <>
                {fields.map((field, index) => {
                    return <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <GeneralTypeRender mode={mode}
                            argIDL={argIDL._type}
                            paramConfig={paramConfig}
                            path={[...path, index + '']} />
                        {mode === "new" && <MinusCircleOutlined onClick={() => remove(field.name)} />}</Space>
                })}
                {mode === "new" &&
                    <Form.Item>
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            Add
                        </Button>
                    </Form.Item>}
            </>}
        </Form.List>
    </Form.Item>
}

export default VecRender;