<script>
    import { ICHub, createActor } from "../../declarations/ICHub";
    import { onMount } from "svelte";
    import { Principal } from "@dfinity/principal";
    import CircularProgress from "@smui/circular-progress";
    import NewFollowCard from "./components/NewFollowCard.svelte";

    export let identity;

    let userConfig = null;
    let configLoading = true;
    let defaultCanisterCfg = {
        version: 1,
    };

    async function getUserConfig() {
        configLoading = true;
        try {
            console.log("invoke get_user_config");
            let principal = await ICHub.get_principal();
            console.log('principal ===> ', Principal.fromUint8Array(principal).toText());
            let result = await ICHub.get_user_config();
            console.log("get_user_config", result);
            userConfig = result;
            console.log("get userConfig", userConfig);
        } catch (err) {
            console.log("error occured when get user config", err);
        }
        configLoading = false;
        return;
    }

    onMount(async () => {
        console.log("onMount ready to load user config");
        await getUserConfig();
    });

    function onNewCanisterFollowed(event) {
        console.log("onNewCanisterFollowed =>", event.detail);
    }
</script>

<div>
    {#if configLoading}
        <div>
            <span>loading configuration ...</span>
            <CircularProgress
                style="height: 32px; width: 32px;"
                indeterminate
            />
        </div>
    {:else if !!userConfig}
        <div>
            <NewFollowCard on:newCanisterFollowed={onNewCanisterFollowed} />
            <p>config loaded:</p>
            <p>Authenticated:</p>

            <p>callLimits:{userConfig.Authenticated.calls_limit}</p>
            <p>
                canister_calls:{userConfig.Authenticated.canister_calls.length}
            </p>
            <p>
                canister_configs:{userConfig.Authenticated.canister_configs
                    .length}
            </p>
            <p>
                principal: {Principal.fromUint8Array(
                    userConfig.Authenticated.user
                )}
            </p>
        </div>
    {/if}
</div>
