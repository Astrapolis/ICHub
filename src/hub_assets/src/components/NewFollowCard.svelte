<script>
  import { createEventDispatcher } from "svelte";
  import { Actor } from "@dfinity/agent";
  import { Principal } from "@dfinity/principal";
  import { getActorFromCanisterId } from "../utils/actorUtils";
  import { isCanisterInFollowList } from "../utils/devhubUtils";
  import Paper, { Title, Content } from "@smui/paper";
  import Card, {
    Content as CContent,
    PrimaryAction,
    Actions,
    ActionButtons,
    ActionIcons,
  } from "@smui/card";
  import Textfield from "@smui/textfield";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";

  import Snackbar, { Label as SLabel } from "@smui/snackbar";
  import LoadingPanel from "./LoadingPanel.svelte";

  export let agent = null;
  export let userConfig = null;

  const dispatch = createEventDispatcher();
  let newCanisterId = null;
  let formRef = null;
  let following = false;
  let searching = false;
  let snackContent = "";
  let snackbarRef = null;
  let newCanisterFound = false;
  let newCanisterActor = null;
  let paperTitle = "Follow New Canister";
  async function handleSubmitNewCanister(event) {
    event.preventDefault();
    console.log("submit with new canister id", newCanisterId);
    if (isCanisterInFollowList(userConfig, newCanisterId)) {
      snackContent = "This canister has already been followed.";
      snackbarRef.open();
      return;
    }

    searching = true;
    snackContent = "";
    try {
      const actor = await getActorFromCanisterId(
        Principal.fromText(newCanisterId),
        agent
      );

      if (!!actor) {
        newCanisterActor = actor;
        // formRef.reset();
        // snackContent = "新canister已成功加入观察列表。";
        newCanisterFound = true;
      } else {
        snackContent = "Canister Not Found";
      }
    } catch (err) {
      console.log("get canister profile error", err);
      snackContent = "error occur during searching," + err;
    }
    searching = false;
    snackbarRef.open();
  }

  async function doFollowNewCanister(canisterId) {
    console.log("ready to follow new canister ", canisterId);
    dispatch("newCanisterFollowed", {
      actor: newCanisterActor,
      canisterId: newCanisterId,
    });
  }
</script>

<Paper>
  <Title>{paperTitle}</Title>
  <Content>
    <Snackbar bind:this={snackbarRef}>
      <SLabel>{snackContent}</SLabel>
    </Snackbar>
    {#if !newCanisterFound}
      <form on:submit={handleSubmitNewCanister} bind:this={formRef}>
        <div>
          <Textfield
            variant="outlined"
            bind:value={newCanisterId}
            label="input canister id"
            required
          />
          {#if searching}
            <!-- <CircularProgress
              style="height: 32px; width: 32px;"
              indeterminate
            /> -->
            <LoadingPanel description="searching the canister...." />
          {:else}
            <IconButton class="material-icons" type="submit">search</IconButton>
            <!-- <Button variant="raised" type="submit">
              <Label>添加到观察列表</Label>
            </Button> -->
          {/if}
        </div>
      </form>
    {:else}
      <Card>
        <CContent
          >The canister({newCanisterId}) is found. Would you like to follow it
          now?</CContent
        >
        <Actions>
          <Button
            on:click={() => {
              setTimeout(() => {
                doFollowNewCanister(newCanisterId);
              }, 0);
            }}
          >
            <Label>Yes</Label>
          </Button>
          <Button
            on:click={() => {
              newCanisterFound = false;
              newCanisterId = null;
            }}
          >
            <Label>No</Label>
          </Button>
        </Actions>
      </Card>
    {/if}
  </Content>
</Paper>
