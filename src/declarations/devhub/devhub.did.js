export const idlFactory = ({ IDL }) => {
  const CallResult = IDL.Variant({
    'Authenticated' : IDL.Text,
    'UnAuthenticated' : IDL.Text,
  });
  const CanisterCallEvent = IDL.Record({
    'result' : IDL.Vec(IDL.Nat8),
    'caller' : IDL.Principal,
    'time_at' : IDL.Nat64,
  });
  const CanisterCall = IDL.Record({
    'canister_id' : IDL.Principal,
    'event' : IDL.Opt(CanisterCallEvent),
    'function_name' : IDL.Text,
    'params' : IDL.Text,
  });
  const CanisterConfig = IDL.Record({
    'canister_id' : IDL.Principal,
    'time_updated' : IDL.Nat64,
    'is_active' : IDL.Bool,
    'config' : IDL.Text,
    'meta_data' : IDL.Vec(IDL.Text),
  });
  const TestCaseView = IDL.Record({
    'tag' : IDL.Text,
    'canister_calls' : IDL.Vec(CanisterCall),
    'case_run_id' : IDL.Opt(IDL.Nat16),
    'config' : IDL.Text,
    'time_at' : IDL.Nat64,
  });
  const CacheTestResult = IDL.Variant({
    'Authenticated' : IDL.Nat16,
    'UnAuthenticated' : IDL.Text,
  });
  const GetCallResult = IDL.Variant({
    'Authenticated' : IDL.Vec(CanisterCall),
    'UnAuthenticated' : IDL.Text,
  });
  const UserStats = IDL.Record({
    'canister_configs_count' : IDL.Nat8,
    'canister_calls_count' : IDL.Nat32,
    'mem_size' : IDL.Opt(IDL.Nat32),
    'test_cases_count' : IDL.Nat16,
    'is_public_count' : IDL.Nat16,
    'users_count' : IDL.Nat16,
  });
  const StateMeta = IDL.Record({
    'is_public' : IDL.Bool,
    'user_configs_limit' : IDL.Nat16,
    'calls_limit' : IDL.Nat32,
  });
  const CanisterStateStats = IDL.Record({
    'agg_stats' : UserStats,
    'user_config_stats' : IDL.Vec(UserStats),
    'state_meta' : StateMeta,
  });
  const CaseFilteAll = IDL.Record({
    'limit' : IDL.Opt(IDL.Nat16),
    'is_distinct' : IDL.Bool,
  });
  const CaseFilteTag = IDL.Record({
    'tag' : IDL.Text,
    'limit' : IDL.Opt(IDL.Nat16),
  });
  const TestCaseFilter = IDL.Variant({
    'all' : CaseFilteAll,
    'tag' : CaseFilteTag,
    'case_run_id' : IDL.Nat16,
  });
  const GetTestResult = IDL.Variant({
    'Authenticated' : IDL.Vec(TestCaseView),
    'UnAuthenticated' : IDL.Text,
  });
  const UserConfigMeta = IDL.Record({
    'is_public' : IDL.Bool,
    'users' : IDL.Vec(IDL.Principal),
    'is_active' : IDL.Bool,
    'calls_limit' : IDL.Nat32,
  });
  const UserConfigView = IDL.Record({
    'ui_config' : IDL.Text,
    'canister_calls' : IDL.Vec(CanisterCall),
    'test_cases' : IDL.Vec(TestCaseView),
    'stats' : UserStats,
    'canister_configs' : IDL.Vec(CanisterConfig),
    'meta_data' : UserConfigMeta,
  });
  const GetConfigResult = IDL.Variant({
    'Authenticated' : UserConfigView,
    'UnAuthenticated' : IDL.Opt(IDL.Text),
  });
  return IDL.Service({
    'add_user_config' : IDL.Func([IDL.Text], [CallResult], []),
    'add_user_to_existing_user_config' : IDL.Func(
        [IDL.Nat16, IDL.Principal],
        [CallResult],
        [],
      ),
    'cache_canister_calls' : IDL.Func(
        [IDL.Nat16, IDL.Vec(CanisterCall)],
        [CallResult],
        [],
      ),
    'cache_canister_config' : IDL.Func(
        [IDL.Nat16, CanisterConfig],
        [CallResult],
        [],
      ),
    'cache_test_case' : IDL.Func(
        [IDL.Nat16, TestCaseView],
        [CacheTestResult],
        [],
      ),
    'cache_ui_config' : IDL.Func([IDL.Nat16, IDL.Text], [CallResult], []),
    'did_to_js' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'get_canister_calls' : IDL.Func(
        [
          IDL.Nat16,
          IDL.Opt(IDL.Principal),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Nat16),
        ],
        [GetCallResult],
        ['query'],
      ),
    'get_canister_state_stats' : IDL.Func([], [CanisterStateStats], ['query']),
    'get_principal' : IDL.Func([], [IDL.Principal], ['query']),
    'get_test_cases' : IDL.Func(
        [IDL.Nat16, TestCaseFilter, IDL.Opt(IDL.Bool)],
        [GetTestResult],
        ['query'],
      ),
    'get_user_config' : IDL.Func([IDL.Nat16], [GetConfigResult], ['query']),
    'get_user_config_stats' : IDL.Func([IDL.Nat16], [IDL.Opt(UserStats)], []),
    'init' : IDL.Func(
        [IDL.Principal, IDL.Nat32, IDL.Text, IDL.Bool, IDL.Nat16],
        [],
        [],
      ),
    'set_user_config_public' : IDL.Func(
        [IDL.Nat16, IDL.Bool],
        [CallResult],
        [],
      ),
    'update_state_meta' : IDL.Func([StateMeta], [CallResult], []),
  });
};
export const init = ({ IDL }) => { return []; };
