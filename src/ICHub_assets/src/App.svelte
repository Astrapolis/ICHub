<script>
  import { ICHub, createActor } from "../../declarations/ICHub";
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
  import Menu from "@smui/menu";
  import List, { Item, Separator, Text } from "@smui/list";
  import Tab, { Label as TabLabel } from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  import Paper, { Title as PTitle, Content } from "@smui/paper";
  import Button, { Label } from "@smui/button";
  import CircularProgress from "@smui/circular-progress";
  import MenuSurface, { Anchor } from "@smui/menu-surface";
  import Card, {
    Content as CContent,
    PrimaryAction,
    Actions,
    ActionButtons,
    ActionIcons,
  } from "@smui/card";
  import { Principal } from "@dfinity/principal";
  import { AuthClient } from "@dfinity/auth-client";
  import localCanisterJson from "../../../.dfx/local/canister_ids.json";

  import { onMount } from "svelte";
  import { is_local } from "./utils/actorUtils";
  import { HttpAgent } from "@dfinity/agent";
  import Dashboard from "./Dashboard.svelte";
  import HubPanel from "./HubPanel.svelte";

  const TAB_HUB = "Hub";
  const TAB_CANISTER = "My Canisters";
  let login = false;
  let authClient = null;
  let identity = null;
  let loginStatus = "checking"; // "checking", "done"
  let logining = false;
  let logoutMenu = null;
  let anchorClasses = {};
  let anchor = null;
  let surface = null;
  let tabs = [TAB_HUB, TAB_CANISTER];
  let active = TAB_HUB; // tabs必须用active这个名字来绑定，用其它的名字无法正常工作，好坑啊，费我半天！

  $: {
    console.log(`render with activeTab: ${active}`);
    console.log(`render with login ${login}`);
  }

  function setLoginStatus() {
    identity = authClient.getIdentity();
    login = true;
  }

  async function handleIILogin() {
    logining = true;
    if (!!authClient) {
      const agent = new HttpAgent();
      let loginOpt = {
        // 7 days in nanoseconds
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        onSuccess: () => {
          setLoginStatus();
          logining = false;
        },
        onError: (errMsg) => {
          console.log("login failed", errMsg);
          logining = false;
        },
      };
      if (is_local(agent)) {
        let idCanisterId = localCanisterJson.internet_identity.local;
        loginOpt.identityProvider = `http://${idCanisterId}.localhost:8000/`;
      }
      authClient.login(loginOpt);
    }
  }

  onMount(async () => {
    loginStatus = "checking";

    authClient = await AuthClient.create({
      idleOptions: {
        idleTimeout: 1000 * 60 * 30, // set to 30 minutes
      },
    });
    let authenticated = await authClient.isAuthenticated();
    if (authenticated) {
      setLoginStatus();
    }

    loginStatus = "done";
  });
</script>

<main>
  <div class="top-app-bar-container flexor">
    <div>
      <IconButton class="material-icons">menu</IconButton>
    </div>
    {#if login}
      <div class="top-tab-container">
        <!-- Note: bind:active must be kept as it is, you can't use it like bind:activeTab.-->
        <TabBar {tabs} let:tab bind:active>
          <!-- Note: the `tab` property is required! -->
          <Tab {tab}>
            <TabLabel>{tab}</TabLabel>
          </Tab>
        </TabBar>
      </div>
      <div>
        <div class="top-profile-container">
          <span>{identity.getPrincipal()}</span>
          <div
            class={Object.keys(anchorClasses).join(" ")}
            use:Anchor={{
              addClass: (className) => {
                if (!anchorClasses[className]) {
                  anchorClasses[className] = true;
                }
              },
              removeClass: (className) => {
                if (anchorClasses[className]) {
                  delete anchorClasses[className];
                  anchorClasses = anchorClasses;
                }
              },
            }}
            bind:this={anchor}
          >
            <IconButton
              class="material-icons"
              on:click={() => {
                console.log("open surceface");
                logoutMenu.setOpen(true);
              }}>person</IconButton
            >
            <Menu
              bind:this={logoutMenu}
              anchor={false}
              bind:anchorElement={anchor}
              anchorCorner="BOTTOM_LEFT"
            >
              <List>
                <Item
                  on:SMUI:action={async () => {
                    await authClient.logout();
                    login = false;
                  }}
                >
                  <Text>Logout</Text>
                </Item>
              </List>
            </Menu>
          </div>
        </div>
      </div>
    {/if}
  </div>
  {#if login}
    {#if active === TAB_HUB}
      <HubPanel />
    {:else}
      <Dashboard {identity} />
    {/if}
  {:else}
    <div>
      <Paper>
        <Content>
          {#if logining}
            <CircularProgress
              style="height: 32px; width: 32px;"
              indeterminate
            />
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
    </div>
  {/if}
</main>

<style>
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
    flex:1;
  }

  .top-profile-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
</style>
