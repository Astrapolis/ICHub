import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Principal } from "@dfinity/principal";
import { Button, Form, Input, message, Spin, Table, Tooltip, Drawer, Typography, Popconfirm } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from 'uuid';
import { getUserActiveConfigIndex, getCanisterList, convertTimestampToBigInt } from '../utils/devhubUtils';
import { getFieldFromActor } from '../utils/actorUtils';
import { useAuth } from '../auth';
import SelectCanister from './SelectCanister';
import AddMethod from './AddMethod';
import GeneralTypeRender from './params/GeneralTypeRender';
import "./styles/AdminCase.less";

const { Text } = Typography;

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
        width: 30,
        render: (_, record, index) => <span>{index + 1}</span>
    }, {
        title: 'Canister',
        dataIndex: 'canister_name',
        ellipsis: true,
        width: 120,
        render: (_, record) => {
            return <Tooltip placement='top' title={record.canister_id}>
                <span>{record.canister_name === undefined ? "<unnamed>" : record.canister_name}</span>
            </Tooltip>
        }
    }, {
        title: 'Query/Update',
        dataIndex: 'function_name',
        width: 150,
        ellipsis: true,
        render: (_, record) => {
            return <Tooltip placement='top' title={record.function_name}>
                <span>{record.function_name}</span>
            </Tooltip>
        }
    }, {
        title: '',
        render: (_, record) => {
            return <><Button type="primary">Call</Button>
                <Popconfirm title="Are you sure？" okText="Yes" cancelText="No" onConfirm={() => {
                    onDeleteMethod(record);
                }}>
                    <Button style={{ marginLeft: 3 }} icon={<DeleteOutlined />} danger />
                </Popconfirm>

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
            let cans = await getCanisterList(user, true);
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
                    cdetail.canister_calls.forEach(med => {
                        med.canister_id = med.canister_id.toText();
                        if (med.params) {
                            med.params = JSON.parse(med.params);
                        }
                        let bingo = cans.find(c => c.canisterId === med.canister_id);
                        if (bingo) {
                            med.canister_name = bingo.name;
                            if (bingo.actor) {
                                let f = getFieldFromActor(bingo.actor, med.function_name);
                                if (f) {
                                    med.method = f;
                                }
                            }
                        }

                    })
                    let tdetail = cloneCase(cdetail);
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

    let cloneCase = (caseA) => {
        let tCase = {
            tag: caseA.tag,
            config: JSON.parse(JSON.stringify(caseA.config)),
            canister_calls: []
        };
        caseA.canister_calls.forEach((ele, index) => {
            tCase.canister_calls[index] = Object.assign({}, ele);
            tCase.canister_calls[index].uuid = uuidv4();
        });

        return tCase;
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
            if (!elementB) {
                callIsSame = false;
                return false;
            }
            if (element.canister_id !== elementB.canister_id) {
                callIsSame = false;
                return false;
            }
            // if (!Principal.equal(element.canister_id, elementB.canister_id)) {
            //     callIsSame = false;
            //     return false;
            // }
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

    const onUpdateCase = async () => {
        setUpdating(true)
        try {
            let testCaseView = cloneCase(editCase);
            testCaseView.time_at = convertTimestampToBigInt(new Date().getTime());
            // testCaseView.canister_id = Principal.fromText(testCaseView.canister_id);
            testCaseView.canister_calls.forEach((med, index) => {
                delete med.uuid;
                delete med.canister_name;
                med.method = undefined;
                med.canister_id = Principal.fromText(med.canister_id);
                med.event = []; // null rep of opt type
                med.params = JSON.stringify(med.params);

            });
            testCaseView.config = JSON.stringify(testCaseView.config);
            testCaseView.case_run_id = [];
            console.log('ready to save cases', testCaseView);
            let result = await user.devhubActor.cache_test_case(getUserActiveConfigIndex(user),testCaseView);
            let newEditCase = cloneCase(editCase);
            setCaseDetail(editCase);
            setEditCase(newEditCase);

        } catch (err) {
            console.log('update case  failed', err);
            message.error('update case  failed:' + err);
        }
        setUpdating(false);

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
    const onDeleteMethod = (record) => {
        editCase.canister_calls.splice(editCase.canister_calls.findIndex(method => method.uuid === record.uuid), 1);
        editCase.canister_calls = [...editCase.canister_calls];
        setEditCase({ ...editCase });
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

    const onMethodsAdded = (canister, newMethods, paramValues) => {
        editCase.canister_calls = [...editCase.canister_calls, ...newMethods];
        console.log('update case ====>', editCase, newMethods);
        setEditCase({ ...editCase });


    }
    const closeDrawer = () => {
        setShowAddCallDrawer(false);
    }

    const renderCaseExpandablePart = (record) => <div className='caserow-expandable-container'>
        <div className='caserow-expandable-param-container'>
            <div>
                <Text>Call spec:</Text>
                <Text type="secondary">{`${record.method[1].display()}`}</Text>
            </div>
            {record.method && record.method[1].argTypes.map((argIDL, index) => {
                // console.log('render params with', record.params);
                return <Form initialValues={record.params}>
                    <GeneralTypeRender
                        mode={"read"}
                        argIDL={argIDL}
                        paramValue={record.params}
                        paramConfig={null}
                        path={[index + '']}
                        key={`/${index}`}
                    />
                </Form>
            })}
            {!record.method && <Text type="danger">{`method ${record.function_name} not found`}</Text>}
        </div>
        <div className='caserow-expandable-footer-container'>
            <Button icon={<EditOutlined />} size="large" onClick={() => { }} />
        </div>
    </div>



    useEffect(() => {
        fetchCaseDetail();
    }, [])

    useEffect(() => {
        if (caseDetail && editCase) {
            if (caseIsEqual(editCase, caseDetail)) {
                setSaveEnable(false);
            } else {
                setSaveEnable(true);
            }
        }
    }, [editCase])

    return <div className='section-column-content-container'>
        {(loading || updating) && <Spin size="large"/>}
        {!loading && !updating && editCase &&
            <>
                <div className='content-header-container case-toolbar'>

                    <div>
                        {!editTitle &&
                            <>
                                <span>{editCase.config.name}</span><Button style={{ marginLeft: 5 }} icon={<EditOutlined />} size="large" onClick={() => { setEditTitle(true); }} />
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
                        <Button type="primary" disabled={!saveEnable || editTitle} loading={updating} size="large" 
                            onClick={() => {
                                onUpdateCase();
                            }}
                        >Save</Button>
                        <Button style={{ marginLeft: 5 }} size="large">Copy</Button>
                    </div>
                </div>
                <div className='case-view-container'>
                    <div className='case-editor-container'>
                        <Table columns={caseCallColumns} rowKey="uuid" dataSource={editCase.canister_calls}
                            expandable={{
                                expandedRowRender: renderCaseExpandablePart,
                                rowExpandable: record => true,
                            }}
                            summary={() => <Table.Summary fixed>
                                <Table.Summary.Row>
                                    <Table.Summary.Cell index={0} colSpan={2}>
                                        <Button type="primary" onClick={onShowAddCallDrawer} disabled={editTitle || updating}>Add Call</Button>
                                    </Table.Summary.Cell>
                                    {editCase.canister_calls.length > 0 &&
                                        <Table.Summary.Cell index={1} colSpan={2}>
                                            <Button style={{ marginLeft: 10 }} type="primary" disabled={editTitle || updating}
                                            
                                            >{saveEnable ? "Save & Call All" : "Call All"}</Button>
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
                        closable={false}
                        maskClosable={false}
                        // contentWrapperStyle={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
                        onClose={onAddCallDrawerClosed}
                        getContainer={false}
                        style={{ position: 'absolute' }}
                    >
                        <div className='addcall-drawer-content-container'>
                            {drawerStep === "canister" && <SelectCanister onSelectCanister={onSelectCanister} canisterList={canisterList} closeDrawer={closeDrawer} />}
                            {drawerStep === "methods" && <AddMethod canister={activeCanister}
                                onMethodsAdded={onMethodsAdded}
                                closeDrawer={closeDrawer} />}
                        </div>
                    </Drawer>
                </div>
            </>
        }

    </div>
}

export default AdminCase;