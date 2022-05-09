<script>
    import { onMount } from "svelte";
    import { Principal } from "@dfinity/principal";
    import CircularProgress from "@smui/circular-progress";
    import NewFollowCard from "./components/NewFollowCard.svelte";
    import CanisterList from "./components/CanisterList.svelte";
    import { HttpAgent, Actor } from "@dfinity/agent";
    import Button, { Label } from "@smui/button";
    import { getActorFromCanisterId } from "./utils/actorUtils";
    import { extractCanisterCfgList } from "./utils/devhubUtils";
    import {
        DEFAULT_CANISTER_CONFIG,
        DEFAULT_CALL_LIMITS,
        DEFAULT_UI_CONFIG,
    } from "./constant";
    export let identity;
    export let activeCanisterId; // type of principal not string

    let agent = null;
    let devhubActor = null;
    let userConfig = null;
    let canisterCfgList = [];
    let configLoaded = false;
    let configLoading = false;

    async function getUserConfig() {
        configLoading = true;
        try {
            userConfig = await devhubActor.get_user_config();
            console.log("get userConfig", userConfig);
            canisterCfgList = extractCanisterCfgList(userConfig);
            configLoaded = true;
        } catch (err) {
            console.log("error occured when get user config", err);
        }
        configLoading = false;
    }

    onMount(async () => {
        console.log("onMount ready to load user config");
        agent = new HttpAgent({ identity });
        // devhubActor = createActor(activeCanisterId, { agentOptions: { identity } });
        devhubActor = await getActorFromCanisterId(activeCanisterId, agent);
        await getUserConfig();
    });

    async function onNewCanisterFollowed(event) {
        console.log("onNewCanisterFollowed =>", event.detail);
        let newCfg = Object.assign({}, DEFAULT_CANISTER_CONFIG);
        newCfg.config = JSON.stringify(DEFAULT_UI_CONFIG);
        newCfg.canister_id = Principal.fromText(event.detail.canisterId);
        try {
            let result = await devhubActor.cache_canister_config([newCfg]);
            if (result.Authenticated) {
                await getUserConfig();
            } else {
                console.log(
                    "cache canister config failed",
                    result.UnAuthenticated
                );
            }
        } catch (err) {
            console.log("cache canister config error", err);
        }
    }
</script>

<div>
    <div>
        {#if configLoading}
            <div>
                <CircularProgress
                    layout="full-screen"
                    description="loading configuration ..."
                    style="height: 32px; width: 32px;"
                    indeterminate
                />
            </div>
        {:else if configLoaded}
            <NewFollowCard
                {agent}
                {userConfig}
                on:newCanisterFollowed={onNewCanisterFollowed}
            />
            <CanisterList {canisterCfgList} {devhubActor} />
        {/if}
    </div>
</div>
