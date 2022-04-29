<script>
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import NewFollowCard from "./components/NewFollowCard.svelte";
  import IconButton from "@smui/icon-button";
  import { Principal } from "@dfinity/principal";
  import { onMount } from "svelte";

  let login = true;
  function onNewCanisterFollowed(event) {
    console.log("onNewCanisterFollowed =>", event.detail);
  }
</script>

<main>
  <div class="top-app-bar-container flexor">
    <TopAppBar variant="static" color="primary">
      <Row>
        <Section align="start">
          <IconButton class="material-icons">menu</IconButton>
          <Title>ICHub</Title>
        </Section>
      </Row>
    </TopAppBar>
  </div>
  {#if login}
    <NewFollowCard on:newCanisterFollowed={onNewCanisterFollowed} />
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
