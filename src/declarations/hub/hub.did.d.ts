import type { Principal } from '@dfinity/principal';
export type CallResult = { 'Authenticated' : string } |
  { 'UnAuthenticated' : string };
export interface CanisterStateMeta {
  'is_public' : boolean,
  'user_config_limit' : number,
  'canister_id' : Principal,
  'calls_limit' : number,
}
export interface CanisterStateView {
  'user_state_meta' : CanisterStateMeta,
  'root_user' : Principal,
  'num_configs' : number,
}
export type GetUserConfigsQueryResult = {
    'Authenticated' : Array<UserConfigIndexView>
  } |
  { 'UnAuthenticated' : string };
export type RegisterCanisterResult = { 'Ok' : UserConfigIndexView } |
  { 'Err' : string };
export interface UserConfigIndexView {
  'canister_id' : Principal,
  'config_index' : number,
}
export interface _SERVICE {
  'add_user_to_existing_canister' : (arg_0: Principal) => Promise<CallResult>,
  'add_user_to_existing_user_config' : (
      arg_0: Principal,
      arg_1: Principal,
      arg_2: number,
    ) => Promise<CallResult>,
  'did_to_js' : (arg_0: string) => Promise<[] | [string]>,
  'get_public_canister_states' : () => Promise<Array<CanisterStateView>>,
  'get_user_configs_by_user' : () => Promise<GetUserConfigsQueryResult>,
  'register_new_canister' : (
      arg_0: bigint,
      arg_1: number,
      arg_2: string,
      arg_3: boolean,
      arg_4: number,
    ) => Promise<RegisterCanisterResult>,
}
