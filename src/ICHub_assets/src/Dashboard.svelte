<script>
    import { ICHub, createActor, canisterId } from "../../declarations/ICHub";
    import { onMount } from "svelte";
    import { Principal } from "@dfinity/principal";
    import CircularProgress from "@smui/circular-progress";
    import NewFollowCard from "./components/NewFollowCard.svelte";
    import { HttpAgent, Actor } from "@dfinity/agent";
    import Button, { Label } from "@smui/button";
    export let identity;

    let agent = null;
    let ichubActor = null;
    let userConfig = null;
    let configLoaded = false;
    let configLoading = false;
    let defaultCanisterCfg = {
        version: 1,
    };

    async function getUserConfig() {
        configLoading = true;
        try {
            let userConfig = await ichubActor.get_user_config();
            console.log("get userConfig", userConfig);
            configLoaded = true;
        } catch (err) {
            console.log("error occured when get user config", err);
        }
        configLoading = false;
    }

    onMount(async () => {
        console.log("onMount ready to load user config");
        agent = new HttpAgent({ identity });
        ichubActor = createActor(canisterId, { agentOptions: { identity } });
        // await getUserConfig();
    });

    function onNewCanisterFollowed(event) {
        console.log("onNewCanisterFollowed =>", event.detail);
    }
</script>

<div>
    <div>
        <NewFollowCard agent={agent}
        on:newCanisterFollowed={onNewCanisterFollowed} />
        {#if configLoaded}
            <p>config loaded:</p>
            {#if !!userConfig.Authenticated}
                <p>Authenticated:</p>

                <p>callLimits:{userConfig.Authenticated.calls_limit}</p>
                <p>
                    canister_calls:{userConfig.Authenticated.canister_calls
                        .length}
                </p>
                <p>
                    canister_configs:{userConfig.Authenticated.canister_configs
                        .length}
                </p>
                <p>
                    principal: {Principal.from(
                        userConfig.Authenticated.user
                    )}
                </p>
            {/if}
            {#if !!userConfig.UnAuthenticated}
                <p>UnAuthenticated:</p>

                <p>
                    ui_config:{userConfig.UnAuthenticated.ui_config}
                </p>
                <p>
                    canister_configs:{userConfig.UnAuthenticated
                        .canister_configs.length}
                </p>
                <p>
                    principal: {Principal.from(
                        userConfig.UnAuthenticated.user
                    )}
                </p>
            {/if}
        {:else if configLoading}
            <div>
                <span>loading configuration ...</span>
                <CircularProgress
                    style="height: 32px; width: 32px;"
                    indeterminate
                />
            </div>
        {:else}
            <Button
                variant="raised"
                on:click={async () => {
                    await getUserConfig();
                }}
            >
                <Label>load config</Label>
            </Button>
        {/if}
    </div>
</div>
