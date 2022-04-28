import type { Principal } from '@dfinity/principal';
export interface CanisterCall {
  'result' : Array<number>,
  'canister_id' : Principal,
  'function_name' : string,
  'params' : Array<number>,
}
export interface CanisterConfig {
  'canister_id' : Principal,
  'is_active' : boolean,
  'config' : Array<number>,
}
export interface UserConfigDisplay {
  'ui_config' : Array<number>,
  'canister_calls' : Array<CanisterCall>,
  'user' : Principal,
  'canister_configs' : Array<CanisterConfig>,
  'calls_limit' : number,
}
export interface _SERVICE {
  'cache_canister_calls' : (arg_0: Array<CanisterCall>) => Promise<undefined>,
  'cache_canister_config' : (arg_0: Array<CanisterConfig>) => Promise<
      undefined
    >,
  'cache_ui_config' : (arg_0: Array<number>) => Promise<undefined>,
  'get_canister_calls' : (
      arg_0: [] | [Principal],
      arg_1: [] | [string],
      arg_2: [] | [number],
    ) => Promise<Array<CanisterCall>>,
  'get_user_config' : () => Promise<UserConfigDisplay>,
  'user_init' : (arg_0: Array<number>, arg_1: Array<CanisterConfig>) => Promise<
      undefined
    >,
}
