dfx canister create devhub
dfx build devhub
dfx generate devhub

dfx deploy --network=ic hub --with-cycles 170558782354
dfx deploy --network=ic hub_assets --with-cycles 170558782354
dfx canister call 4xlse-oyaaa-aaaal-qa6zq-cai register_new_canister '(139_159_999_990, 1000, "{version: 1};", true, 1000)'