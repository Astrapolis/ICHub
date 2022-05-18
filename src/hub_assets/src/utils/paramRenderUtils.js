import * as CONSTANT from "../constant";

/**
 * A copy logic from Render class.
 * please refer to @see https://github.com/dfinity/agent-js/blob/974c06a810d0869c1f09137429795f20eddf7108/packages/candid/src/candid-ui.ts#L30
 */
export function RenderParamFactory() {
    let visitType = (t,d) => {
        return CONSTANT.RENDER_TYPE;
    };

    let visitNull = (t,d) =>  {
        return CONSTANT.RENDER_NULL;
    };

    let visitRecord = (t,fields, d) => {
        return CONSTANT.RENDER_RECORD;
    };

    let visitTuple = (t, components, d) => {
        return CONSTANT.RENDER_TUPLE;
    };

    let visitVariant = (t, fields, d) => {
        return CONSTANT.RENDER_VARIANT;
    };

    let visitOpt = (t, ty, d) => {
        return CONSTANT.RENDER_OPT;
    };

    let visitVec = (t, ty, d) => {
        return CONSTANT.RENDER_VEC;
    };

    let visitRec = (t, ty, d) => {
        return CONSTANT.RENDER_REC;
    };
    
}