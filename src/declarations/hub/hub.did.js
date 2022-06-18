export const idlFactory = ({ IDL }) => {
  const CallResult = IDL.Variant({
    'Authenticated' : IDL.Text,
    'UnAuthenticated' : IDL.Text,
  });
  const CanisterStateMeta = IDL.Record({
    'is_public' : IDL.Bool,
    'user_config_limit' : IDL.Nat16,
    'canister_id' : IDL.Principal,
    'calls_limit' : IDL.Nat32,
  });
  const CanisterStateView = IDL.Record({
    'user_state_meta' : CanisterStateMeta,
    'root_user' : IDL.Principal,
    'num_configs' : IDL.Nat16,
  });
  const UserConfigIndexView = IDL.Record({
    'canister_id' : IDL.Principal,
    'config_index' : IDL.Nat16,
  });
  const GetUserConfigsQueryResult = IDL.Variant({
    'Authenticated' : IDL.Vec(UserConfigIndexView),
    'UnAuthenticated' : IDL.Text,
  });
  const RegisterCanisterResult = IDL.Variant({
    'Ok' : UserConfigIndexView,
    'Err' : IDL.Text,
  });
  return IDL.Service({
    'add_user_to_existing_canister' : IDL.Func(
        [IDL.Principal],
        [CallResult],
        [],
      ),
    'add_user_to_existing_user_config' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat16],
        [CallResult],
        [],
      ),
    'did_to_js' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'get_public_canister_states' : IDL.Func(
        [],
        [IDL.Vec(CanisterStateView)],
        ['query'],
      ),
    'get_user_configs_by_user' : IDL.Func(
        [],
        [GetUserConfigsQueryResult],
        ['query'],
      ),
    'register_new_canister' : IDL.Func(
        [IDL.Nat64, IDL.Nat32, IDL.Text, IDL.Bool, IDL.Nat16],
        [RegisterCanisterResult],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
