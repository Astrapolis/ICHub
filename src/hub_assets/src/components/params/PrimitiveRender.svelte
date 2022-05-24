<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import Textfield from "@smui/textfield";
    import HelperText from "@smui/textfield/helper-text";
    import {
        getPrimitiveValueParser,
    } from "../../utils/paramRenderUtils";
    import * as CONSTANT from "../../constant";

    export let savedValue = null;
    export let argIDL = null;

    const dispatch = createEventDispatcher();

    let inputValue = null;
    let inputDirty = false;
    let inputInvalid = false;
    let inputErrorMsg = null;


    onMount(async () => {
        if (savedValue !== undefined) {
            inputValue = savedValue;
        }
        console.log("primitive render with savedValue ===>", savedValue);
    });

    $: if (inputValue || inputValue === null) {
        let validResult = validateInputValue();

        if (validResult.invalid) {
            if (inputDirty) {
                inputInvalid = true;
                inputErrorMsg = validResult.message;
            }
        } else {
            inputInvalid = false;
            inputErrorMsg = null;
            dispatch("paramValueSet", {
                inputValue,
                // parserType: CONSTANT.VALUE_PARSER_PRIMITIVE,
            });
        }
    }

    function validateInputValue() {
        try {
            let valueProbe = argIDL.accept(
                getPrimitiveValueParser(),
                inputValue
            );
            if (!argIDL.covariant(valueProbe)) {
                throw new Error(
                    `${inputValue} is not of type ${argIDL.display()}`
                );
            }
            return {
                invalid: false,
            };
        } catch (e) {
            return {
                invalid: true,
                message: e.message,
            };
        }
    }
</script>

<Textfield
    style="min-width: 250px;"
    variant="outlined"
    bind:dirty={inputDirty}
    bind:value={inputValue}
    invalid={inputInvalid}
    label={`Input ${argIDL.display()} value`}
    required
>
    <HelperText validationMsg slot="helper">
        {inputErrorMsg}
    </HelperText>
</Textfield>
