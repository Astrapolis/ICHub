<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    import Paper, { Title, Content } from "@smui/paper";
    import { Icon, Label } from "@smui/common";

    import GeneralRender from "./GeneralRender.svelte";

    import * as CONSTANT from "../../constant";

    export let argIDL = null;
    export let savedValue = null;

    let bufferedValue = {};

    const dispatch = createEventDispatcher();

    onMount(async () => {
        console.log("ready to render record", argIDL, savedValue);
        if (savedValue !== undefined) {
            bufferedValue = savedValue;
        }
    });

    function onParameterValueChanged(event, index) {
        bufferedValue[argIDL._fields[index][0]] = event.detail.inputValue;

        dispatch("paramValueSet", {
            inputValue: bufferedValue
        });
    }
</script>

<Paper>
    <Title>Record</Title>
    <Content>
        {#each argIDL._fields as field, index}
            <Label>{field[0]}</Label>
            <GeneralRender
                argIDL={field[1]}
                savedValue={savedValue[field[0]]}
                on:paramValueSet={(evt) => onParameterValueChanged(evt, index)}
            />
        {/each}
    </Content>
</Paper>
