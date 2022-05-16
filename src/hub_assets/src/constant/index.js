import { Principal } from "@dfinity/principal";
export const HUB_OFFICIAL_CONFIG = {
    canister_id: "abc",
    time_updated: 1000,
    is_active: true,
    is_public: true,
    config: "",
    meta_data: [
        {
            moudule_hash: [],
            controller:
                Principal.fromText(
                    "2al2t-2jbuy-tn5re-ay3mw-aimky-hqdgv-3rjgx-eepq2-yjkeb-bvxrl-hae"),
            time_updated: 12345,
            did_file: "",
        },
    ],
};

export const DEFAULT_CALL_LIMITS = 100;

export const DEFAULT_UI_CONFIG = {
    version: 1,
    caseSuites: []
};

export const DEFAULT_CANISTER_CONFIG = {
    canister_id: "abc",
    time_updated: 1000,
    is_active: true,
    is_public: true,
    config: "",
    meta_data: [
        JSON.stringify({
            moudule_hash: [],
            controller:
                Principal.fromText(
                    "2al2t-2jbuy-tn5re-ay3mw-aimky-hqdgv-3rjgx-eepq2-yjkeb-bvxrl-hae"
                ),
            time_updated: 12345,
            did_file: "",
        }),
    ],
}
