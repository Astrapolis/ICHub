import { Principal } from "@dfinity/principal";
import { IDL } from "@dfinity/candid";
import * as CONSTANT from "../constant";
import { getFieldFromActor } from "./actorUtils";
import { IntClass } from "@dfinity/candid/lib/cjs/idl";

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

export function GeneralValueParser() {

    this.visitType = (t, d) => {
        return t.accept(new PrimitiveValueParser(), d);
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
        return t.accept(new PrimitiveValueParser(), d);
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
        // return this.visitConstruct(t, d);
        if (Object.prototype.toString.call(d) === '[object Array]') {
            let v = [];
            d.forEach((ele, index) => {
                console.log('vec ===>', ele, index);
                v[index] = ty.accept(new GeneralValueParser(), ele);
            });
            return v;
        } else {
            throw new Error("value is not array");
        }
    };

    this.visitOpt = (t, ty, d) => {

        let v = []; // null of opt rep
        if (d === null) {
            return v;
        } else {

            let value = ty.accept(new GeneralValueParser(), d);
            return [value];
        }
        // return this.visitConstruct(t, d);
    };

    this.visitRecord = (t, fields, d) => {
        const v = {};
        fields.forEach(([key, _], i) => {
            const value = _.accept(new GeneralValueParser(), d[key]);
            v[key] = value;
        });
        return v;
    };

    this.visitTuple = (t, components, d) => {
        const fields = components.map((ty, i) => [`_${i}_`, ty]);
        return this.visitRecord(t, fields, data);
    };

    this.visitVariant = (t, fields, d) => {

        if (typeof d === 'object' && d !== null) {
            let objectKey = Object.keys(d)[0];
            let keyIndex = fields.findIndex(([_, field]) => _ === objectKey);

            if (keyIndex >= 0) {
                let fieldIDL = fields[keyIndex][1];

                let v = fieldIDL.accept(new GeneralValueParser(), d[objectKey]);
                let value = {

                };
                value[objectKey] = v;
                return value;
            } else {
                return this.visitConstruct(t, d);
            }
        } else {
            this.visitConstruct(t, d);
        }
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
        if (typeof v === 'boolean') {
            return v;
        }
        if (typeof v === 'string') {
            if (v === 'true') {
                return true;
            }
            if (v === 'false') {
                return false;
            }
        }

        throw new Error(`Cannot parse ${v} as boolean`);
    };

    this.visitText = (t, v) => v;

    this.visitFloat = (t, v) => parseFloat(v);

    this.visitNumber = (t, v) => BigInt(v);

    this.visitPrincipal = (t, v) => typeof v === "string" ? Principal.fromText(v) : v;

    this.visitService = (t, v) => typeof v === "string" ? Principal.fromText(v) : v;

    this.visitFunc = (t, v) => {
        const x = v.split('.', 2);
        return [Principal.fromText(x[0]), x[1]];
    }
}

export function getGeneralTypeRender() {
    return new RenderParamFactory();
}

export function getPrimitiveValueParser() {
    let parser = new PrimitiveValueParser();
    // console.log("primitive parser", parser);
    return parser;
}

export function getGeneralValueParser() {
    let parser = new GeneralValueParser();
    return parser;
}


const valueParserMapper = {

};

valueParserMapper[CONSTANT.VALUE_PARSER_PRIMITIVE] = getPrimitiveValueParser;

export function getParserMap() {
    return valueParserMapper;
}

export function isMethodCallable(method) {
    console.log("isMethodCallable ==>", method);
    let valueValid = true;
    try {

        method.method[1].argTypes.forEach((argType, index) => {
            let paramValues = method.params[index];
            console.log('checking accept value', argType, paramValues);
            let probValue = argType.accept(new GeneralValueParser(), paramValues);
            // console.log('probValue ====>', probValue);
            if (!argType.covariant(probValue)) {
                // console.log('type check failed');
                valueValid = false;
            } else {
                // console.log('type check passed');
            }
        });
    } catch (err) {
        console.log("parse error", err);
        valueValid = false;
    }
    return valueValid;
}


export function getCallSpec(method) {
    let specs = [];
    method.method[1].argTypes.forEach((arg, index) => {
        let valueDesc = {
            type: arg.display(),
            value: arg.valueToString(arg.accept(getGeneralValueParser(), method.params[index]))
        };
        let valueObject = {
            // title: arg.display(),
            spec: JSON.stringify(valueDesc)
        }
        specs.push(valueObject);
    });
    return specs;
}

export function convertPathToJson(path, value) {
    let json = {};
    let ref = json;
    path.forEach((key, index) => {
        if (index < (path.length - 1)) {
            let obj = {};
            ref[key] = obj;
            ref = obj;
        } else {
            ref[key] = value;
        }
    });
    return json;

}
export function gothroughArgType(argIDL) {
    if (argIDL instanceof IDL.NullClass) {
        return null;
    }
    if (argIDL instanceof IDL.PrimitiveType) {
        return undefined;
    }
    if (argIDL instanceof IDL.RecordClass) {
        let subObject = {};
        return makeRecordTypeTemplateValue(argIDL, subObject);
    }
    if (argIDL instanceof IDL.VecClass) {
        return [];
    }

    if (argIDL instanceof IDL.OptClass) {
        return null;
    }

    if (argIDL instanceof IDL.VariantClass) {
        let subObject = {}
        let defaultKey = argIDL._fields[0][0];
        console.log('ready to gothrough variant class default key', defaultKey, argIDL._fields[0]);
        let defaultValue = gothroughArgType(argIDL._fields[0][1]);
        console.log('got default key value', defaultValue);
        subObject[defaultKey] = defaultValue;
        return subObject;
    }

}


export function makeRecordTypeTemplateValue(argIDL, rootObject) {
    argIDL._fields.forEach((field, index) => {
        let fieldName = field[0];
        let fieldIDL = field[1];
        rootObject[fieldName] = gothroughArgType(fieldIDL);
    });
    return rootObject;
}


export function constructMethodParamValueObjectTemplate(methodIDL) {
    if (methodIDL.argTypes.length === 0) {
        return;
    }
    let valueTemplate = [];

    methodIDL.argTypes.forEach((argIDL, index) => {
        valueTemplate[index] = gothroughArgType(argIDL);
    });

    return valueTemplate;

}