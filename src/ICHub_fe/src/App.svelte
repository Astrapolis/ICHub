<script>
  // import CanisterIds from "./components/CanisterIds.svelte";
  // import Links from "./components/Links.svelte";
  import NewFollowCard from "./components/NewFollowCard.svelte";
  import { Principal } from "@dfinity/principal";
  import { onMount } from "svelte";

  let login = true;
  // let canisterId = "";
</script>

<main>
  {#if login}
    <NewFollowCard />
  {/if}
</main>

<style>
</style>
