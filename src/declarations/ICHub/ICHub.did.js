export const idlFactory = ({ IDL }) => {
  const CanisterCall = IDL.Record({
    'result' : IDL.Vec(IDL.Nat8),
    'canister_id' : IDL.Principal,
    'function_name' : IDL.Text,
    'params' : IDL.Text,
  });
  const CacheResult = IDL.Variant({
    'Authenticated' : IDL.Text,
    'UnAuthenticated' : IDL.Text,
  });
  const CanisterMeta = IDL.Record({
    'controller' : IDL.Principal,
    'moudule_hash' : IDL.Vec(IDL.Nat8),
    'did_file' : IDL.Text,
    'time_updated' : IDL.Nat64,
  });
  const CanisterConfig = IDL.Record({
    'is_public' : IDL.Bool,
    'canister_id' : IDL.Principal,
    'time_updated' : IDL.Nat64,
    'is_active' : IDL.Bool,
    'config' : IDL.Text,
    'meta_data' : IDL.Vec(CanisterMeta),
  });
  const GetCallResult = IDL.Variant({
    'Authenticated' : IDL.Vec(CanisterCall),
    'UnAuthenticated' : IDL.Text,
  });
  const UserConfigViewPrivate = IDL.Record({
    'ui_config' : IDL.Text,
    'canister_calls' : IDL.Vec(CanisterCall),
    'user' : IDL.Principal,
    'canister_configs' : IDL.Vec(CanisterConfig),
    'calls_limit' : IDL.Nat32,
  });
  const UserConfigViewPublic = IDL.Record({
    'ui_config' : IDL.Text,
    'user' : IDL.Principal,
    'canister_configs' : IDL.Vec(CanisterConfig),
  });
  const GetConfigResult = IDL.Variant({
    'Authenticated' : UserConfigViewPrivate,
    'UnAuthenticated' : UserConfigViewPublic,
  });
  return IDL.Service({
    'cache_canister_calls' : IDL.Func(
        [IDL.Vec(CanisterCall)],
        [CacheResult],
        [],
      ),
    'cache_canister_config' : IDL.Func(
        [IDL.Vec(CanisterConfig)],
        [CacheResult],
        [],
      ),
    'cache_ui_config' : IDL.Func([IDL.Text], [CacheResult], []),
    'did_to_js' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'get_canister_calls' : IDL.Func(
        [IDL.Opt(IDL.Principal), IDL.Opt(IDL.Text), IDL.Opt(IDL.Nat16)],
        [GetCallResult],
        ['query'],
      ),
    'get_principal': IDL.Func([], [IDL.Principal], ['query']),  
    'get_user_config' : IDL.Func([], [GetConfigResult], ['query']),
    'user_init' : IDL.Func(
        [IDL.Nat32, IDL.Text, IDL.Vec(CanisterConfig)],
        [],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
