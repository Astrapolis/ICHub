<script>
  import {
    hub,
    createActor as hubCreateActor,
    canisterId as hubCanisterId,
  } from "../../declarations/hub";

  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
  import Menu from "@smui/menu";
  import List, { Item, Separator, Text } from "@smui/list";
  import Tab from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  import Paper, { Title as PTitle, Content } from "@smui/paper";
  import Button from "@smui/button";
  import Dialog, {
    Header as DHeader,
    Title as DTitle,
    Content as DContent,
    Actions,
  } from "@smui/dialog";
  import Fab from "@smui/fab";
  import { Label } from "@smui/common";
  import { Anchor } from "@smui/menu-surface";

  import { Principal } from "@dfinity/principal";
  import { AuthClient } from "@dfinity/auth-client";
  import localCanisterJson from "../../../.dfx/local/canister_ids.json";

  import { onMount } from "svelte";
  import { isLocalEnv } from "./utils/actorUtils";
  import { HttpAgent, Actor } from "@dfinity/agent";
  import DevHubPanel from "./DevHubPanel.svelte";
  import HubPanel from "./HubPanel.svelte";
  import LoadingPanel from "./components/LoadingPanel.svelte";
  // import TestComponent from "./components/TestComponent.svelte";
  import {
    HUB_OFFICIAL_CONFIG,
    DEFAULT_UI_CONFIG,
    DEFAULT_CALL_LIMITS,
  } from "./constant";

  const TAB_HUB = "Hub";
  const TAB_CANISTER = "My Canisters";

  const USER_TYPE_NEW = "new";
  const USER_TYPE_REGISTERED = "registered";
  const DEFAULT_CYCLE_FOR_NEW_DEVHUB = 1000000;
  // const DEFAULT_CANISTER = JSON.stringify(HUB_OFFICIAL_CONFIG);
  let officalHubCanisterId = "abc";
  let login = false;
  let authClient = null;
  let identity = null;
  let logining = false;
  let logoutMenu = null;
  let anchorClasses = {};
  let anchor = null;
  let tabs = [TAB_HUB, TAB_CANISTER];
  let activeTab = TAB_CANISTER;
  let userType = USER_TYPE_NEW;
  let userLoaded = false;
  let userTypeLoading = false;
  let registering = false;
  let hubActor = null;
  let devhubsOfCurrentIdentity = [];
  let profileOpen = false;
  // let inTestMode = false;

  function setLoginStatus() {
    identity = authClient.getIdentity();
    hubActor = hubCreateActor(Principal.fromText(localCanisterJson.hub.local), {
      agentOptions: { identity },
    });
    login = true;
  }

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

  async function getUserRegisterStatus() {
    userTypeLoading = true;
    try {
      let result = await hubActor.get_canisters_by_user();
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

  async function registerNewUser() {
    registering = true;

    try {
      let result = await hubActor.register_new_canister(
        BigInt(DEFAULT_CYCLE_FOR_NEW_DEVHUB),
        DEFAULT_CALL_LIMITS,
        JSON.stringify(DEFAULT_UI_CONFIG)
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

  onMount(async () => {
    console.log("NODE_ENV isLocal ===> ", isLocalEnv());
    // const agent = new HttpAgent();
    if (isLocalEnv()) {
      officalHubCanisterId = localCanisterJson.hub.local;
      HUB_OFFICIAL_CONFIG.canister_id = Principal.fromText(
        localCanisterJson.hub.local
      );
      HUB_OFFICIAL_CONFIG.meta_data[0].controller = Principal.fromText(
        "2al2t-2jbuy-tn5re-ay3mw-aimky-hqdgv-3rjgx-eepq2-yjkeb-bvxrl-hae"
      );
    }
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
  });
</script>

<main class="site-layout-container">
  <Dialog bind:open={profileOpen}>
    <DHeader>
      <DTitle>My Profile</DTitle>
    </DHeader>
    {#if login}
      <DContent>
        <Label>Principal:</Label>
        <Fab extended>
          <Label>{identity.getPrincipal()}</Label>
        </Fab>
      </DContent>
      {/if}
    <Actions>
      <Button variant="raised">
        <Label>Cancel</Label>
      </Button>
    </Actions>
  </Dialog>
  <TopAppBar color="primary" variant="static">
    <!-- <div class="top-app-bar-container flexor"> -->
    <Row>
      <Section>
        <IconButton class="material-icons">menu</IconButton>
      </Section>
      {#if login}
        {#if userType === USER_TYPE_REGISTERED}
          <!-- <div class="top-tab-container"> -->
          <Section>
            <TabBar {tabs} let:tab bind:active={activeTab}>
              <!-- Note: the `tab` property is required! -->
              <Tab {tab}>
                <!-- <Label>{tab}</Label> -->
                <Button
                  variant="raised"
                  color={activeTab === tab ? "primary" : "secondary"}
                >
                  <Label>{tab}</Label>
                </Button>
              </Tab>
            </TabBar>
          </Section>
          <!-- </div> -->
        {/if}
        <Section align="end">
          <IconButton class="material-icons"
            on:click={() => {
              profileOpen = true;
            }}
          >person</IconButton>
          <IconButton
            class="material-icons"
            on:click={async () => {
              await authClient.logout();
              login = false;
              userLoaded = false;
              userType = USER_TYPE_NEW;
              userTypeLoading = false;
              registering = false;
            }}>logout</IconButton
          >
        </Section>
      {/if}
    </Row>
  </TopAppBar>
  <div class="main-content-container">
    {#if userLoaded}
      {#if activeTab === TAB_HUB}
        <HubPanel />
      {:else}
        <DevHubPanel
          {identity}
          activeCanisterId={devhubsOfCurrentIdentity[0]}
        />
      {/if}
    {:else}
      <div>
        {#if !login}
          <Paper>
            <Content>
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
            </Content>
          </Paper>
        {:else}
          <Paper>
            <Content>
              {#if userTypeLoading}
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
        {/if}
      </div>
    {/if}
  </div>
</main>

<style>
  .site-layout-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .top-app-bar-container {
    width: 100%;
    height: 48px;
    border: 1px solid
      var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.1));
    margin: 0 18px 18px 0;
    background-color: var(--mdc-theme-background, #000);

    overflow: visible;
  }

  .flexor {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .top-tab-container {
    flex: 1;
  }

  .top-profile-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .main-content-container {
    flex: 1;
    overflow-y: scroll;
    overflow-x: hidden;
    background-color: white;
  }
</style>
