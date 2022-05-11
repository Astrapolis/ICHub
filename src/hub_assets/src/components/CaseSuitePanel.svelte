<script>
    import { onMount } from "svelte";
    // import { uuid } from "uuidv4";
    import { Principal } from "@dfinity/principal";
    import { Actor } from "@dfinity/agent";
    import Paper, { Title, Content } from "@smui/paper";
    import Button, { Label, Icon } from "@smui/button";
    import Dialog, {
        Header as DHeader,
        Title as DTitle,
        Content as DContent,
        Actions,
    } from "@smui/dialog";
    import Select, { Option } from "@smui/select";
    import Textfield from "@smui/textfield";
    import LayoutGrid, { Cell } from "@smui/layout-grid";
    import Accordion, {
        Panel,
        Header,
        Content as AContent,
    } from "@smui-extra/accordion";
    import List, { Item, Meta, Label as LLabel } from "@smui/list";
    import Checkbox from "@smui/checkbox";

    import { getActorFromCanisterId } from "../utils/actorUtils";
    import { getCanisterUIConfigFieldValue } from "../utils/devhubUtils";
    import LoadingPanel from "./LoadingPanel.svelte";

    export let devhubActor = null;
    export let identity = null;
    export let canisterCfgList = [];
    export let uiConfig = null;
    export let agent = null;
    let canisterActorMapper = {};
    let caseSuites = [];
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
        if (uiConfig.caseSuites) {
            caseSuites = [...uiConfig.caseSuites];
        }
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
            if (typeof(cid) === "string") {
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
        caseSuites = [...caseSuites, newSuite];
        newSuiteOpen = false;
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
        <Dialog
            bind:open={newCaseDlgOpen}
            fullscreen
            scrimClickAction=""
            escapeKeyAction=""
        >
            <DHeader>
                <DTitle>New Case For {activeSuite.suite_name}</DTitle>
            </DHeader>
            <DContent>
                <Paper>
                    <Title>
                        <Select
                            bind:value={selectedCanisterId}
                            on:SMUISelect:change={async () => {
                                console.log('canister id changed ====>');
                                await onCaseSuiteCanisterSelected();
                            }}
                            label="Select A Canister"
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
                            <List checkList>
                                {#each selectedCanisterMethodList as method}
                                    <Item>
                                        <LLabel>{method[0]}</LLabel>
                                        <Meta>
                                            <Checkbox
                                                bind:group={selectedCanisterMethods}
                                                value={method}
                                            />
                                        </Meta>
                                    </Item>
                                {/each}
                            </List>
                        {/if}
                    </Content>
                </Paper></DContent
            >
            <Actions>
                <Button
                    variant="raised"
                    on:click={() => {
                        selectedCanisterId = null;
                        selectedCanisterActor = null;
                        selectedCanisterMethods = null;
                        newCaseDlgOpen = false;
                        loadingActor = false;
                        activeSuite = null;
                    }}
                >
                    <Label>Cancel</Label>
                </Button>
            </Actions>
        </Dialog>
    {/if}
    <Paper>
        <Title
            ><span>My CaseSuites</span>
            <Button
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
            <LayoutGrid>
                <Cell span={6}>
                    <Accordion>
                        {#each caseSuites as suite (suite.suite_id)}
                            <Panel>
                                <Header>
                                    {suite.suite_name}
                                </Header>
                                <AContent>
                                    <div>
                                        <Button
                                            on:click={() => {
                                                activeSuite = suite;
                                                newCaseDlgOpen = true;
                                            }}
                                        >
                                            <Icon class="material-icons"
                                                >add</Icon
                                            >
                                            <Label
                                                >Add A New Case To Suite</Label
                                            >
                                        </Button>
                                        <Button>
                                            <Icon class="material-icons"
                                                >start</Icon
                                            >
                                            <Label>Run Suite</Label>
                                        </Button>
                                    </div>
                                </AContent>
                            </Panel>
                        {/each}
                    </Accordion>
                </Cell>
                <Cell span={6}>
                    <div>run history list</div>
                </Cell>
            </LayoutGrid>
        </Content>
    </Paper>
</div>
