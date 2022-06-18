import type { Principal } from '@dfinity/principal';
export type CacheTestResult = { 'Authenticated' : number } |
  { 'UnAuthenticated' : string };
export type CallResult = { 'Authenticated' : string } |
  { 'UnAuthenticated' : string };
export interface CanisterCall {
  'canister_id' : Principal,
  'event' : [] | [CanisterCallEvent],
  'function_name' : string,
  'params' : string,
}
export interface CanisterCallEvent {
  'result' : Array<number>,
  'caller' : Principal,
  'time_at' : bigint,
}
export interface CanisterConfig {
  'canister_id' : Principal,
  'time_updated' : bigint,
  'is_active' : boolean,
  'config' : string,
  'meta_data' : Array<string>,
}
export interface CanisterStateStats {
  'agg_stats' : UserStats,
  'user_config_stats' : Array<UserStats>,
  'state_meta' : StateMeta,
}
export interface CaseFilteAll {
  'limit' : [] | [number],
  'is_distinct' : boolean,
}
export interface CaseFilteTag { 'tag' : string, 'limit' : [] | [number] }
export type GetCallResult = { 'Authenticated' : Array<CanisterCall> } |
  { 'UnAuthenticated' : string };
export type GetConfigResult = { 'Authenticated' : UserConfigView } |
  { 'UnAuthenticated' : [] | [string] };
export type GetTestResult = { 'Authenticated' : Array<TestCaseView> } |
  { 'UnAuthenticated' : string };
export interface StateMeta {
  'is_public' : boolean,
  'user_configs_limit' : number,
  'calls_limit' : number,
}
export type TestCaseFilter = { 'all' : CaseFilteAll } |
  { 'tag' : CaseFilteTag } |
  { 'case_run_id' : number };
export interface TestCaseView {
  'tag' : string,
  'canister_calls' : Array<CanisterCall>,
  'case_run_id' : [] | [number],
  'config' : string,
  'time_at' : bigint,
}
export interface UserConfigMeta {
  'is_public' : boolean,
  'users' : Array<Principal>,
  'is_active' : boolean,
  'calls_limit' : number,
}
export interface UserConfigView {
  'ui_config' : string,
  'canister_calls' : Array<CanisterCall>,
  'test_cases' : Array<TestCaseView>,
  'stats' : UserStats,
  'canister_configs' : Array<CanisterConfig>,
  'meta_data' : UserConfigMeta,
}
export interface UserStats {
  'canister_configs_count' : number,
  'canister_calls_count' : number,
  'mem_size' : [] | [number],
  'test_cases_count' : number,
  'is_public_count' : number,
  'users_count' : number,
}
export interface _SERVICE {
  'add_user_config' : (arg_0: string) => Promise<CallResult>,
  'add_user_to_existing_user_config' : (
      arg_0: number,
      arg_1: Principal,
    ) => Promise<CallResult>,
  'cache_canister_calls' : (
      arg_0: number,
      arg_1: Array<CanisterCall>,
    ) => Promise<CallResult>,
  'cache_canister_config' : (arg_0: number, arg_1: CanisterConfig) => Promise<
      CallResult
    >,
  'cache_test_case' : (arg_0: number, arg_1: TestCaseView) => Promise<
      CacheTestResult
    >,
  'cache_ui_config' : (arg_0: number, arg_1: string) => Promise<CallResult>,
  'did_to_js' : (arg_0: string) => Promise<[] | [string]>,
  'get_canister_calls' : (
      arg_0: number,
      arg_1: [] | [Principal],
      arg_2: [] | [string],
      arg_3: [] | [number],
    ) => Promise<GetCallResult>,
  'get_canister_state_stats' : () => Promise<CanisterStateStats>,
  'get_principal' : () => Promise<Principal>,
  'get_test_cases' : (
      arg_0: number,
      arg_1: TestCaseFilter,
      arg_2: [] | [boolean],
    ) => Promise<GetTestResult>,
  'get_user_config' : (arg_0: number) => Promise<GetConfigResult>,
  'get_user_config_stats' : (arg_0: number) => Promise<[] | [UserStats]>,
  'init' : (
      arg_0: Principal,
      arg_1: number,
      arg_2: string,
      arg_3: boolean,
      arg_4: number,
    ) => Promise<undefined>,
  'set_user_config_public' : (arg_0: number, arg_1: boolean) => Promise<
      CallResult
    >,
  'update_state_meta' : (arg_0: StateMeta) => Promise<CallResult>,
}
