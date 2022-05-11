<script>
    import { onMount } from "svelte";
    // import { uuid } from "uuidv4";
    import { Principal } from "@dfinity/principal";
    import { Actor } from "@dfinity/agent";
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
    import List, { Item, Meta, Separator, Text } from "@smui/list";
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
    let newCaseDlgOpen = false;
    let loadingActor = false;

    onMount(async () => {
        // if (uiConfig.caseSuites) {
        //     caseSuites = [...uiConfig.caseSuites];
        // }
        // if (canisterCfgList && canisterCfgList.length > 0) {
        // }
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
            canisterActorMapper[canisterId] = actor;
            loadingActor = false;
        }
        return canisterActorMapper[canisterId];
    }

    async function handleNewCaseSuite(event) {
        // event.preventDefault();
        let newSuite = {
            isDirty: true,
            suite_id: "casesuite-" + new Date().getTime(),
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
        newCaseDlgOpen = false;
        loadingActor = false;
        activeSuite = null;
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
                                variant="outlined"
                                on:click={() => {
                                    activeSuite.cases = [
                                        ...activeSuite.cases,
                                        ...selectedCanisterMethods,
                                    ];
                                    resetCaseSelectStatus();
                                    onUpdateUIConfig(uiConfig);
                                }}
                            >
                                <Label>Add To Suite</Label>
                            </Button>
                        {/if}
                        <Button
                            variant="raised"
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
                                        <Text>{method[0]}</Text>
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
                <Paper color="secondary">
                    <Content>
                        <LayoutGrid>
                            <GCell span={6}>
                                <Paper color="primary" variant="outlined">
                                    <Title>Case Suites</Title>
                                    <Content>
                                        <Accordion>
                                            {#each caseSuites as suite (suite.suite_id)}
                                                <Panel
                                                    square
                                                    variant="outlined"
                                                    color="primary"
                                                    extend
                                                >
                                                    <Header>
                                                        {suite.suite_name}
                                                        <IconButton
                                                            slot="icon"
                                                            toggle
                                                        >
                                                            <Icon
                                                                class="material-icons"
                                                                on
                                                                >unfold_less</Icon
                                                            >
                                                            <Icon
                                                                class="material-icons"
                                                                >unfold_more</Icon
                                                            >
                                                        </IconButton>
                                                    </Header>
                                                    <AContent>
                                                        <div>
                                                            <Button
                                                                variant="outlined"
                                                                on:click={() => {
                                                                    activeSuite =
                                                                        suite;

                                                                    newCaseDlgOpen = true;
                                                                }}
                                                            >
                                                                <Icon
                                                                    class="material-icons"
                                                                    >add</Icon
                                                                >
                                                                <Label
                                                                    >Add A New
                                                                    Case To
                                                                    Suite</Label
                                                                >
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                            >
                                                                <Icon
                                                                    class="material-icons"
                                                                    >start</Icon
                                                                >
                                                                <Label
                                                                    >Run Suite</Label
                                                                >
                                                            </Button>
                                                        </div>

                                                        <DataTable
                                                            style="width: 100%;"
                                                        >
                                                            <Head>
                                                                <Row>
                                                                    <TCell
                                                                        numeric
                                                                        >Seq.</TCell
                                                                    >
                                                                    <TCell
                                                                        >Canister</TCell
                                                                    >
                                                                </Row>
                                                            </Head>
                                                        </DataTable>
                                                    </AContent>
                                                </Panel>
                                            {/each}
                                        </Accordion>
                                    </Content>
                                </Paper>
                            </GCell>

                            <GCell span={6}>
                                <Paper color="primary" variant="outlined">
                                    <Title>Run History</Title>
                                    <Content />
                                </Paper>
                            </GCell>
                        </LayoutGrid>
                    </Content>
                </Paper>
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
</style>
