<script>
    import { onMount } from "svelte";
    import CircularProgress from "@smui/circular-progress";
    import { Label } from "@smui/common";
    export let description = "loading...";
    export let layout = "inline";
    onMount(async () => {});
</script>

<div
    class={layout === "inline"
        ? "loading-inline-container"
        : "loading-full-container"}
>
    <div class="loading-content-container">
        <CircularProgress style="height: 32px; width: 32px;" indeterminate />
        <span class="description-label">{description}</span>
    </div>
</div>

<style>
    .loading-full-container {
        position: fixed;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .loading-inline-container {
        display: inline;
    }
    .loading-content-container {
        display: flex;
        flex-direction: row;
    }
    .description-label {
        color: var(--mdc-theme-primary);
    }
</style>
