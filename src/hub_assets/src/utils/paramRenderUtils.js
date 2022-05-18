import { Principal } from "@dfinity/principal";
import * as CONSTANT from "../constant";

/**
 * This file is a copy logic from Render class.
 * please refer to @see https://github.com/dfinity/agent-js/blob/974c06a810d0869c1f09137429795f20eddf7108/packages/candid/src/candid-ui.ts#L30
 *  and @see https://github.com/dfinity/agent-js/blob/974c06a810d0869c1f09137429795f20eddf7108/packages/candid/src/idl.ts#L100
 */


function RenderParamFactory() {
    this.visitType = (t, d) => {
        return CONSTANT.RENDER_TYPE;
    };

    this.visitPrimitive = (t, d) => {
        return this.visitType(t, d);
    };

    this.visitEmpty = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitBool = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitReserved = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitText = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitNumber = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitInt = (t, d) => {
        return this.visitNumber(t, d);
    };

    this.visitNat = (t, d) => {
        return this.visitNumber(t, d);
    };

    this.visitFloat = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitFixedInt = (t, d) => {
        return this.visitNumber(t, d);
    };

    this.visitFixedNat = (t, d) => {
        return this.visitNumber(t, d);
    };

    this.visitPrincipal = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitConstruct = (t, d) => {
        return this.visitType(t, d);
    };

    this.visitFunc = (t, d) => {
        return this.visitConstruct(t, d);
    };

    this.visitService = (t, d) => {
        return this.visitConstruct(t, d);
    };

    this.visitNull = (t, d) => {
        return CONSTANT.RENDER_NULL;
    };

    this.visitRecord = (t, fields, d) => {
        return CONSTANT.RENDER_RECORD;
    };

    this.visitTuple = (t, components, d) => {
        return CONSTANT.RENDER_TUPLE;
    };

    this.visitVariant = (t, fields, d) => {
        return CONSTANT.RENDER_VARIANT;
    };

    this.visitOpt = (t, ty, d) => {
        return CONSTANT.RENDER_OPT;
    };

    this.visitVec = (t, ty, d) => {
        return CONSTANT.RENDER_VEC;
    };

    this.visitRec = (t, ty, d) => {
        return CONSTANT.RENDER_REC;
    };

};

function GeneralValueParser() {
    
    this.visitType = (t, d) => {
        throw new Error('Not implemented');
    };

    this.visitPrimitive = (t, d) => {
        return this.visitType(t, d);
    };

    this.visitEmpty = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitBool = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitNull = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitReserved = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitText = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitNumber = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitInt = (t, d) => {
        return this.visitNumber(t, d);
    };

    this.visitNat = (t, d) => {
        return this.visitNumber(t, d);
    };

    this.visitFloat = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitFixedInt = (t, d) => {
        return this.visitNumber(t, d);
    };

    this.visitFixedNat = (t, d) => {
        return this.visitNumber(t, d);
    };

    this.visitPrincipal = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitConstruct = (t, d) => {
        return this.visitType(t, d);
    };

    this.visitVec = (t, ty, d) => {
        return this.visitConstruct(t, d);
    };

    this.visitOpt = (t, ty, d) => {
        return this.visitConstruct(t, d);
    };

    this.visitRecord = (t, fields, d) => {
        return this.visitConstruct(t, d);
    };

    this.visitTuple = (t, components, d) => {
        const fields = components.map((ty, i) => [`_${i}_`, ty]);
        return this.visitRecord(t, fields, data);
    };

    this.visitVariant = (t, fields, d) => {
        return this.visitConstruct(t, d);
    };

    this.visitRec = (t, ty, d) => {
        return this.visitConstruct(t, d);
    };

    this.visitFunc = (t, d) => {
        return this.visitConstruct(t, d);
    };

    this.visitService = (t, d) => {
        return this.visitConstruct(t, d);
    };
}

function PrimitiveValueParser() {

    this.visitType = (t, d) => {
        return CONSTANT.RENDER_TYPE;
    };

    this.visitPrimitive = (t, d) => {
        return this.visitType(t, d);
    };

    this.visitEmpty = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitReserved = (t, d) => {
        return this.visitPrimitive(t, d);
    };

    this.visitInt = (t, d) => {
        return this.visitNumber(t, d);
    };

    this.visitNat = (t, d) => {
        return this.visitNumber(t, d);
    };

    this.visitFixedInt = (t, d) => {
        return this.visitNumber(t, d);
    };

    this.visitFixedNat = (t, d) => {
        return this.visitNumber(t, d);
    };

    this.visitConstruct = (t, d) => {
        return this.visitType(t, d);
    };

    this.visitRecord = (t, fields, d) => {
        return CONSTANT.RENDER_RECORD;
    };

    this.visitTuple = (t, components, d) => {
        return CONSTANT.RENDER_TUPLE;
    };

    this.visitVariant = (t, fields, d) => {
        return CONSTANT.RENDER_VARIANT;
    };

    this.visitOpt = (t, ty, d) => {
        return CONSTANT.RENDER_OPT;
    };

    this.visitVec = (t, ty, d) => {
        return CONSTANT.RENDER_VEC;
    };

    this.visitRec = (t, ty, d) => {
        return CONSTANT.RENDER_REC;
    };

    this.visitNull = (t, v) => null;

    this.visitBool = (t, v) => {
        if (v === 'true') {
            return true;
        }
        if (v === 'false') {
            return false;
        }
        throw new Error(`Cannot parse ${v} as boolean`);
    };

    this.visitText = (t, v) => v;

    this.visitFloat = (t, v) => parseFloat(v);

    this.visitNumber = (t, v) => BigInt(v);

    this.visitPrincipal = (t, v) => Principal.fromText(v);

    this.visitService = (t, v) => Principal.fromText(v);

    this.visitFunc = (t, v) => {
        const x = v.split('.', 2);
        return [Principal.fromText(x[0]), x[1]];
    }
}

export function getGeneralTypeRender() {
    return new RenderParamFactory();
}

export function getPrimitiveValueParser() {
    let parser = { ...new GeneralValueParser(), ...new PrimitiveValueParser() };
    console.log("primitive parser", parser);
    return parser;
}