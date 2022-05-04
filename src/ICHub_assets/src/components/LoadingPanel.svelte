<script>
import CircularProgress from "@smui/circular-progress";

export let description = "loading...";
export let layout = "inline";
</script>

<div class={layout === "inline" ? "loading-inline-container" : "loading-full-container"}>
    <div class="loading-content-container">
        <CircularProgress
              style="height: 32px; width: 32px;"
              indeterminate
            />
            <div>{description}</div>
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
</style>