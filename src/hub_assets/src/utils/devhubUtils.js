import { message } from "antd";
import { Principal } from "@dfinity/principal";
import { BigNumber } from "bignumber.js";
import { getActorFromCanisterId } from "./actorUtils";

export function isCanisterInFollowList(userConfig, canisterIdString) {
    if (!userConfig || (!userConfig.Authenticated && !userConfig.UnAuthenticated)) {
        return false;
    }
    if (userConfig.Authenticated) {
        let bingo = userConfig.Authenticated.canister_configs.find(cfg => cfg.canister_id.toText() === canisterIdString);
        if (bingo) {
            return true;
        }
    }
    if (userConfig.UnAuthenticated) {
        let bingo = userConfig.UnAuthenticated.canister_configs.find(cfg => cfg.canister_id.toText() === canisterIdString);
        if (bingo) {
            return true;
        }
    }
    return false;
}

export function extractCanisterCfgList(userConfig, noCheck) {
    if (noCheck) {
        let list = userConfig.canister_configs;
        list.forEach(entry => entry.config = typeof entry.config === "string" ? JSON.parse(entry.config) : entry.config);

        return list;
    }
    if (!userConfig || !userConfig.Authenticated) {
        return [];
    }
    let list = userConfig.Authenticated.canister_configs;
    list.forEach(entry => entry.config = JSON.parse(entry.config));

    return list;
}

export function extractUICfg(userConfig) {
    if (!userConfig || (!userConfig.Authenticated && !userConfig.UnAuthenticated)) {
        throw "invalid ui config result";
    }
    if (userConfig.UnAuthenticated) {
        throw "permission denied";
    }

    return JSON.parse(userConfig.Authenticated.ui_config);
}

export function getCanisterUIConfigFieldValue(canisterCfg, fieldPath) {
    return canisterCfg.config[fieldPath];
}

export function convertTimestampToBigInt(ts) {
    return ts * 1000000;
}

export function convertBignumberToDate(bn) {
    let big = new BigNumber(bn).dividedBy(1000000).toFixed(0);
    let d = new Date(parseInt(big));
    return d;
}

export function getUserActiveConfigIndex(user) {
    return user.devhubs[0].config_index;
}


export const getCanisterList = async (user, needActor) => {

    try {
        let userConfig = user.devhubConfig;
        if (!userConfig) return [];
        //  await user.devhubActor.get_user_config(getUserActiveConfigIndex(user));
        // if (userConfig.UnAuthenticated) {
        //     console.log('list failed', userConfig.UnAuthenticated);
        //     message.error(userConfig.UnAuthenticated)
        //     return [];
        // } else {
        let canisterList = extractCanisterCfgList(userConfig, true);
        let data = [];
        // canisterList.forEach((entry, index) => {
        //     let row = {
        //         name: entry.config.name,
        //         canisterId: entry.canister_id.toText(),
        //         historyCalls: 0,
        //         lastCallAt: 0
        //     }
        //     data.push(row);
        // });
        for (const [index, entry] of canisterList.entries()) {
            let row = {
                name: entry.config.name,
                canisterId: entry.canister_id.toText(),
                historyCalls: 0,
                lastCallAt: 0
            }
            if (needActor) {
                try {
                    let actor = await getActorFromCanisterId(row.canisterId, user.agent);
                    if (actor) {
                        row.actor = actor;
                    }
                } catch (err) {
                    console.log('get canister actor failed', err);
                }
            }

            data.push(row);
        }
        console.log('canister list ===>', data);
        return data;
        // }

        // TODO: extract call history summary data

    } catch (err) {
        console.log('get canister list failed', err)
        message.error('get canister list failed ' + err);
    }
    return [];
}
