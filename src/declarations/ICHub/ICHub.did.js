export const idlFactory = ({ IDL }) => {
  const CanisterCall = IDL.Record({
    'result' : IDL.Vec(IDL.Nat8),
    'canister_id' : IDL.Principal,
    'function_name' : IDL.Text,
    'params' : IDL.Vec(IDL.Nat8),
  });
  const CanisterConfig = IDL.Record({
    'canister_id' : IDL.Principal,
    'is_active' : IDL.Bool,
    'config' : IDL.Vec(IDL.Nat8),
  });
  const UserConfigDisplay = IDL.Record({
    'ui_config' : IDL.Vec(IDL.Nat8),
    'canister_calls' : IDL.Vec(CanisterCall),
    'user' : IDL.Principal,
    'canister_configs' : IDL.Vec(CanisterConfig),
    'calls_limit' : IDL.Nat16,
  });
  return IDL.Service({
    'cache_canister_calls' : IDL.Func([IDL.Vec(CanisterCall)], [], []),
    'cache_canister_config' : IDL.Func([IDL.Vec(CanisterConfig)], [], []),
    'cache_ui_config' : IDL.Func([IDL.Vec(IDL.Nat8)], [], []),
    'get_canister_calls' : IDL.Func(
        [IDL.Opt(IDL.Principal), IDL.Opt(IDL.Text), IDL.Opt(IDL.Nat16)],
        [IDL.Vec(CanisterCall)],
        ['query'],
      ),
    'get_user_config' : IDL.Func([], [UserConfigDisplay], ['query']),
    'user_init' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Vec(CanisterConfig)],
        [],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
