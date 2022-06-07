import React, { useState } from 'react';
import { Image, Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { getUserActiveConfigIndex, convertTimestampToBigInt } from '../utils/devhubUtils';
import { useAuth } from '../auth';
import './styles/AdminNewCase.less';

const AdminNewCase = (props) => {
    let nav = useNavigate();
    const [creating, setCreating] = useState(false);
    const { user } = useAuth();

    const onNewCase = async (values) => {
        const caseTag = uuidv4();
        let timeAt = convertTimestampToBigInt(new Date().getTime());
        let newCase = {
            case_run_id: [],
            tag: caseTag,
            config: JSON.stringify({
                name: values.caseName
            }),
            canister_calls: [],
            time_at: timeAt
        }
        setCreating(true);
        try {
            let result = await user.devhubActor.cache_test_case(getUserActiveConfigIndex(user), newCase);
            console.log('save new case result', result);
            if (result.Authenticated) {
                if (result.Authenticated.Ok || result.Authenticated.Ok === 0) {
                    // save success and go to 
                    let caseId = result.Authenticated.Ok;
                    if (props.onNewCase) {
                        props.onNewCase(caseId, caseTag, values.caseName, timeAt);
                    }
                    nav('/devhub/admin/cases/' + caseTag, { state: { caseid: caseTag } });

                } else {
                    message.error(result.Authenticated.Err);
                }
            } else {
                message.error(result.UnAuthenticated);
            }
        } catch (err) {
            console.log('save case error', err);
            message.error('save failed: ' + err);
        }
        setCreating(false);

    }

    return <div className='section-column-content-container'>
        <div className='content-header-container'>Create A New Case</div>
        <div className="content-main-container">
            <Form onFinish={onNewCase} className="newcase-form">
                <Form.Item name="caseName" rules={[{
                    required: true,
                    message: 'Please enter new case name!'
                }]}>
                    <Input size='large' placeholder='enter new case name here' />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType='submit' size='large' style={{ width: '100%' }} loading={creating}>
                        Save
                    </Button>
                </Form.Item>
            </Form>
        </div>
    </div>
}

export default AdminNewCase;