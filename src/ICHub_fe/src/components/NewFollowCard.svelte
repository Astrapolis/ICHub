<script>
  import { createEventDispatcher } from "svelte";
  import { Actor } from "@dfinity/agent";
  import { Principal } from "@dfinity/principal";
  import {
    getProfilerActor,
    getActorFromCanisterId,
  } from "../utils/actorUtils";
  import Paper, { Title, Content } from "@smui/paper";
  import Textfield from "@smui/textfield";
  import Button, { Label } from "@smui/button";
  import CircularProgress from "@smui/circular-progress";
  import Snackbar, { Actions, Label as SLabel } from "@smui/snackbar";

  const dispatch = createEventDispatcher();
  let newCanisterId = null;
  let formRef = null;
  let following = false;
  let snackContent = "";
  let snackbarRef = null;
  async function handleSubmitNewCanister(event) {
    event.preventDefault();
    console.log("submit with new canister id", newCanisterId);
    following = true;
    snackContent = "";
    try {
      const actor = await getActorFromCanisterId(
        Principal.fromText(newCanisterId)
      );

      if (!!actor) {
        dispatch("newCanisterFollowed", { actor, canisterId: newCanisterId });
        formRef.reset();
        snackContent = "新canister已成功加入观察列表。";
      } else {
        snackContent = "无法找到指定的canister。";
      }
      //   const sortedMethods = Actor.interfaceOf(actor)._fields.sort(([a], [b]) =>
      //     a > b ? 1 : -1
      //   );
      //   for (const [name, func] of sortedMethods) {
      //     // renderMethod(canister, name, func, profiler);
      //     console.log("sortedMethods ===>", name, func);
      //   }
    } catch (err) {
      console.log("get canister profile error", err);
      snackContent = "出错啦，无法观察指定的canister。" + err;
    }
    following = false;
    snackbarRef.open();
  }
</script>

<div>
  <Paper>
    <Title>观察新的canister</Title>
    <Content>
      <Snackbar bind:this={snackbarRef}>
        <SLabel>{snackContent}</SLabel>
      </Snackbar>
      <form on:submit={handleSubmitNewCanister} bind:this={formRef}>
        <div>
          <Textfield
            variant="outlined"
            bind:value={newCanisterId}
            label="请输入新的canister id"
            required
          />
          {#if following}
            <CircularProgress
              style="height: 32px; width: 32px;"
              indeterminate
            />
          {:else}
            <Button variant="raised" type="submit">
              <Label>添加到观察列表</Label>
            </Button>
          {/if}
        </div>
      </form>
    </Content>
  </Paper>
</div>
