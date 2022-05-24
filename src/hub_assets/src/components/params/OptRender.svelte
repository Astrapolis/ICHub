<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    import Paper, { Title, Content } from "@smui/paper";
    import { Icon, Label } from "@smui/common";
    import Checkbox from "@smui/checkbox";
    import FormField from "@smui/form-field";

    import GeneralRender from "./GeneralRender.svelte";

    export let argIDL = null;
    export let savedValue = null;

    let notNullChecked = false;
    let bufferedRecord = {};

    const dispatch = createEventDispatcher();

    $: {
        if (!notNullChecked) {
            dispatch("paramValueSet", { inputValue: null });
        } else {
            dispatch("paramValueSet", { inputValue: bufferedRecord});
        }
    }

    

    onMount(async () => {
        console.log("ready to render opt", argIDL, savedValue);
        if (savedValue !== undefined) {
            // notNullChecked = savedValue !== null;
            if (savedValue !== null) {
                notNullChecked = true;
                bufferedRecord = savedValue;
            } else {
                notNullChecked = false;
                bufferedRecord = {};
            }
        } else {
            notNullChecked = false;
            bufferedRecord = {};
        }
    });

    function onParameterValueChanged(event) {
        bufferedRecord = event.detail.inputValue;
        dispatch("paramValueSet", event.detail);
    }
</script>

<Paper>
    <Title>Opt</Title>
    <Content>
        <FormField>
            <Checkbox bind:checked={notNullChecked} />
            <span slot="label">Not Null</span>
        </FormField>
        {#if notNullChecked}
            <GeneralRender
                argIDL={argIDL._type}
                {savedValue}
                on:paramValueSet={onParameterValueChanged}
            />
        {/if}
    </Content>
</Paper>
