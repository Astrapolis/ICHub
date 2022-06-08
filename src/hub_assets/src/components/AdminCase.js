import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Principal } from "@dfinity/principal";
import { Button, Form, Input, message, Spin, Table, Tooltip, Drawer } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from 'uuid';
import { getUserActiveConfigIndex, getCanisterList } from '../utils/devhubUtils';
import { useAuth } from '../auth';
import SelectCanister from './SelectCanister';
import AddMethod from './AddMethod';
import "./styles/AdminCase.less";


const AdminCase = (props) => {
    let { caseid } = useParams();
    const [canisterList, setCanisterList] = useState([]);
    const [caseDetail, setCaseDetail] = useState(null);
    const [editCase, setEditCase] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editTitle, setEditTitle] = useState(false);
    const [saveEnable, setSaveEnable] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [showAddCallDrawer, setShowAddCallDrawer] = useState(false);
    const [drawerStep, setDrawerStep] = useState("canister");
    const [activeCanister, setActiveCanister] = useState(null);
    const [titleEditForm] = Form.useForm();

    const { user } = useAuth();

    const caseCallColumns = [{
        title: '',
        render: (_, record, index) => <span>{index}</span>
    }, {
        title: 'Canister',
        dataIndex: 'canister_id',
        ellipsis: true,
        width: 150,
        render: (_, record) => {
            return <Tooltip placement='top' title={record.canister_id}>
                <span>{record.canister_id}</span>
            </Tooltip>
        }
    }, {
        title: 'Query/Update',
        dataIndex: 'function_name',
        width: 150,
        render: (_, record) => {
            return <Tooltip placement='top' title={record.function_name}>
                <span>{record.function_name}</span>
            </Tooltip>
        }
    }, {
        title: '',
        render: (_, record) => {
            return <><Button type="primary">Call</Button>
                <Button icon={<DeleteOutlined />} danger />
            </>
        }
    }];
    const caseHistoryColumns = [{
        title: 'Index',
        dataIndex: 'case_run_id',
    }, {
        title: 'Canister',
        dataIndex: 'canister_id',
        ellipsis: true,
        width: 150,
        render: (_, record) => {
            return <Tooltip placement='top' title={record.canister_id}>
                <span>{record.canister_id}</span>
            </Tooltip>
        }
    }, {
        title: 'Call',
        dataIndex: 'function_name',
        width: 150,
        render: (_, record) => {
            return <Tooltip placement='top' title={record.function_name}>
                <span>{record.function_name}</span>
            </Tooltip>
        }
    }, {
        title: 'Call Time',
        dataIndex: 'time_at'
    }]

    const fetchCaseDetail = async () => {
        setLoading(true);
        try {
            let cans = await getCanisterList(user);
            setCanisterList(cans);
            let list = await user.devhubActor.get_test_cases(getUserActiveConfigIndex(user), [{ tag: caseid }], [20]);
            if (list.Authenticated) {
                let clist = list.Authenticated;
                if (clist.length === 0) {
                    message.error('No case found...');
                } else {
                    let cdetail = {
                        tag: clist[0].tag,
                        config: JSON.parse(clist[0].config),
                        canister_calls: clist[0].canister_calls ? [...clist[0].canister_calls] : []
                    };
                    let tdetail = {
                        tag: cdetail.tag,
                        config: JSON.parse(clist[0].config),
                        canister_calls: []
                    };
                    cdetail.canister_calls.forEach((ele, index) => {
                        tdetail.canister_calls[index] = Object.assign({}, ele);
                        tdetail.canister_calls[index].uuid = uuidv4();
                    });
                    setCaseDetail(cdetail);
                    setEditCase(tdetail);
                }

            }
        } catch (err) {
            console.log('fetch case detail error', err);
            message.error('fetch case detail error: ' + err);
        }

        setLoading(false);
    }

    let caseIsEqual = (caseA, caseB) => {
        if (caseA.tag !== caseB.tag) {
            return false;
        }
        if (JSON.stringify(caseA.config) !== JSON.stringify(caseB.config)) {
            return false;
        }
        if (caseA.canister_calls.length !== caseA.canister_calls.length) {
            return false;
        }
        let callIsSame = true;
        caseA.canister_calls.every((element, index) => {
            let elementB = caseB.canister_calls[index];
            if (!Principal.equal(element.canister_id, elementB.canister_id)) {
                callIsSame = false;
                return false;
            }
            if (element.function_name !== elementB.function_name) {
                callIsSame = false;
                return false;
            }
            if (element.params !== elementB.params) {
                callIsSame = false;
                return false;
            }
            return true;
        });
        return callIsSame;
    }

    const onUpdateCase = () => {
        setTitleSaving(true);
        // try {
        //     let testCaseView = Object.assign({}, testCase);
        //     testCaseView.config.name = values.caseName;
        //     testCase.config = JSON.stringify(testCase.config);
        //     let result = await user.devhubActor.cache_test_case(getUserActiveConfigIndex(user),testCaseView);

        // } catch (err) {
        //     console.log('save case name failed', err);
        //     message.error('save case name failed:' + err);
        // }

        setTitleSaving(false);

    }
    const onResetEditTitle = () => {
        titleEditForm.resetFields();
        setEditTitle(false);
    }
    const onUpdateCaseName = (values) => {
        let newState = Object.assign({}, editCase);
        newState.config.name = values.caseName;
        setEditCase(newState);
        setEditTitle(false);
    }
    const onShowAddCallDrawer = () => {
        setShowAddCallDrawer(true);
    }
    const onAddCallDrawerClosed = () => {
        setShowAddCallDrawer(false);
        setActiveCanister(null);
        setDrawerStep("canister");
    }

    const onSelectCanister = (canister) => {
        setActiveCanister(canister);
        setDrawerStep("methods");
    }

    const onMethodsAdded = (newMethods) => {

    }

    useEffect(() => {
        fetchCaseDetail();
    }, [])

    return <div className='section-column-content-container'>
        {loading && <Spin />}
        {!loading && editCase &&
            <>
                <div className='content-header-container case-toolbar'>

                    <div>
                        {!editTitle &&
                            <>
                                <span>{editCase.config.name}</span><Button icon={<EditOutlined />} size="large" onClick={() => { setEditTitle(true); }} />
                            </>}
                        {editTitle && <>
                            <Form form={titleEditForm}
                                initialValues={{ caseName: editCase.config.name }}
                                layout="inline"
                                onFinish={onUpdateCaseName}>
                                <Form.Item name="caseName" rules={[{
                                    required: true,
                                    message: 'Please enter case name'
                                }]}>
                                    <Input size="large" placeholder='enter case name' />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType='submit' size="large" icon={<CheckOutlined />} />
                                </Form.Item>
                                <Form.Item>
                                    <Button htmlType='reset' size="large" icon={<CloseOutlined />} onClick={
                                        onResetEditTitle
                                    } />
                                </Form.Item>
                            </Form>
                        </>}
                    </div>
                    <div className='case-toolbar-operation-container'>
                        <Button type="primary" disabled={!saveEnable} loading={updating} size="large">Save</Button>
                        <Button size="large">Copy</Button>
                    </div>
                </div>
                <div className='case-view-container'>
                    <div className='case-editor-container'>
                        <Table columns={caseCallColumns} rowKey="uuid"
                            summary={() => <Table.Summary fixed>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0}>
                                        <Button type="primary" onClick={onShowAddCallDrawer}>Add Call</Button>
                                    </Table.Summary.Cell>
                                    {editCase.canister_calls.length > 0 &&
                                        <Table.Summary.Cell index={1}>
                                            <Button type="primary">{saveEnable ? "Save & Call All" : "Call All"}</Button>
                                        </Table.Summary.Cell>}
                                </Table.Summary.Row>
                            </Table.Summary>}
                        />
                    </div>
                    <div className='case-history-container'>
                        <Table columns={caseHistoryColumns}
                            summary={() => <Table.Summary fixed>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0}>
                                        <Button type="primary">All Logs</Button>
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            </Table.Summary>}
                        />
                    </div>
                    <Drawer title="Add Call" placement="bottom"
                        height={"95%"}
                        visible={showAddCallDrawer}
                        closable={true}
                        // contentWrapperStyle={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
                        onClose={onAddCallDrawerClosed}
                        getContainer={false}
                        style={{ position: 'absolute' }}
                    >
                        <div className='addcall-drawer-content-container'>
                            {drawerStep === "canister" && <SelectCanister onSelectCanister={onSelectCanister} canisterList={canisterList} />}
                            {drawerStep === "methods" && <AddMethod  canister={activeCanister} onMethodsAdded={onMethodsAdded}/>}
                        </div>
                    </Drawer>
                </div>
            </>
        }

    </div>
}

export default AdminCase;