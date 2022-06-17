import React, { useState, useEffect } from 'react';
import { Principal } from "@dfinity/principal";
import { HttpAgent, Actor } from "@dfinity/agent";
import { useAuth } from '../auth';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, message, Result, Form, Modal, Input } from 'antd';
import { LeftOutlined } from "@ant-design/icons";
import { getUserActiveConfigIndex } from '../utils/devhubUtils';
import { getActorFromCanisterId, isLocalEnv } from '../utils/actorUtils';

import "./styles/FollowPreview.less";
import {
    DEFAULT_CANISTER_CONFIG,
    DEFAULT_CALL_LIMITS,
    DEFAULT_UI_CONFIG,
} from '../constant';

const FollowPreview = (props) => {
    const [following, setFollowing] = useState(false);
    const [inResult, setInResult] = useState(false);
    const [resultStatus, setResultStatus] = useState('success');
    const [resultTitle, setResultTitle] = useState('');
    const [showNameDlg, setShowNameDlg] = useState(false);
    const { user, refreshUserConfig } = useAuth();
    let { canisterId } = useParams();
    const [form] = Form.useForm();
    const nav = useNavigate();
    let loc = useLocation();

    const closeNameDlg = () => {
        setShowNameDlg(false);
    }
    const onFollowClick = () => {
        if (user) {
            setShowNameDlg(true);
        } else {
            nav(`/connect`, {
                state: {
                    from: loc
                }
            });
        }
    }
    const onFollow = async (canisterName) => {
        try {
            let agent = null;
            if (user) {
                agent = user.agent;
            } else {
                agent = new HttpAgent();
                if (isLocalEnv()) {
                    agent.fetchRootKey().catch(err => {
                        console.warn("Unable to fetch root key. Check to ensure that your local replica is running")
                        console.error(err)
                    });
                }
            }
            let actor = getActorFromCanisterId(canisterId, agent);
        } catch (err) {
            message.error('no canister found, please check the principal is valid.');
            return;
        }

        let newCfg = Object.assign({}, DEFAULT_CANISTER_CONFIG);
        let cfg = Object.assign({ name: canisterName }, DEFAULT_UI_CONFIG);
        newCfg.config = JSON.stringify(cfg);
        newCfg.canister_id = Principal.fromText(canisterId);
        setFollowing(true);
        closeNameDlg();
        try {
            let result = await user.devhubActor.cache_canister_config(getUserActiveConfigIndex(user), newCfg);
            setInResult(true);
            if (result.Authenticated) {
                // follow success
                refreshUserConfig();
                setResultStatus('success');
                setResultTitle('You have successfully follow the canister!');
            } else {
                // message.error(result.UnAuthenticated);
                setResultStatus('error');
                setResultTitle(result.UnAuthenticated);
            }
        } catch (err) {
            console.log('follow failed', err);
            message.error('Action failed:', err);
        }
        setFollowing(false);

    }
    useEffect(() => {
        if (!canisterId) {
            nav("/");
        }
    }, [])
    return (
        <div className='prefollow-container'>
            <Modal
                visible={showNameDlg}
                title="Give a name for the new canister"
                okText="Ok"
                cancelText="Cancel"
                onCancel={closeNameDlg}
                onOk={() => {
                    form
                        .validateFields()
                        .then(values => {
                            form.resetFields();
                            onFollow(values.canisterName);
                        })
                        .catch(info => {
                            console.log('Validate Failed:', info);
                        });
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="form_in_modal"
                >
                    <Form.Item
                        name="canisterName"
                        label="Canister Name"
                        rules={[{ required: true, message: 'Please give a name for the canister!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
            {!inResult && <>
                <div className='toolbar-container'>
                    <Button className='back-button' size='large' type="dashed" icon={<LeftOutlined className="back-button-icon" />} onClick={() => {
                        nav(-1);
                    }} />

                    <div class="canisterId-container">

                        {canisterId}

                    </div>

                    <Button className='follow-button' size="large" type="primary" loading={following} onClick={() => {
                        onFollowClick();

                    }}>Follow</Button>

                    <Button className='follow-button' size="large" type="primary" onClick={() => {
                        if (isLocalEnv()) {
                            window.open(`http://localhost:8000/?canisterId=rkp4c-7iaaa-aaaaa-aaaca-cai&id=${canisterId}`);
                        } else {
                            window.open(`http://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?canisterId=rkp4c-7iaaa-aaaaa-aaaca-cai&id=${canisterId}`);
                        }
                    }}>Preview With Original Candid UI</Button>
                </div>
                <div className='preview-container'>

                </div>
            </>}
            {inResult && <>
                <Result status={resultStatus}
                    title={resultTitle}
                    subTitle={`<unnamed>(${canisterId})`}
                    extra={resultStatus === "success" ? [
                        <Button type='primary' key="fresult-go-canisters"
                            onClick={() => {
                                nav('/candidplus/canisters');
                            }}>To Canister List</Button>,
                        <Button type="primary" key="fresult-go-newcase"
                            onClick={() => {
                                nav('/candidplus/newcase', {
                                    state: {
                                        canisterId
                                    }
                                });
                            }}>Create A Test Case For It</Button>,
                        <Button key="fresult-go-follow-more"
                            onClick={() => { nav('/'); }}>Follow More</Button>] :
                        [<Button key="fresult-go-again"
                            onClick={() => {
                                setInResult(false);
                            }}>Try Again</Button>]}
                />
            </>}
        </div>
    )

}

export default FollowPreview;