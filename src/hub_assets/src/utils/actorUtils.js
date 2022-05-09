import { Actor, HttpAgent } from '@dfinity/agent';

export function is_local(agent) {
    // @ts-ignore
    const hostname = agent._host.hostname;
    return hostname === '127.0.0.1' || hostname.endsWith('localhost');
}

// const agent = new HttpAgent();
// if (is_local(agent)) {
//     agent.fetchRootKey();
// }

export function isLocalEnv() {
    return process.env.NODE_ENV !== "production";
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
    const url = `${origin}/_/candid?canisterId=${canisterId.toText()}&format=js`;
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
    console.log('candid_source', candid_source);
    return didToJs(candid_source, canisterId, agent);
}

// function getProfilerActor(canisterId) {
//     const profiler_interface = ({ IDL }) => IDL.Service({
//         __get_profiling: IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Int32, IDL.Int64))], ['query']),
//         __get_names: IDL.Func([], [IDL.Vec(IDL.Nat8)], ['query']),
//         __get_cycles: IDL.Func([], [IDL.Int64], ['query']),
//     });
//     return Actor.createActor(profiler_interface, { agent, canisterId });
// }

// const names = {};

// export async function getCycles(canisterId) {
//     try {
//         const actor = getProfilerActor(canisterId);
//         const cycles = await actor.__get_cycles();
//         return cycles;
//     } catch (err) {
//         return undefined;
//     }
// }

// export async function getNames(canisterId) {
//     try {
//         const actor = getProfilerActor(canisterId);
//         const blob = await actor.__get_names();
//         const decoded = IDL.decode([IDL.Vec(IDL.Tuple(IDL.Nat16, IDL.Text))], Uint8Array.from(blob))[0];
//         decoded.forEach(([id, name]) => names[id] = name);
//     } catch (err) {
//         return undefined;
//     }
// }

// export async function getProfiling(canisterId) {
//     try {
//         const actor = getProfilerActor(canisterId);
//         const info = await actor.__get_profiling();
//         return info;
//     } catch (err) {
//         console.log(err);
//         return undefined;
//     }
// }

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