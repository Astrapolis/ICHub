import React, { useState } from 'react';
import { Image, Form, Input, Button, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { getUserActiveConfigIndex, convertTimestampToBigInt } from '../utils/devhubUtils';
import { useAuth } from '../auth';
import './styles/AdminNewCase.less';

const AdminNewCase = (props) => {
    let nav = useNavigate();
    const [creating, setCreating] = useState(false);
    const { user, refreshUserConfig } = useAuth();

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
            if (result.Authenticated || result.Authenticated === 0) {

                // save success and go to 
                // let caseId = result.Authenticated.Ok;
                // if (props.onNewCase) {
                //     props.onNewCase(caseId, caseTag, values.caseName, timeAt);
                // }

                await refreshUserConfig();

                nav('/candidplus/cases/' + caseTag, { state: { caseid: caseTag } });


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
        {/* <div className='content-header-container'>Create A New Case</div> */}
        <div className="content-main-container">
            <Card title="Create A New Case">
                <Form onFinish={onNewCase} className="newcase-form" layout="inline">
                    <Form.Item name="caseName" style={{width: '70%'}}
                    rules={[{
                        required: true,
                        message: 'Please enter new case name!'
                    }]}>
                        <Input size='large' placeholder='enter new case name here' />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType='submit' size='large' loading={creating}>
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    </div>
}

export default AdminNewCase;