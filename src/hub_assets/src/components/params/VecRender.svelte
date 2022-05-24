<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    import Paper, { Title, Content } from "@smui/paper";
    import FormField from "@smui/form-field";
    import Textfield from "@smui/textfield";

    import GeneralRender from "./GeneralRender.svelte";

    export let argIDL = null;
    export let savedValue = null;

    let arraySize = 0;
    let buffedArray = [];

    const dispatch = createEventDispatcher();

    $: {
        let aSize = parseInt(arraySize);
        if (aSize < 0) {
            arraySize = 0;
        }
        buffedArray.length = arraySize;
        dispatch("paramValueSet", { inputValue: buffedArray });
    }

    onMount(async () => {
        console.log("ready to render vec", argIDL, savedValue);
        if (!!savedValue) {
            // notNullChecked = savedValue !== null;
            buffedArray = [...savedValue];
            arraySize = savedValue.length;
        } else {
            arraySize = 0;
            buffedArray = [];
        }
    });

    function onParameterValueChanged(event, index) {
        buffedArray[index] = event.detail.inputValue;
        dispatch("paramValueSet", { inputValue: buffedArray });
    }
</script>

<Paper>
    <Title>Array</Title>
    <FormField>
        <Textfield
            bind:value={arraySize}
            label="Array Size [0,100]"
            type="number"
        />
    </FormField>
    {#if arraySize > 0}
        {#each buffedArray as element, index}
            <GeneralRender
                argIDL={argIDL._type}
                savedValue={element}
                on:paramValueSet={(event) =>
                    onParameterValueChanged(event, index)}
            />
        {/each}
    {/if}
</Paper>
