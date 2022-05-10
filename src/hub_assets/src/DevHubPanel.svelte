<script>
    import { onMount } from "svelte";
    import { Principal } from "@dfinity/principal";
    import CircularProgress from "@smui/circular-progress";
    import NewFollowCard from "./components/NewFollowCard.svelte";
    import CanisterList from "./components/CanisterList.svelte";
    import CaseSuitePanel from "./components/CaseSuitePanel.svelte";
    import { HttpAgent, Actor } from "@dfinity/agent";
    import Button, { Label } from "@smui/button";
    import { getActorFromCanisterId, isLocalEnv } from "./utils/actorUtils";
    import { extractCanisterCfgList, extractUICfg } from "./utils/devhubUtils";
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
    let uiConfig = null;
    let uiConfigUpdating = false;

    async function getUserConfig() {
        configLoading = true;
        try {
            userConfig = await devhubActor.get_user_config();
            console.log("get userConfig", userConfig);
            canisterCfgList = extractCanisterCfgList(userConfig);
            uiConfig = extractUICfg(userConfig);
            configLoaded = true;
        } catch (err) {
            console.log("error occured when get user config", err);
        }
        configLoading = false;
    }

    onMount(async () => {
        console.log("onMount ready to load user config");
        agent = new HttpAgent({ identity });
        if (isLocalEnv()) {
            agent.fetchRootKey().catch((err) => {
                console.warn(
                    "Unable to fetch root key. Check to ensure that your local replica is running"
                );
                console.error(err);
            });
        }
        // devhubActor = createActor(activeCanisterId, { agentOptions: { identity } });
        devhubActor = await getActorFromCanisterId(activeCanisterId, agent);
        await getUserConfig();
    });

    async function onNewCanisterFollowed(event) {
        console.log("onNewCanisterFollowed =>", event.detail);
        let newCfg = Object.assign({}, DEFAULT_CANISTER_CONFIG);
        newCfg.config = JSON.stringify(DEFAULT_UI_CONFIG);
        newCfg.canister_id = Principal.fromText(event.detail.canisterId);
        // newCfg.meta_data[0].controller = Principal.fromText(newCfg.meta_data[0].controller);
        try {
            // devhubActor = await getActorFromCanisterId(activeCanisterId, agent);
            let result = await devhubActor.cache_canister_config(newCfg);
            console.log("cache canister config result", result);
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

    async function onUpdateUIConfig(newUIConfig) {
        uiConfigUpdating = true;
        try {
            await devhubActor.cache_ui_config(JSON.stringify(newUIConfig));
        } catch (err) {
            console.log("cache ui config error", err);
        }
        uiConfigUpdating = false;
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
            
            <CaseSuitePanel
                {identity}
                {devhubActor}
                {canisterCfgList}
                {agent}
                {uiConfig}
            />
        {/if}
    </div>
</div>
