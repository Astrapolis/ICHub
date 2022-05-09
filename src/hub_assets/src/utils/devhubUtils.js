import { Principal } from "@dfinity/principal";

export function isCanisterInFollowList(userConfig, canisterIdString) {
    if (!userConfig || (!userConfig.Authenticated && !userConfig.UnAuthenticated)) {
        return false;
    }
    if (userConfig.Authenticated) {
        let bingo = userConfig.Authenticated.canister_configs.find(cfg => cfg.caninster_id.toText() === canisterIdString);
        if (bingo) {
            return true;
        }
    }
    if (userConfig.UnAuthenticated) {
        let bingo = userConfig.UnAuthenticated.canister_configs.find(cfg => cfg.caninster_id.toText() === canisterIdString);
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

export function getCanisterUIConfigFieldValue(canisterCfg, fieldPath) {
    if (canisterCfg.config[fieldPath] === undefined) {
        return '-';
    } else {
        return canisterCfg.config[fieldPath];
    }
}