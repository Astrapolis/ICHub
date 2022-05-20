import { Principal } from "@dfinity/principal";

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

export function extractCanisterCfgList(userConfig) {
    if (!userConfig || (!userConfig.Authenticated && !userConfig.UnAuthenticated)) {
        return [];
    }
    let list = userConfig.Authenticated ? userConfig.Authenticated.canister_configs : userConfig.UnAuthenticated.canister_configs;
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