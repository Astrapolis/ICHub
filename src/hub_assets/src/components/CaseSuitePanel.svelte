<script>
    import { onMount, tick } from "svelte";
    import { createEventDispatcher } from "svelte";
    // import { uuid } from "uuidv4";
    import { Principal } from "@dfinity/principal";
    import { Actor } from "@dfinity/agent";
    import { IDL } from "@dfinity/candid";
    import Paper, { Title, Content } from "@smui/paper";
    import Button from "@smui/button";
    import Dialog, {
        Header as DHeader,
        Title as DTitle,
        Content as DContent,
        Actions,
    } from "@smui/dialog";
    import Select, { Option } from "@smui/select";
    import Textfield from "@smui/textfield";
    import LayoutGrid, { Cell as GCell } from "@smui/layout-grid";
    import Accordion, {
        Panel,
        Header,
        Content as AContent,
    } from "@smui-extra/accordion";
    import List, {
        Item,
        Meta,
        Separator,
        Text,
        PrimaryText,
        SecondaryText,
    } from "@smui/list";
    import Checkbox from "@smui/checkbox";
    import DataTable, {
        Head,
        Body,
        Row,
        Cell as TCell,
    } from "@smui/data-table";
    import Fab from "@smui/fab";
    import { Icon, Label } from "@smui/common";
    import IconButton from "@smui/icon-button";

    import { getActorFromCanisterId } from "../utils/actorUtils";
    import { getCanisterUIConfigFieldValue } from "../utils/devhubUtils";
    import LoadingPanel from "./LoadingPanel.svelte";
    import PaperTitle from "./PaperTitle.svelte";
    import NoDataPanel from "./NoDataPanel.svelte";
    import MethodParamRender from "./MethodParamRender.svelte";
    import * as CONSTANT from "../constant";
    import { getParserMap } from "../utils/paramRenderUtils";
    import { getHashCodeFromString, getUUID } from "../utils/stringUtils";

    export let devhubActor = null;
    export let identity = null;
    export let canisterCfgList = [];
    export let uiConfig = null;
    export let agent = null;
    export let onUpdateUIConfig = null;

    let canisterActorMapper = {};
    $: caseSuites = !!uiConfig.caseSuites ? uiConfig.caseSuites : [];
    let newSuiteOpen = false;
    let newSuiteName = null;
    let activeSuite = null;
    let selectedCanisterId = null;
    let selectedCanisterActor = null;
    let selectedCanisterMethodList = null;
    let selectedCanisterMethods = [];
    let loadingActor = false;
    let caseAdding = false;
    let activeCase = null;
    let caseConfigOpen = false;
    let bufferedCaseMethodParams = {};
    let caseParamValueSaving = false;
    const CASEMETHOD_STAUTS_MAP = ["NA", "Not Ready", "Ready"];
    let runningSuite = null;
    let suiteRunning = false;
    let suiteRunningDlgOpen = false;
    /**
     * runningStatus : {
     *  status: <int>, 0: waiting, 1: running, 2: finished
     *  result: <any>
     * }
     */
    let runningCasesStatus = [];
    let caseRunPreparing = false;

    onMount(async () => {
        console.log("CaseSuitePanel on mount");
    });

    async function onCaseSuiteCanisterSelected() {
        console.log("onCaseSuiteCanisterSelected ==>", selectedCanisterId);
        if (!!selectedCanisterId) {
            try {
                selectedCanisterActor = await getCanisterActor(
                    selectedCanisterId
                );
                selectedCanisterMethodList = Actor.interfaceOf(
                    selectedCanisterActor
                )._fields.sort(([a], [b]) => (a > b ? 1 : -1));
                console.log(
                    "selected canister method list ====>",
                    selectedCanisterMethodList
                );
            } catch (err) {
                console.log("get canister actor error", err);
            }
        }
    }

    async function getCanisterActor(canisterId) {
        if (!canisterActorMapper[canisterId]) {
            loadingActor = true;
            let cid = canisterId;
            if (typeof cid === "string") {
                cid = Principal.fromText(cid);
            }
            let actor = await getActorFromCanisterId(cid, agent);
            // console.log("actor ====>", Actor.interfaceOf(actor));
            canisterActorMapper[canisterId] = actor;
            loadingActor = false;
        }
        return canisterActorMapper[canisterId];
    }

    async function handleNewCaseSuite(event) {
        // event.preventDefault();
        let newSuite = {
            // isDirty: true,
            suite_id: "casesuite-" + getUUID(),
            suite_name: newSuiteName,
            cases: [],
        };
        // caseSuites = [...caseSuites, newSuite];
        uiConfig.caseSuites = [...caseSuites, newSuite];
        newSuiteOpen = false;
        onUpdateUIConfig(uiConfig);
    }

    function resetCaseSelectStatus() {
        selectedCanisterId = null;
        selectedCanisterActor = null;
        selectedCanisterMethods = null;
        loadingActor = false;
        activeSuite = null;
    }

    function constructTestCase(canisterId, method) {
        let readyToRun = method[1].argTypes.length === 0 ? -1 : 0; // -1 :NA, 0: Not Ready, 1: Ready to Run
        let params = [];
        let paramsSpec = [];
        let paramValueParsers = [];
        method[1].argTypes.forEach((argType) => {
            paramsSpec.push(argType.display());
        });
        return {
            case_id: "case-" + getUUID(),
            canisterId,
            methodName: method[0],
            methodSpec: method[1].display(),
            paramsSpec,
            params, // parameter value stored to run this case.
            paramValueParsers, // parser that use to parse the parameter value
            readyToRun,
        };
    }

    async function saveUIConfiguration(newUIConfig) {
        caseAdding = true;
        await onUpdateUIConfig(newUIConfig);
        caseAdding = false;
    }

    async function onCaseMethodParamValueSet(event) {
        event.preventDefault();
        console.log("buffered value ===>", bufferedCaseMethodParams);
        activeCase.paramsSpec.forEach((spec, index) => {
            activeCase.params[index] = bufferedCaseMethodParams[index].value;
            activeCase.paramValueParsers[index] =
                bufferedCaseMethodParams[index].parserType;
        });
        activeCase.readyToRun = 1;
        caseParamValueSaving = true;
        await onUpdateUIConfig(uiConfig);
        caseParamValueSaving = false;
        await tick();
        activeCase = null;
        caseConfigOpen = false;
    }

    function onParameterValueChanged(event) {
        bufferedCaseMethodParams[event.detail.paramIndex] = {
            value: event.detail.inputValue,
            parserType: event.detail.parserType,
        };
    }

    function getRunSuiteDisableStatus(suite) {
        if (suite.cases.length === 0) {
            return true;
        }
        return !suite.cases.every(
            (testCase) => !!Math.abs(testCase.readyToRun)
        );
    }

    async function prepareCaseCallData() {
        caseRunPreparing = true;
        runningCasesStatus = [];
        let parserMap = getParserMap();
        runningSuite.cases.forEach(async (testCase, index) => {
            let actor = await getCanisterActor(testCase.canisterId);
            let field = Actor.interfaceOf(actor)._fields.find((f) => {
                return f[0] === testCase.methodName;
            });
            let paramValues = [];
            testCase.params.forEach((param, index) => {
                paramValues[index] = field[1].argTypes[index].accept(
                    parserMap[testCase.paramValueParsers[index]](), param
                );
            });
            runningCasesStatus[index] = {
                case_id: testCase.case_id,
                methodSpec: testCase.methodSpec,
                callSpec:
                    testCase.methodName +
                    IDL.FuncClass.argsToString(field[1].argTypes, paramValues),
                actor,
                paramValues,
                status: 0,
                result: null,
            };
        });

        console.log('running cases ====>', runningCasesStatus);

        caseRunPreparing = false;
    }
</script>

<div>
    <Dialog bind:open={newSuiteOpen} scrimClickAction="" escapeKeyAction="">
        <DHeader>
            <DTitle>New CaseSuite</DTitle>
        </DHeader>
        <DContent>
            <form
                on:submit|preventDefault={handleNewCaseSuite}
                style="margin: 10px"
            >
                <Textfield
                    variant="outlined"
                    bind:value={newSuiteName}
                    label="Input a name for the new suite"
                    required
                />
                <Button variant="raised" type="submit">
                    <Label>Commit</Label>
                </Button>
            </form>
        </DContent>
        <Actions>
            <Button variant="raised">
                <Label>Cancel</Label>
            </Button>
        </Actions>
    </Dialog>

    <Dialog bind:open={caseConfigOpen} fullscreen>
        <DHeader>
            <DTitle>Configure Case Parameters</DTitle>
        </DHeader>
        <DContent>
            {#if !!activeCase}
                <Paper color="secondary" variant="raised">
                    <Title>
                        <div class="case-config-title-container">
                            <div>
                                <span class="case-method-name"
                                    >{activeCase.methodName + ":"}</span
                                >
                            </div>
                            <div>
                                <span class="case-method-spec"
                                    >{activeCase.methodSpec}</span
                                >
                            </div>
                        </div>
                    </Title>
                    <Content>
                        <form
                            on:submit={onCaseMethodParamValueSet}
                            style="margin: 10px"
                        >
                            {#each activeCase.paramsSpec as param, index (activeCase.case_id + "-" + index)}
                                <MethodParamRender
                                    methodName={activeCase.methodName}
                                    paramIndex={index}
                                    canisterId={activeCase.canisterId}
                                    {agent}
                                    savedValue={activeCase.params[index]}
                                    on:paramValueSet={onParameterValueChanged}
                                />
                            {/each}
                            {#if !caseParamValueSaving}
                                <Button variant="raised" type="submit">
                                    <Label>Save</Label>
                                </Button>
                            {:else}
                                <LoadingPanel description="saving ..." />
                            {/if}
                        </form>
                    </Content>
                </Paper>
            {/if}
        </DContent>
        <Actions>
            <Button
                variant="raised"
                on:click={() => {
                    activeCase = null;
                }}
            >
                <Label>Cancel</Label>
            </Button>
        </Actions>
    </Dialog>
    <Dialog bind:open={suiteRunningDlgOpen} fullscreen>
        <DHeader>
            <DTitle>Test Suite Running Panel</DTitle>
        </DHeader>
        <DContent>
            {#if !!runningSuite}
                <Paper>
                    <Content>
                        {#if suiteRunning}
                            <LoadingPanel
                                description="Test Suite is running, please wait..."
                            />
                        {:else}
                            <Button variant="raised">
                                <Icon class="material-icons">save</Icon>
                                <Label>Save</Label>
                            </Button>
                            <Button variant="raised" color="secondary">
                                <Icon class="material-icons">delete</Icon>
                                <Label>Discard</Label>
                            </Button>
                        {/if}
                    </Content>
                </Paper>
                <Paper>
                    <Content>
                        {#if caseRunPreparing}
                            <LoadingPanel description="preparing ..." />
                        {:else if runningCasesStatus.length > 0}
                            <List>
                                {#each runningCasesStatus as testCase, index (testCase.case_id)}
                                    <Item>
                                        <Text>
                                            <PrimaryText
                                                >{testCase.methodSpec}</PrimaryText
                                            >

                                            <SecondaryText
                                                >{`Run:${testCase.callSpec}`}</SecondaryText
                                            >
                                        </Text>
                                        {#if testCase.status === 0}
                                            <Meta class="material-icons">
                                                pending
                                            </Meta>
                                        {:else if testCase.status === 1}
                                            <Meta
                                                ><LoadingPanel
                                                    description="running"
                                                /></Meta
                                            >
                                        {:else}
                                            <Meta class="material-icons">
                                                done
                                            </Meta>
                                        {/if}
                                    </Item>
                                {/each}
                            </List>
                        {/if}
                    </Content>
                </Paper>
            {/if}
        </DContent>
    </Dialog>

    {#if !!activeSuite}
        <Paper color="primary" variant="outlined">
            <Title style="position:relative;">
                <div class="case-select-title-container">
                    <div>
                        <Fab extended>
                            <Label
                                >New Cases For Suite <em
                                    >{activeSuite.suite_name}</em
                                ></Label
                            >
                        </Fab>
                    </div>
                    <div>
                        <Select
                            variant="filled"
                            bind:value={selectedCanisterId}
                            on:SMUISelect:change={async () => {
                                await onCaseSuiteCanisterSelected();
                            }}
                            label="Select A Canister"
                            disabled={selectedCanisterMethods &&
                                selectedCanisterMethods.length > 0}
                        >
                            {#each canisterCfgList as canisterCfg}
                                <Option value={canisterCfg.canister_id.toText()}
                                    >{getCanisterUIConfigFieldValue(
                                        canisterCfg,
                                        "tag"
                                    ) +
                                        "-" +
                                        canisterCfg.canister_id.toText()}</Option
                                >
                            {/each}
                            <svelte:fragment slot="helperText"
                                >Canister Methods will be listed below.</svelte:fragment
                            >
                        </Select>
                    </div>
                    <div>
                        {#if selectedCanisterMethods && selectedCanisterMethods.length > 0}
                            <Button
                                variant="raised"
                                disabled={caseAdding}
                                on:click={async () => {
                                    let newCases = [];
                                    selectedCanisterMethods.forEach((m) =>
                                        newCases.push(
                                            constructTestCase(
                                                selectedCanisterId,
                                                m
                                            )
                                        )
                                    );
                                    activeSuite.cases = [
                                        ...activeSuite.cases,
                                        ...newCases,
                                    ];

                                    await saveUIConfiguration(uiConfig);
                                    resetCaseSelectStatus();
                                }}
                            >
                                {#if caseAdding}
                                    <LoadingPanel description="saving ..." />
                                {:else}
                                    <Label>Add To Suite</Label>
                                {/if}
                            </Button>
                        {/if}
                        <Button
                            variant="raised"
                            color="secondary"
                            on:click={() => {
                                resetCaseSelectStatus();
                            }}
                        >
                            <Label>Cancel</Label>
                        </Button>
                    </div>
                </div>
            </Title>
            <Content>
                {#if loadingActor}
                    <div>
                        <LoadingPanel
                            description="Loading canister actor idl..."
                        />
                    </div>
                {/if}
                {#if selectedCanisterActor}
                    <!-- <div>Select methods and add them to your case suite.</div> -->
                    <Paper color="secondary">
                        <Content>
                            <List checkList>
                                {#each selectedCanisterMethodList as method}
                                    <Item>
                                        <Text
                                            ><span class="case-method-name"
                                                >{method[0] + ":"}</span
                                            ><span class="case-method-spec"
                                                >{method[1].display()}</span
                                            ></Text
                                        >
                                        <Meta>
                                            <Checkbox
                                                bind:group={selectedCanisterMethods}
                                                value={method}
                                            />
                                        </Meta>
                                    </Item>
                                    <Separator />
                                {/each}
                            </List>
                        </Content>
                    </Paper>
                {/if}
                <Paper color="secondary">
                    <Content>
                        {#if activeSuite.cases && activeSuite.cases.length > 0}
                            <List>
                                {#each activeSuite.cases as testCase}
                                    <Item>
                                        <span class="case-method-name"
                                            >{testCase.methodName}</span
                                        >
                                        <span class="case-method-spec"
                                            >{testCase.methodSpec}</span
                                        >
                                    </Item>
                                {/each}
                            </List>
                        {:else}
                            <NoDataPanel description="No Method Selected" />
                        {/if}
                    </Content>
                </Paper>
            </Content>
        </Paper>
    {:else}
        <Paper color="primary" variant="outlined">
            <Title>
                <PaperTitle title="My CaseSuites" />
                <Button
                    variant="raised"
                    on:click={() => {
                        newSuiteOpen = true;
                        newSuiteName = null;
                        console.log("new suite open");
                    }}
                >
                    <Icon class="material-icons">add</Icon><Label
                        >Create A New Suite</Label
                    >
                </Button>
            </Title>
            <Content>
                <!-- <Paper color="secondary">
                    <Content> -->
                <!-- <LayoutGrid>
                    <GCell span={6}>
                        <Paper color="secondary">
                            <Title>Case Suites</Title>
                            <Content> -->
                <Accordion>
                    {#each caseSuites as suite (suite.suite_id)}
                        <Panel square variant="raised" extend>
                            <Header>
                                {suite.suite_name}
                                <IconButton slot="icon" toggle>
                                    <Icon class="material-icons" on
                                        >unfold_less</Icon
                                    >
                                    <Icon class="material-icons"
                                        >unfold_more</Icon
                                    >
                                </IconButton>
                            </Header>
                            <AContent>
                                <div class="suite-top-toolbar-container">
                                    <div>
                                        <Button
                                            variant="raised"
                                            on:click={() => {
                                                activeSuite = suite;
                                            }}
                                        >
                                            <Icon class="material-icons"
                                                >add</Icon
                                            >
                                            <Label>Add Case</Label>
                                        </Button>
                                    </div>
                                    <div>
                                        <Button
                                            variant="raised"
                                            disabled={getRunSuiteDisableStatus(
                                                suite
                                            )}
                                            on:click={ async () => {
                                                runningSuite = suite;
                                                suiteRunningDlgOpen = true;
                                                runningCasesStatus = [];
                                                await prepareCaseCallData();
                                            }}
                                        >
                                            <Icon class="material-icons"
                                                >start</Icon
                                            >
                                            <Label>Run Suite</Label>
                                        </Button>
                                        <Button variant="raised">
                                            <Icon class="material-icons"
                                                >history</Icon
                                            >
                                            <Label>View History</Label>
                                        </Button>
                                    </div>
                                </div>

                                <DataTable style="width: 100%;">
                                    <Head>
                                        <Row>
                                            <TCell numeric>Seq.</TCell>
                                            <TCell>Canister</TCell>
                                            <TCell>Method</TCell>
                                            <TCell>Status</TCell>
                                            <TCell>Actions</TCell>
                                        </Row>
                                    </Head>
                                    <Body>
                                        {#if suite.cases && suite.cases.lenght === 0}
                                            <NoDataPanel
                                                description="No Cases Yet"
                                            />
                                        {:else}
                                            {#each suite.cases as testCase, index (suite.suite_id + testCase.case_id)}
                                                <Row>
                                                    <TCell>{index}</TCell>
                                                    <TCell
                                                        >{testCase.canisterId}</TCell
                                                    >
                                                    <TCell
                                                        ><span
                                                            class="case-method-name"
                                                            >{testCase.methodName +
                                                                ":"}</span
                                                        ><span
                                                            class="case-method-spec"
                                                            >{testCase.methodSpec}</span
                                                        ></TCell
                                                    >
                                                    <TCell
                                                        >{CASEMETHOD_STAUTS_MAP[
                                                            testCase.readyToRun +
                                                                1
                                                        ]}</TCell
                                                    >
                                                    <TCell>
                                                        {#if testCase.readyToRun !== -1}
                                                            <IconButton
                                                                class="material-icons"
                                                                on:click={() => {
                                                                    activeCase =
                                                                        testCase;
                                                                    caseConfigOpen = true;
                                                                    bufferedCaseMethodParams =
                                                                        {};
                                                                }}
                                                            >
                                                                settings
                                                            </IconButton>
                                                        {/if}
                                                        {#if index > 0}
                                                            <IconButton
                                                                class="material-icons"
                                                            >
                                                                arrow_upward
                                                            </IconButton>
                                                        {/if}
                                                    </TCell>
                                                </Row>
                                            {/each}
                                        {/if}
                                    </Body>
                                </DataTable>
                            </AContent>
                        </Panel>
                    {/each}
                </Accordion>
                <!-- </Content>
                        </Paper>
                    </GCell>

                    <GCell span={6}>
                        <Paper color="secondary" >
                            <Title>Run History</Title>
                            <Content />
                        </Paper>
                    </GCell>
                </LayoutGrid> -->
                <!-- </Content>
                </Paper> -->
            </Content>
        </Paper>
    {/if}
</div>

<style>
    .case-select-title-container {
        widows: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
    .case-config-title-container {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .case-method-name {
        font-weight: bold;
        color: var(--mdc-theme-primary);
    }

    .case-method-spec {
        font-style: italic;
    }

    .suite-top-toolbar-container {
        width : 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
</style>
