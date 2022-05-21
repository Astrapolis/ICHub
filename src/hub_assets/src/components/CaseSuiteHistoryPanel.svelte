<script>
    import { onMount, tick } from "svelte";
    import Paper, { Title, Content } from "@smui/paper";
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

    import LoadingPanel from "./LoadingPanel.svelte";
    import IconButton from "@smui/icon-button";
    import { Icon, Label } from "@smui/common";

    import { utf8Bytes2Str } from "../utils/stringUtils";
    import { convertBignumberToDate } from "../utils/devhubUtils";

    export let activeSuiteId = null;
    export let activeConfigIndex = null;
    export let devhubActor = null;
    // export let identity = null;

    const DEFAULT_CALL_HISTORY_LIMIT = 100;

    onMount(async () => {});

    async function getSuiteCallHistory() {
        let result = await devhubActor.get_test_cases(
            activeConfigIndex,
            [activeSuiteId],
            [DEFAULT_CALL_HISTORY_LIMIT]
        );

        console.log("history result", result);
        return result;
    }

    function convertResult(result) {
        return utf8Bytes2Str(result);
    }
</script>

<Paper>
    <Content>
        {#await getSuiteCallHistory()}
            <LoadingPanel description="Loading call history..." />
        {:then suiteCallHistory}
            {#if suiteCallHistory.Authenticated}
                <Accordion>
                    {#each suiteCallHistory.Authenticated as historyRaw}
                        <!-- {@const history = parseHistoryEntry(historyRaw)} -->
                        <Panel square variant="raised" extend>
                            <Header>
                                {`Run at: ${convertBignumberToDate(
                                    historyRaw.time_at
                                ).toLocaleString()}`}
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
                                <List threeLine nonInteractive>
                                    {#each historyRaw.canister_calls as testCase, index (testCase.canister_id + "-" + testCase.function_name)}
                                        <Item>
                                            <Text>
                                                <PrimaryText
                                                    >{testCase.canister_id +
                                                        ":" +
                                                        testCase.function_name}</PrimaryText
                                                >

                                                <SecondaryText
                                                    >{`Run:${testCase.event[0].params}`}</SecondaryText
                                                >
                                                <SecondaryText>
                                                    {`Result:${convertResult(
                                                        testCase.event[0].result
                                                    )}`}
                                                </SecondaryText>
                                            </Text>
                                        </Item>
                                    {/each}
                                </List>
                            </AContent>
                        </Panel>
                    {/each}
                </Accordion>
            {:else}
                <span>{suiteCallHistory.UnAuthenticated}</span>
            {/if}
        {/await}
    </Content>
</Paper>
