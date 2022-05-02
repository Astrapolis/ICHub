<script>
  import { ICHub, createActor } from "../../declarations/ICHub";
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
  import Paper, { Title as PTitle, Content } from "@smui/paper";
  import Button, { Label } from "@smui/button";
  import CircularProgress from "@smui/circular-progress";
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

  let login = false;
  let authClient = null;
  let identity = null;
  let loginStatus = "checking"; // "checking", "done"
  let logining = false;

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

    loginStatus = "done";
  });
</script>

<main>
  <div class="top-app-bar-container flexor">
    <TopAppBar variant="static" color="primary">
      <Row>
        <Section align="start">
          <IconButton class="material-icons">menu</IconButton>
          <Title>ICHub, the entrance of IC</Title>
        </Section>
      </Row>
    </TopAppBar>
  </div>
  {#if login}
    <Dashboard identity={identity} />
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
    border: 1px solid
      var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.1));
    margin: 0 18px 18px 0;
    background-color: var(--mdc-theme-background, #fff);

    overflow: auto;
    display: inline-block;
  }

  .flexor {
    display: inline-flex;
    flex-direction: column;
  }
</style>
