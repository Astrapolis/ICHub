<script>
    import { onMount } from "svelte";
    import { Principal } from "@dfinity/principal";
    import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
    import LinearProgress from "@smui/linear-progress";
    import IconButton from "@smui/icon-button";
    import Button, { Label } from "@smui/button";
    import Paper, { Title, Content } from "@smui/paper";
    import { getCanisterUIConfigFieldValue } from "../utils/devhubUtils";
    import PaperTitle from "./PaperTitle.svelte";

    export let canisterCfgList = [];
    export let devhubActor = null;

    // let listLoaded = false;
</script>

<Paper color="primary" variant="outlined">
    <Title>
        <PaperTitle title="My Followed List" />
    </Title>
    <Content>
        <!-- <Paper color="secondary">
            <Content> -->
        <DataTable table$aria-label="Canister list" style="width: 100%;">
            <Head>
                <Row>
                    <!-- <Cell></Cell> -->
                    <Cell numeric>Seq.</Cell>
                    <Cell style="width: 100%;">Canister</Cell>
                    <Cell>Tag</Cell>
                    <Cell>Candid</Cell>
                    <Cell>Actions</Cell>
                </Row>
            </Head>
            <Body>
                {#each canisterCfgList as canisterCfg, index (canisterCfg.canister_id)}
                    <Row>
                        <Cell>{index}</Cell>
                        <Cell>{canisterCfg.canister_id.toText()}</Cell>
                        <Cell
                            >{getCanisterUIConfigFieldValue(
                                canisterCfg,
                                "tag"
                            )}</Cell
                        >
                        <Cell
                            ><IconButton
                                class="material-icons"
                                on:click={() => {
                                    console.log(
                                        "download did file for canisterCfg",
                                        canisterCfg
                                    );
                                }}>download</IconButton
                            ></Cell
                        >
                        <Cell>
                            <div>
                                <IconButton
                                    class="material-icons"
                                    on:click={() => {
                                        console.log("unfollow", canisterCfg);
                                    }}>bookmark_remove</IconButton
                                >
                            </div>
                        </Cell>
                    </Row>
                {/each}
            </Body>

            <!-- <LinearProgress
                indeterminate
                bind:closed={listLoading}
                aria-label="Data is being loaded..."
                slot="progress"
            /> -->
        </DataTable>
        <!-- </Content>
        </Paper> -->
    </Content>
</Paper>
