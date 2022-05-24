<script>
    import { onMount } from "svelte";
    import { Actor } from "@dfinity/agent";
    import { createEventDispatcher } from "svelte";
    import Paper, { Title, Content } from "@smui/paper";
    import Textfield from "@smui/textfield";
    import HelperText from "@smui/textfield/helper-text";
    import Button from "@smui/button";
    import { Icon, Label } from "@smui/common";
    import FormField from "@smui/form-field";

    import LoadingPanel from "./LoadingPanel.svelte";
    import PrimitiveRender from "./params/PrimitiveRender.svelte";
    import GeneralRender from "./params/GeneralRender.svelte";
    import {
        getGeneralTypeRender,
        getPrimitiveValueParser,
    } from "../utils/paramRenderUtils";
    import { getActorFromCanisterId, isLocalEnv } from "../utils/actorUtils";
    import * as CONSTANT from "../constant";

    // export let paramSpec = null;
    export let methodName = null;
    export let canisterId = null;
    export let agent = null;
    export let savedValues = null;

    const dispatch = createEventDispatcher();

    let specLoading = false;
    let canisterActor = null;
    let fieldIDL = null;

    onMount(async () => {
        specLoading = true;
        canisterActor = await getActorFromCanisterId(canisterId, agent);
        specLoading = false;
        let field = Actor.interfaceOf(canisterActor)._fields.find((f) => {
            return f[0] === methodName;
        });

        fieldIDL = field[1];
    });

    function onParameterValueChanged(event, index) {
        console.log("onParameterValueChanged relay ==>", event);
        dispatch("paramValueSet", { paramIndex: index, ...event.detail });
    }
</script>

<div>
    {#if specLoading}
        <LoadingPanel description="loading case method spec ..." />
    {:else if !!fieldIDL}
        {#each fieldIDL.argTypes as argIDL, index}
            <GeneralRender
                {argIDL}
                savedValue={savedValues[index]}
                on:paramValueSet={(evt) => onParameterValueChanged(evt, index)}
            />
        {/each}
    {/if}
</div>
