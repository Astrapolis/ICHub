import React, { useState, useEffect } from 'react';
import { Principal } from "@dfinity/principal";
import { useAuth } from '../auth';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button, message, Result } from 'antd';
import { LeftOutlined } from "@ant-design/icons";
import { getUserActiveConfigIndex } from '../utils/devhubUtils';

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
    const { user } = useAuth();
    let { canisterId } = useParams();
    const nav = useNavigate();
    let loc = useLocation();

    const onFollow = async () => {
        if (user) {
            let newCfg = Object.assign({}, DEFAULT_CANISTER_CONFIG);
            newCfg.config = JSON.stringify(DEFAULT_UI_CONFIG);
            newCfg.canister_id = Principal.fromText(canisterId);
            setFollowing(true);
            try {
                let result = await user.devhubActor.cache_canister_config(getUserActiveConfigIndex(user), newCfg);
                setInResult(true);
                if (result.Authenticated) {
                    // follow success

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
        } else {
            nav(`/connect`, {
                state: {
                    from: loc
                }
            });
        }
    }
    return (
        <div className='prefollow-container'>
            {!inResult && <>
                <div className='toolbar-container'>
                    <Button className='back-button' size='large' type="dashed" icon={<LeftOutlined className="back-button-icon" />} onClick={() => {
                        nav(-1);
                    }} />

                    <div class="canisterId-container">

                        {canisterId}

                    </div>

                    <Button className='follow-button' size="large" type="primary" onClick={onFollow}>Follow</Button>
                </div>
                <div className='preview-container'>
                    <iframe src={`http://localhost:8000/?canisterId=rkp4c-7iaaa-aaaaa-aaaca-cai&id=${canisterId}`} />
                </div>
            </>}
            {inResult && <>
                <Result status={resultStatus}
                    title={resultTitle}
                    subTitle={`<unnamed>(${canisterId})`}
                    extra={resultStatus === "success" ? [
                        <Button type='primary' key="fresult-go-canisters"
                        onClick={() => {
                            nav('/devhub/admin/canisters');
                        }}>To Canister List</Button>,
                        <Button type="primary" key="fresult-go-newcase"
                        onClick={() => {
                            nav('/devhub/admin/newcase', {
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