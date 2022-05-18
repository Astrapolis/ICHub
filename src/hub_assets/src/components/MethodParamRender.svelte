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
    import {
        getGeneralTypeRender,
        getPrimitiveValueParser,
    } from "../utils/paramRenderUtils";
    import { getActorFromCanisterId, isLocalEnv } from "../utils/actorUtils";
    import * as CONSTANT from "../constant";

    export let methodName = null;
    export let paramIndex = null;
    export let canisterId = null;
    export let savedValue = null;
    export let agent = null;

    const dispatch = createEventDispatcher();

    // let paramValue = null;
    let renderType = null;
    let paramTypeName = null;
    let canisterActor = null;
    let fieldClass = null;

    let inputValue = null;
    let inputDirty = false;
    let inputInvalid = false;
    let inputErrorMsg = null;
    let saveDisable = true;

    $: if (inputValue || inputValue === null) {
        let validResult = validateInputValue();
        console.log("input valid", validResult.invalid);
        if (validResult.invalid) {
            if (inputDirty) {
                inputInvalid = true;
                inputErrorMsg = validResult.message;
                saveDisable = true;
            }
        } else {
            inputInvalid = false;
            inputErrorMsg = null;
            saveDisable = false;
        }
    }

    onMount(async () => {
        // paramValue = paramCfg.storedValue;
        canisterActor = await getActorFromCanisterId(canisterId, agent);
        let field = Actor.interfaceOf(canisterActor)._fields.find((f) => {
            return f[0] === methodName;
        });
        console.log("field ====>", field);
        if (field && paramIndex >= 0) {
            fieldClass = field[1];
            let argType = fieldClass.argTypes[paramIndex];
            renderType = argType.accept(getGeneralTypeRender(), null);
            paramTypeName = argType.name;
        }
    });

    function validateInputValue() {
        try {
            let valueProbe = fieldClass.argTypes[paramIndex].accept(
                getPrimitiveValueParser(),
                inputValue
            );
            if (!fieldClass.argTypes[paramIndex].covariant(valueProbe)) {
                throw new Error(
                    `${inputValue} is not of type ${fieldClass.argTypes[
                        paramIndex
                    ].display()}`
                );
            }
            return {
                invalid: false,
            };
            // inputInvalid = false;
            // inputErrorMsg = null;
            // console.log("check result", valueProbe);
        } catch (e) {
            // console.log("check error", e.message);
            // inputInvalid = true;
            return {
                invalid: true,
                message: e.message,
            };
            // inputErrorMsg = e.message;
        }
    }

    function onParamValueCommit(event) {
        dispatch("MethodValueChanged", {
            // method: paramCfg,
            newValue: paramValue,
        });
    }

    async function onSaveTextValue(event) {
        dispatch("paramValueSet", {
            paramIndex,
            inputValue,
        });
    }

    async function onSaveFixedNatValue(event) {}
</script>

<Paper>
    <Title>{paramTypeName}</Title>
    <Content>
        {#if renderType === CONSTANT.RENDER_TYPE}
            <form on:submit|preventDefault={onSaveTextValue}>
                <FormField>
                    <div>
                        <Textfield
                            style="min-width: 250px;"
                            variant="outlined"
                            bind:dirty={inputDirty}
                            bind:value={inputValue}
                            invalid={inputInvalid}
                            label={`Input ${paramTypeName} value`}
                            required
                        >
                            <HelperText validationMsg slot="helper">
                                {inputErrorMsg}
                            </HelperText>
                        </Textfield>
                    </div>
                    <Button variant="raised" type="submit" disabled={saveDisable}>
                        <Label>Save</Label>
                    </Button>
                </FormField>
            </form>
        {:else}
            {renderType}
        {/if}
        <!-- <form on:submit|preventDefault={onParamValueCommit} style="margin: 10px">
            <Textfield variant="outlined" bind:value={paramValue}  label={paramCfg.name} required />
            <Button variant="raised" type="submit">
                <Label>Save</Label>
            </Button>
        </form> -->
    </Content>
</Paper>
