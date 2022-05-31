<script>
    import * as hub from "../../../../.dfx/local/canisters/hub";
    import { setContext, getContext, hasContext } from "svelte";
    import { onMount, onDestroy } from "svelte";
    import { defaultProviders } from "@connect2ic/core/providers";
    import {
        ConnectButton,
        ConnectDialog,
        Connect2ICProvider,
    } from "@connect2ic/svelte";
    import "@connect2ic/core/style.css";
    import { AuthClient } from "@dfinity/auth-client";
    import { HttpAgent, Actor } from "@dfinity/agent";
    import { Principal } from "@dfinity/principal";
    import { navigateTo } from "svelte-router-spa";
    import {
        createActor as hubCreateActor,
        canisterId as hubCanisterId,
    } from "../../../declarations/hub";
    import LoadingPanel from "./LoadingPanel.svelte";
    import Paper, { Title as PTitle, Content } from "@smui/paper";
    import Button from "@smui/button";
    import { Label } from "@smui/common";

    import * as CONSTANT from "../constant";
    import { isLocalEnv } from "../utils/actorUtils";
    import localCanisterJson from "../../../../.dfx/local/canister_ids.json";
    import { userProfileStore } from "../store/user";

    export let currentRoute;
    let params = {};

    const DEFAULT_CYCLE_FOR_NEW_DEVHUB = 1000000;
    const USER_TYPE_NEW = "new";
    const USER_TYPE_REGISTERED = "registered";

    let login = false;
    let logining = false;
    let authClient = null;
    let identity = null;
    let hubActor = null;
    let userTypeLoading = false;
    let userType = USER_TYPE_NEW;
    let registering = false;
    let userLoaded = false;
    let devhubsOfCurrentIdentity = [];

    const unsubscribeUserProfile = userProfileStore.subscribe(value => {
        if (!value.login) {
            login = false;
            userType = USER_TYPE_NEW;
        }
    })

    $: if (userLoaded) {
        // userProfileStore.set({});
        userProfileStore.set({
            login:true,
            isIcHubUser: true,
            identity,
            hubActor,
            devhubsOfCurrentIdentity,
        });
        console.log('login ready to redirect to ', currentRoute.queryParams.returl);
        navigateTo(currentRoute.queryParams.returl ? currentRoute.queryParams.returl : '/');
    }

    function setLoginStatus() {
        identity = authClient.getIdentity();
        hubActor = hubCreateActor(
            Principal.fromText(localCanisterJson.hub.local),
            {
                agentOptions: { identity },
            }
        );
        login = true;
        userProfileStore.set({
            login: true,
            identity,
            hubActor,
        });
    }

    async function getUserRegisterStatus() {
        userTypeLoading = true;
        try {
            let result = await hubActor.get_user_configs_by_user();
            console.log("get_canisters_by_user result", result);
            if (result.Authenticated && result.Authenticated.length > 0) {
                userType = USER_TYPE_REGISTERED;
                devhubsOfCurrentIdentity = [...result.Authenticated];
                userLoaded = true;
                
            }
        } catch (err) {
            console.log("check register status error", err);
        }
        userTypeLoading = false;
    }

    onMount(async () => {
        console.log("current route ", currentRoute);
        authClient = await AuthClient.create({
            idleOptions: {
                idleTimeout: 1000 * 60 * 30, // set to 30 minutes
            },
        });
        let authenticated = await authClient.isAuthenticated();
        if (authenticated) {
            setLoginStatus();
            await getUserRegisterStatus();
        }
    })


    onDestroy(() => {
        unsubscribeUserProfile();
    })

    async function handleIILogin() {
        logining = true;
        if (!!authClient) {
            const agent = new HttpAgent();
            let loginOpt = {
                // 7 days in nanoseconds
                maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
                onSuccess: async () => {
                    setLoginStatus();
                    logining = false;
                    await getUserRegisterStatus();
                },
                onError: (errMsg) => {
                    console.log("login failed", errMsg);
                    logining = false;
                },
            };
            if (isLocalEnv()) {
                let iiCanisterId = localCanisterJson.internet_identity.local;

                console.log("ii canister id", iiCanisterId);
                loginOpt.identityProvider = `http://${iiCanisterId}.localhost:8000/`;
            }
            authClient.login(loginOpt);
        }
    }

    async function registerNewUser() {
        registering = true;

        try {
            let result = await hubActor.register_new_canister(
                BigInt(DEFAULT_CYCLE_FOR_NEW_DEVHUB),
                CONSTANT.DEFAULT_CALL_LIMITS,
                JSON.stringify(CONSTANT.DEFAULT_UI_CONFIG),
                true, // is public
                CONSTANT.DEFAULT_USER_CONFIG_LIMIT
            );
            console.log("register result", result);
            if (result.Ok) {
                devhubsOfCurrentIdentity.push(result.Ok);
                userType = "registered";
                userLoaded = true;
            } else {
                console.log("register failed", result.Err);
            }
        } catch (err) {
            console.log("register error", err);
        }
        registering = false;
    }
</script>

<!--
<Connect2ICProvider
    dev={true}
    canisters={{
        hub,
    }}
    providers={defaultProviders}
>
    <div>
        <ConnectButton />
    </div>
    <ConnectDialog />
</Connect2ICProvider>
-->

<Paper>
    <Content>
        {#if !login}
            {#if logining}
                <LoadingPanel description="logining ..." />
            {:else}
                <Button
                    variant="raised"
                    on:click={() => {
                        handleIILogin();
                    }}
                >
                    <Label>II Login</Label>
                </Button>
            {/if}
        {:else if userTypeLoading}
            <LoadingPanel description="checking user profile ..." />
        {:else if userType === USER_TYPE_NEW}
            {#if registering}
                <LoadingPanel description="registering ..." />
            {:else}
                <Button
                    variant="raised"
                    on:click={async () => {
                        await registerNewUser();
                    }}
                >
                    <Label>Register</Label>
                </Button>
            {/if}
        {/if}
    </Content>
</Paper>
