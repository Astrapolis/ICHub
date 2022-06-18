dfx canister create devhub
dfx build devhub
dfx generate devhub

dfx deploy hub_assets
dfx canister call 4xlse-oyaaa-aaaal-qa6zq-cai register_new_canister '(10_639_159_999_990, 1000, "{version: 1};", true, 1000)'