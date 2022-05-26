# hub
hub is the ultimate on-chain suites to manage and test canisters.

## a user devhub can be created by 
- `register_new_canister` : which creates a dedicated canister
- `add_user_to_existing_canister`: which creates a user devhub on an existing canister

## add a user to existing devhub
- `add_user_to_existing_user_config`: invite a team member to existing devhub

## once a devhub is created, the devhub can be accessed through
- `get_user_configs_by_user -> UserConfigIndexView {canister_id : Principal,config_index: u16}` : which queries the devhubs owned by user
- `get_user_config(user_config_index: u16) -> CallResult<UserConfigViewPrivate, UserConfigViewPublic>`: with `canister_id` and `user_config_index`, we can query the devhub created by user
- `cache_canister_config`: follows a new canister, or modify the followed canister
- `cache_test_case -> Result<u16, String>`: create a new testcase, or modify the existing testcase, returns the test_case_id
- `get_test_cases`: query the testcases by `tag` or `test_case_id`

```bash
cd devhub/
dfx help
dfx config --help
```

## Running the project locally

If you want to test your project locally, you can use the following commands:

```bash
# Starts the replica & remove history
dfx -qqq start --clean

# Deploys your canisters to the replica and generates your candid interface
./install.sh
```

Once the job completes, your application will be available at `http://localhost:8000?canisterId={asset_canister_id}`.

