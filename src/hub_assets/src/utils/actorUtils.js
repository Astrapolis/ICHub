import { Actor, HttpAgent } from '@dfinity/agent';
import { IDL } from "@dfinity/candid";


export function isLocalEnv() {
    // return process.env.NODE_ENV !== "production";
    return false;
}

async function didToJs(candid_source, canisterId, agent) {
    const didjs_id = canisterId;
    const didjs_interface = ({ IDL }) => IDL.Service({
        did_to_js: IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    });
    const didjs = Actor.createActor(didjs_interface, { agent, canisterId: didjs_id });
    console.log("didjs", didjs);
    const js = await didjs.did_to_js(candid_source);
    if (js === []) {
        return undefined;
    }
    return js[0];
}

async function getLocalDidJs(canisterId) {
    const origin = window.location.origin;
    let canisterIdString = null;
    if (typeof canisterId != "string") {
        canisterIdString = canisterId.toText();
    } else {
        canisterIdString = canisterId;
    }
    const url = `${origin}/_/candid?canisterId=${canisterIdString}&format=js`;
    const response = await fetch(url);
    if (!response.ok) {
        return undefined;
    }
    return response.text();
}

async function getRemoteDidJs(canisterId, agent) {
    if (!canisterId) {
        throw 'can not fetch actor for null canister id';
    }

    const common_interface = ({ IDL }) => IDL.Service({
        __get_candid_interface_tmp_hack: IDL.Func([], [IDL.Text], ['query']),
    });

    const actor = Actor.createActor(common_interface, { agent, canisterId });
    const candid_source = await actor.__get_candid_interface_tmp_hack();
    // console.log('candid_source', candid_source);
    return didToJs(candid_source, canisterId, agent);
}



export async function getActorFromCanisterId(canisterId, agent) {
    if (!canisterId) {
        throw 'can not fetch actor for null canister id';
    }
    let js;
    try {
        js = await getRemoteDidJs(canisterId, agent);
    } catch (err) {
        console.log('getRemoteDidJs error', err);
        if (/no query method/.test(err)) {
            js = await getLocalDidJs(canisterId);
        } else {
            throw (err);
        }
    }

    if (!js) {
        throw new Error('Cannot fetch candid file');
    }
    const dataUri = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(js);
    const candid = await eval('import("' + dataUri + '")');
    return Actor.createActor(candid.idlFactory, { agent, canisterId });
}

export function getFieldFromActor(actor, methodName) {
    if (!(actor && methodName)) return undefined;
    return Actor.interfaceOf(actor)._fields.find((f) => {
        return f[0] === methodName;
    });
}

export function getFieldNormalizedResult(field, callResult) {
    if (!field) return;
    let result;
    if (field.retTypes.length === 0) {
        result = [];
    } else if (field.retTypes.length === 1) {
        result = [callResult];
    } else {
        result = callResult;
    }

    return IDL.FuncClass.argsToString(field.retTypes,result);
}

export function getFuncArgsNormalizedForm(field, values) {
    return IDL.FuncClass.argsToString(field.argTypes, values);
}