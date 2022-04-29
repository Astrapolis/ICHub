import type { Principal } from '@dfinity/principal';
export type CacheResult = { 'Authenticated' : string } |
  { 'UnAuthenticated' : string };
export interface CanisterCall {
  'result' : Array<number>,
  'canister_id' : Principal,
  'function_name' : string,
  'params' : string,
}
export interface CanisterConfig {
  'is_public' : boolean,
  'canister_id' : Principal,
  'time_updated' : bigint,
  'is_active' : boolean,
  'config' : string,
  'meta_data' : Array<CanisterMeta>,
}
export interface CanisterMeta {
  'controller' : Principal,
  'moudule_hash' : Array<number>,
  'did_file' : string,
  'time_updated' : bigint,
}
export type GetCallResult = { 'Authenticated' : Array<CanisterCall> } |
  { 'UnAuthenticated' : string };
export type GetConfigResult = { 'Authenticated' : UserConfigViewPrivate } |
  { 'UnAuthenticated' : UserConfigViewPublic };
export interface UserConfigViewPrivate {
  'ui_config' : string,
  'canister_calls' : Array<CanisterCall>,
  'user' : Principal,
  'canister_configs' : Array<CanisterConfig>,
  'calls_limit' : number,
}
export interface UserConfigViewPublic {
  'ui_config' : string,
  'user' : Principal,
  'canister_configs' : Array<CanisterConfig>,
}
export interface _SERVICE {
  'cache_canister_calls' : (arg_0: Array<CanisterCall>) => Promise<CacheResult>,
  'cache_canister_config' : (arg_0: Array<CanisterConfig>) => Promise<
      CacheResult
    >,
  'cache_ui_config' : (arg_0: string) => Promise<CacheResult>,
  'did_to_js' : (arg_0: string) => Promise<[] | [string]>,
  'get_canister_calls' : (
      arg_0: [] | [Principal],
      arg_1: [] | [string],
      arg_2: [] | [number],
    ) => Promise<GetCallResult>,
  'get_user_config' : () => Promise<GetConfigResult>,
  'user_init' : (
      arg_0: number,
      arg_1: string,
      arg_2: Array<CanisterConfig>,
    ) => Promise<undefined>,
}
