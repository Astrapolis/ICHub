<script>
    import { onMount } from "svelte";
    import { Actor } from "@dfinity/agent";
    import { createEventDispatcher } from "svelte";
    import Paper, { Title, Content } from "@smui/paper";
    import Textfield from "@smui/textfield";
    import Button from "@smui/button";
    import { Icon, Label } from "@smui/common";
    import { RenderParamFactory } from "../utils/paramRenderUtils";

    // export let paramCfg = null;
    export let methodName = null;
    export let canisterId = null;

    const renderHelper = new RenderParamFactory();
    const dispatch = createEventDispatcher();

    // let paramValue = null;
    let renderType = fieldClass.accept(new RenderParamFactory(), null);

    onMount(async () => {
        // paramValue = paramCfg.storedValue;
    });

    function onParamValueCommit(event) {
        dispatch("MethodValueChanged", {
            // method: paramCfg,
            newValue: paramValue,
        });
    }
</script>

<Paper>
    <Title>{fieldClass.name}</Title>
    <Content>
        {renderType}
        <!-- <form on:submit|preventDefault={onParamValueCommit} style="margin: 10px">
            <Textfield variant="outlined" bind:value={paramValue}  label={paramCfg.name} required />
            <Button variant="raised" type="submit">
                <Label>Save</Label>
            </Button>
        </form> -->
    </Content>
</Paper>
