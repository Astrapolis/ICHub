<script>
    import { onMount } from "svelte";
    import { Navigate, navigateTo } from "svelte-router-spa";
    import { Principal } from "@dfinity/principal";
    import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
    import LinearProgress from "@smui/linear-progress";
    import IconButton from "@smui/icon-button";
    import Button from "@smui/button";
    import { Icon, Label } from "@smui/common";
    import Paper, { Title, Content } from "@smui/paper";
    import { getCanisterUIConfigFieldValue } from "../utils/devhubUtils";
    import PaperTitle from "./PaperTitle.svelte";

    export let canisterCfgList = [];

    // let listLoaded = false;
</script>

<Paper color="primary" variant="outlined">
    <Content>
        <div>
            <Button
                variant="raised"
                on:click={() => {
                    navigateTo("/devhub/admin/follows/new");
                }}
            >
                <Icon class="material-icons">add</Icon>
                <Label>Follow A New Canister</Label>
            </Button>
        </div>
        <DataTable table$aria-label="Canister list" style="width: 100%;">
            <Head>
                <Row>
                    <!-- <Cell></Cell> -->
                    <Cell numeric>Seq.</Cell>
                    <Cell style="width: 100%;">Canister</Cell>
                    <Cell>Tag</Cell>
                    <Cell>Version</Cell>
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
                        <Cell>...</Cell>
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
        </DataTable>
    </Content>
</Paper>
