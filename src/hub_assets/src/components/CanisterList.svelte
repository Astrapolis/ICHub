<script>
    import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
    import LinearProgress from "@smui/linear-progress";
    import IconButton from "@smui/icon-button";
    import Button, { Label } from "@smui/button";
    import {
        devhub,
        createActor as devhubCreator,
        canisterId,
    } from "../../../declarations/devhub";

    let listLoading = false;
    let canisterList = [];
</script>

<div>
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
            {#each canisterList as canister, index (canister.canisterId)}
                <Row>
                    <Cell>{index}</Cell>
                    <Cell>{canister.canisterId}</Cell>
                    <Cell>{canister.tag}</Cell>
                    <Cell
                        ><IconButton class="material-icons" on:click={() => {
                            console.log('download did file for canister', canister);
                        }}>download</IconButton
                        ></Cell
                    >
                    <Cell>
                        <div><Button variant="raised" on:click={() => {
                            console.log('unfollow',canister);
                        }}><Label>unfollow</Label></Button>
                        <Button variant="raised" on:click={() => {
                            console.log('management', canister);
                        }}><Label>management</Label></Button>
                    </div>
                    </Cell>
                </Row>
            {/each}
        </Body>

        <LinearProgress
            indeterminate
            bind:closed={listLoading}
            aria-label="Data is being loaded..."
            slot="progress"
        />
    </DataTable>
</div>
