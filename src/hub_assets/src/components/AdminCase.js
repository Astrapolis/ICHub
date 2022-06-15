import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Principal } from "@dfinity/principal";
import {
    Button, Form, Input, message, Spin, Table, Tooltip, PageHeader,
    Drawer, Typography, Popconfirm, Collapse, Empty, Card, Space,
    Layout, Row, Col
} from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from 'uuid';
import { getUserActiveConfigIndex, getCanisterList, convertTimestampToBigInt, convertBignumberToDate } from '../utils/devhubUtils';
import { getFieldFromActor } from '../utils/actorUtils';
import { isMethodCallable } from '../utils/paramRenderUtils';
import { str2Utf8Bytes } from '../utils/stringUtils';
import { useAuth } from '../auth';
import { ProvideCasesValue } from './params';
import MethodSpec from './MethodSpec';
import SelectCanister from './SelectCanister';
import AddMethod from './AddMethod';
import EditMethod from './EditMethod';
import MethodParamsDisplay from './MethodParamsDisplay';
import CallOncePanel from './CallOncePanel';
import RunCasePanel from './RunCasePanel';
import RunMethodHistoryEntry from "./RunCaseHistoryEntry";
import "./styles/AdminCase.less";

const { Text } = Typography;
const { Panel } = Collapse;

const AdminCase = (props) => {
    let { caseid } = useParams();
    const [canisterList, setCanisterList] = useState([]);
    const [caseDetail, setCaseDetail] = useState(null);
    const [editCase, setEditCase] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editTitle, setEditTitle] = useState(false);
    const [saveEnable, setSaveEnable] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [showBottomDrawer, setShowBottomDrawer] = useState(false);
    const [drawerStep, setDrawerStep] = useState(null);
    const [activeCanister, setActiveCanister] = useState(null);
    const [activeMethod, setActiveMethod] = useState(null);
    const [activeCallMethod, setActiveCallMethod] = useState(null);
    const [activeCallCanister, setActiveCallCanister] = useState(null);
    const [callHistory, setCallHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historySaving, setHistorySaving] = useState(false);

    const [titleEditForm] = Form.useForm();

    const { user, refreshUserConfig } = useAuth();

    const drawerTitle = {
        canister: "Add Call",
        methods: "Add Call",
        edit: "Edit Call",
        callonce: "Run Method",
        runcase: "Run Case"
    }

    const caseCallColumns = [{
        title: '',
        width: 30,
        render: (_, record, index) => <span>{index + 1}</span>
    }, {
        title: 'Canister',
        dataIndex: 'canister_name',
        ellipsis: true,
        width: 150,
        render: (_, record) => {
            return <Tooltip placement='top' title={record.canister_id}>
                <span>{record.canister_name === undefined ? "<unnamed>" : record.canister_name}</span>
            </Tooltip>
        }
    }, {
        title: 'Query/Update',
        dataIndex: 'function_name',
        width: 200,
        ellipsis: true,
        render: (_, record) => {
            return <Tooltip placement='top' title={record.function_name}>
                <span>{record.function_name}</span>
            </Tooltip>
        }
    }, {
        title: '',
        render: (_, record) => {
            return <><Button type="primary" onClick={() => {
                onCallOneMethod(record);
            }}>Call</Button>
                <Button icon={<EditOutlined />} style={{ marginLeft: 3 }} onClick={() => {
                    setActiveMethod(record);
                    setDrawerStep('edit');
                    setShowBottomDrawer(true);
                }} />
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
            let list = await user.devhubActor.get_test_cases(getUserActiveConfigIndex(user), { tag: { tag: caseid, limit: [1] } }, [false]);
            console.log("case list result ===>", caseid, list);
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
                        med.uuid = uuidv4();
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
            } else {
                message.error(list.UnAuthenticated);
            }
        } catch (err) {
            console.log('fetch case detail error', err);
            message.error('fetch case detail error: ' + err);
        }
        setLoading(false);
    }

    const fetchCaseCallHistory = async () => {
        setHistoryLoading(true);
        try {
            let list = await user.devhubActor.get_test_cases(getUserActiveConfigIndex(user), { tag: { tag: caseid, limit: [10] } }, [true]);
            console.log('history raw list', list);
            let history = [];
            if (list.Authenticated) {
                history = list.Authenticated;

                console.log('fetch case history list ====>', history);
                setCallHistory([...history]);
            } else {
                message.error(list.UnAuthenticated);
            }
        } catch (err) {
            console.log('fetch case history error', err);
            message.error('fetch case history error ' + err);
        }

        setHistoryLoading(false);
    }

    let cloneCase = (caseA) => {
        let tCase = {
            tag: caseA.tag,
            config: JSON.parse(JSON.stringify(caseA.config)),
            canister_calls: []
        };
        caseA.canister_calls.forEach((ele, index) => {
            tCase.canister_calls[index] = Object.assign({}, ele);
            // tCase.canister_calls[index].uuid = uuidv4();
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

    const onCallOneMethod = (record) => {
        console.log('ready to call ====>', record);
        if (!isMethodCallable(record)) {
            message.warn("Please set the parameter value first!");
            return;
        }
        let can = canisterList.find(can => can.canisterId === record.canister_id);
        if (!can) {
            message.warn("Can not find canister(" + record.canister_name + ") in follow list, please check");
            return;
        }
        setActiveCallMethod(record);
        setActiveCanister(can);
        setDrawerStep("callonce");
        setShowBottomDrawer(true);
    }

    const onRunCase = () => {
        for (const [index, entry] of editCase.canister_calls.entries()) {
            let canister = canisterList.find(can => can.canisterId === entry.canister_id);
            if (!canister) {
                message.warn("Can not find canister(" + entry.canister_name + ") in follow list, please check");
                return;
            }
            if (!isMethodCallable(entry)) {
                message.warn("Please set the parameter value first!");
                return;
            }
        }
        setDrawerStep("runcase");
        setShowBottomDrawer(true);
    }

    const prepareCallEvent = (result) => {
        console.log('prepareCallEvent', result);
        return {
            time_at: convertTimestampToBigInt(new Date().getTime()),
            caller: user.identity.getPrincipal(),
            result: str2Utf8Bytes(JSON.stringify(result))
        }
    }

    const prepareCaseView = (testCase, results) => {
        console.log('prepareCaseView ===>', testCase, results);
        testCase.time_at = convertTimestampToBigInt(new Date().getTime());
        testCase.case_run_id = []; // null of opt
        // testCaseView.canister_id = Principal.fromText(testCaseView.canister_id);
        testCase.config.canisterMapping = {};
        testCase.canister_calls.forEach((med, index) => {
            med.canister_id = Principal.fromText(med.canister_id);
            testCase.config.canisterMapping[med.canister_id] = med.canister_name;
            delete med.uuid;
            delete med.canister_name;
            med.method = undefined;
            med.event = []; // null rep of opt type
            med.params = JSON.stringify(med.params, (key, value) => {
                if (typeof value === "bigint") {
                    return value.toString();
                } else {
                    return value;
                }
            });
            if (results) {
                med.event = [prepareCallEvent(results[index])];
            }
        });


        testCase.config = JSON.stringify(testCase.config);
        console.log('ready to save cases', testCase);
    }

    const onUpdateCase = async () => {
        setUpdating(true)
        try {
            let testCaseView = cloneCase(editCase);
            prepareCaseView(testCaseView);
            console.log('ready to save test case', testCaseView);
            let result = await user.devhubActor.cache_test_case(getUserActiveConfigIndex(user), testCaseView);
            if (result.Authenticated || result.Authenticated === 0) {
                // editCase.case_run_id = result.Authenticated;
                let newCaseDetail = cloneCase(editCase);
                setCaseDetail(newCaseDetail);
                setSaveEnable(false);
                setUpdating(false);
                refreshUserConfig();
                return true;
            } else {
                message.error(result.UnAuthenticated);
                setUpdating(false);
                return false;
            }

        } catch (err) {
            setUpdating(false);
            console.log('update case  failed', err);
            message.error('update case  failed:' + err);
            return false;
        }
    }

    const onSaveAndRunCase = async () => {
        let success = await onUpdateCase();
        if (success) {
            onRunCase();
        }
    }

    const onSaveRunResult = async (results) => {
        // console.log('onSaveRunResult  ===>', results);
        let testCaseView = cloneCase(editCase);
        prepareCaseView(testCaseView, results);
        setHistorySaving(true);
        try {
            console.log('ready to save call result', testCaseView);
            let result = await user.devhubActor.cache_test_case(getUserActiveConfigIndex(user), testCaseView);
            console.log('save run result', result);
            if (result.Authenticated || result.Authenticated === 0) {
                message.info('Case Result has been saved.');
                fetchCaseCallHistory();
            } else {
                message.error(result.UnAuthenticated);
            }
        } catch (err) {
            console.log('save case run result failed', err);
            message.error('save case run result failed:' + err);
        }
        setHistorySaving(false);
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
    const onShowBottomDrawer = () => {
        setShowBottomDrawer(true);
        setDrawerStep('canister');
    }
    const onBottomDrawerClosed = () => {
        setShowBottomDrawer(false);
        setActiveCanister(null);
        setDrawerStep(null);
    }

    const onSelectCanister = (canister) => {
        setActiveCanister(canister);
        setDrawerStep("methods");
    }

    const onMethodsAdded = (canister, newMethods) => {
        editCase.canister_calls = [...editCase.canister_calls, ...newMethods];
        console.log('update case ====>', editCase, newMethods);
        setEditCase({ ...editCase });
    }
    const onMethodUpdated = (index, method) => {
        // console.log('ready to update method', method);
        // editCase.canister_calls = editCase.canister_calls.map(med => med === method ? { ...med } : med);
        editCase.canister_calls = [...editCase.canister_calls];
        // console.log('after update', editCase);
        setEditCase({ ...editCase });
        setActiveMethod(null);

    }
    const closeDrawer = () => {
        if (drawerStep === "callonce") {
            setActiveCallMethod(null);
            setActiveCallCanister(null);
        }
        setDrawerStep(null);
        setShowBottomDrawer(false);
    }

    const renderCaseExpandablePart = (record) => {
        // console.log('render case expandable part', record);
        return (<div className='caserow-expandable-container'>
            {/* <div className='caserow-expandable-param-container'> */}
            <MethodSpec method={record} />
            <Card title={<Text mark>Call Spec:</Text>}
            >

                <MethodParamsDisplay method={record} />

                {!record.method && <Text type="danger">{`method ${record.function_name} not found`}</Text>}
            </Card>
            {/* </div> */}
            {/* <div className='caserow-expandable-footer-container'>
                
            </div> */}
        </div>);
    }



    useEffect(() => {
        fetchCaseDetail();
        fetchCaseCallHistory();
    }, [caseid])

    useEffect(() => {
        if (caseDetail && editCase) {
            if (caseIsEqual(editCase, caseDetail)) {
                setSaveEnable(false);
            } else {
                setSaveEnable(true);
            }
        }
    }, [editCase])

    return <>
        {!editCase && loading && <Spin size="large" />}
        {editCase &&
            <>
                <PageHeader
                    title={<>
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
                    </>}
                    extra={[<Button type="primary" disabled={!saveEnable || editTitle} loading={updating || loading}
                        onClick={() => {
                            onUpdateCase();
                        }}
                    >Save</Button>,
                    <Button style={{ marginLeft: 5 }} >Copy</Button>]} >

                </PageHeader>
                <Layout style={{ overflow: 'auto' }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card title="Call List" extra={
                                <Row gutter={8}>
                                    <Col span={12}>
                                        <Button type="primary" onClick={onShowBottomDrawer} disabled={editTitle || updating}>Add Call</Button>
                                    </Col>
                                    <Col span={12}>
                                        <Button style={{ marginLeft: 10 }} type="primary" disabled={editTitle || updating} loading={historyLoading}
                                            onClick={() => {
                                                if (saveEnable) {
                                                    onSaveAndRunCase();
                                                } else {
                                                    onRunCase();
                                                }
                                            }}
                                        >{saveEnable ? "Save & Call All" : "Call All"}</Button>
                                    </Col>
                                </Row>
                            }>
                                <Table columns={caseCallColumns} rowKey="uuid" dataSource={editCase.canister_calls}
                                    pagination={false}
                                    expandable={{
                                        expandedRowRender: renderCaseExpandablePart,
                                        defaultExpandAllRows: true,
                                        rowExpandable: record => true,
                                    }}
                                // summary={() => <Table.Summary fixed>
                                //     <Table.Summary.Row>
                                //         <Table.Summary.Cell index={0} colSpan={2}>
                                //             <Button type="primary" onClick={onShowBottomDrawer} disabled={editTitle || updating}>Add Call</Button>
                                //         </Table.Summary.Cell>
                                //         {editCase.canister_calls.length > 0 &&
                                //             <Table.Summary.Cell index={1} colSpan={2}>
                                //                 <Button style={{ marginLeft: 10 }} type="primary" disabled={editTitle || updating} loading={historyLoading}
                                //                     onClick={() => {
                                //                         if (saveEnable) {
                                //                             onSaveAndRunCase();
                                //                         } else {
                                //                             onRunCase();
                                //                         }
                                //                     }}
                                //                 >{saveEnable ? "Save & Call All" : "Call All"}</Button>
                                //             </Table.Summary.Cell>}
                                //     </Table.Summary.Row>
                                // </Table.Summary>}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card title="Call History" extra={<Button type="primary">All Logs</Button>}>
                                {(historySaving || historyLoading || updating) && <Spin />}
                                {callHistory.length === 0 && <Empty />}
                                {callHistory.length > 0 &&
                                    <Collapse defaultActiveKey={callHistory[0].case_run_id} onChange={() => {

                                    }}>
                                        {callHistory.map((history, index) => <Panel header={<><Text mark>{`Run ${history.case_run_id[0] + 1}: `}</Text>
                                            <Text>{`${new Date(convertBignumberToDate(history.time_at)).toUTCString()}`}</Text></>}
                                            key={history.case_run_id}
                                        >
                                            <RunMethodHistoryEntry testCase={history} />
                                        </Panel>)}
                                    </Collapse>
                                }
                            </Card>
                        </Col>
                    </Row>
                    {showBottomDrawer &&
                        <Drawer title={drawerTitle[drawerStep]} placement="bottom"
                            height={"95%"}
                            visible={showBottomDrawer}
                            closable={drawerStep === 'canister'}
                            maskClosable={drawerStep === 'canister'}
                            destroyOnClose={true}
                            // contentWrapperStyle={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClose={onBottomDrawerClosed}
                            getContainer={false}
                            style={{ position: 'absolute' }}
                        >
                            <div className='bottom-drawer-content-container'>
                                <div className='bottom-drawer-inner-content-container'>
                                    {drawerStep === "canister" &&
                                        <SelectCanister onSelectCanister={onSelectCanister} canisterList={canisterList} closeDrawer={closeDrawer} />}
                                    {drawerStep === "methods" && <ProvideCasesValue>
                                        <AddMethod canister={activeCanister}
                                            onMethodsAdded={onMethodsAdded}
                                            closeDrawer={closeDrawer} /></ProvideCasesValue>}
                                    {drawerStep === "edit" && <ProvideCasesValue>
                                        <EditMethod method={activeMethod}
                                            onMethodUpdated={onMethodUpdated}
                                            closeDrawer={closeDrawer}
                                        /></ProvideCasesValue>}
                                    {drawerStep === 'callonce' && <CallOncePanel
                                        method={activeCallMethod}
                                        index={0}
                                        closeDrawer={closeDrawer}
                                        canisterActor={activeCanister.actor}
                                    />}
                                    {drawerStep === 'runcase' && <RunCasePanel testCase={editCase}
                                        canisterList={canisterList}
                                        onSaveRunResult={onSaveRunResult}
                                        closeDrawer={closeDrawer} />}
                                </div>
                            </div>
                        </Drawer>
                    }
                </Layout>
            </>
        }
    </>
}

export default AdminCase;