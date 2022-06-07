import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../auth';
import { Image, Form, Input, Button } from 'antd';
import { Principal } from "@dfinity/principal";
import "./styles/Wellcome.less";
import leftPng from "./styles/wellcome-left-deco.png";
import rightPng from "./styles/wellcome-right-deco.png";

const Wellcome = (props) => {
    let nav = useNavigate();
    const auth = useAuth();

    useEffect(() => {
        if (auth.user) {
            nav('/devhub/admin');
            // nav('/connect');
        }
    }, []);

    const onSearch = (values) => {
        nav(`/prefollow/${values.canisterId}`);
    }

    return (
        <div className='wellcome-container'>

            <div className='wellcome-title-container'>
                Hello, Candid+
            </div>
            <div className='wellcome-desc-container'>
                Hub Candid+ acts as a dev tool to interact with the interface of the canister. You can store test the use case of your projects or you can just call whichever canister just like official Candid UI. Candid+ will store your favorite canisters and call records in your own canister. At the same time, you can organize your regular use case across different canisters.
            </div>
            <div className='wellcome-follow-title-container'>
                Follow Your First Canister
            </div>

            <div className='wellcome-follow-container'>

                <Image rootClassName='deco-container' className='ldeco-image' src={leftPng} preview={false} />


                <div className='wellcome-follow-form-container'>
                    <Form onFinish={onSearch}>
                        <Form.Item
                            className='canister-input-element'
                            name="canisterId"
                            validateFirst
                            rules={[{ required: true, message: 'Please enter canisterId!' }, {
                                message: 'not a principal format!',
                                validator: (_,value) => {
                                    try {
                                        let p = Principal.fromText(value);
                                        return Promise.resolve();
                                    } catch (err) {
                                        return Promise.reject('invalid principal');
                                    }
                                }
                            }]}
                        >
                            <Input size="large" />
                        </Form.Item>
                        <Form.Item className='canister-input-element'>
                            <Button type="primary" htmlType="submit" size='large' style={{width: '100%'}}>
                                Search
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
                <Image rootClassName='deco-container' className='rdeco-image' src={rightPng} preview={false} />
            </div>
        </div>
    )
}

export default Wellcome;