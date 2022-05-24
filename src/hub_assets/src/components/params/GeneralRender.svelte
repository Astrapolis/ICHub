<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import PrimitiveRender from "./PrimitiveRender.svelte";
    import RecordRender from "./RecordRender.svelte";
    import { getGeneralTypeRender } from "../../utils/paramRenderUtils";
    import * as CONSTANT from "../../constant";

    export let argIDL = null;
    export let savedValue = null;

    let renderType = null;

    const dispatch = createEventDispatcher();

    onMount(async () => {
        console.log("general render with savedValue ===>", savedValue, argIDL);
        renderType = argIDL.accept(getGeneralTypeRender(), null);
        console.log('render type', renderType);
    });

    function onParameterValueChanged(event) {
        dispatch("paramValueSet", event.detail);
    }
</script>

<div>
    {#if renderType === CONSTANT.RENDER_TYPE}
        <PrimitiveRender
            {savedValue}
            {argIDL}
            on:paramValueSet={onParameterValueChanged}
        />
    {:else if renderType === CONSTANT.RENDER_RECORD}
        <RecordRender
            {argIDL}
            savedValue = {!!savedValue ? savedValue : {}}
            on:paramValueSet={onParameterValueChanged}
        />
    {:else}
        {renderType}
    {/if}
</div>
