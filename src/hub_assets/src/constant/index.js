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
};

export const DEFAULT_USER_CONFIG_LIMIT = 32;

export const RENDER_TYPE = "visitType";
export const RENDER_NULL = "visitNull";
export const RENDER_RECORD = "visitRecord";
export const RENDER_TUPLE = "visitTuple";
export const RENDER_VARIANT = "visitVariant";
export const RENDER_OPT = "visitOpt";
export const RENDER_VEC = "visitVec";
export const RENDER_REC = "visitRec";

export const RENDER_PRIMITIVE = "visitPrimitive";
export const RENDER_EMPTY = "visitEmpty";
export const RENDER_BOOL = "visitBool";
export const RENDER_RESERVED = "visitReserved";
export const RENDER_TEXT = "visitText";
export const RENDER_NUMBER = "visitNumber";
export const RENDER_INT = "visitInt";
export const RENDER_NAT = "visitNat";

export const RENDER_FLOAT = "visitFloat";
export const RENDER_FIXEDINT = "visitFixedInt";
export const RENDER_FIXEDNAT = "visitFixedNat";
export const RENDER_PRINCIPAL = "visitPrincipal";
export const RENDER_FUNC = "visitFunc";
export const RENDER_SERVICE = "visitService";

export const VALUE_PARSER_PRIMITIVE = "PrimitiveValueParser";
export const VALUE_PARSER_RECORD = "RecordValueParser";

export const HUB_USER_CONTEXT_KEY = "ichub_user_profile_key";