dfx canister create devhub
dfx build devhub
dfx generate devhub

dfx canister create ic_management
dfx generate ic_management

II_ENV=development dfx deploy internet_identity --no-wallet --argument '(null)'
dfx deploy microblog
dfx deploy hub_assets
dfx canister call renrk-eyaaa-aaaaa-aaada-cai register_new_canister '(10000000, 1000, "{version: 1};", true, 1000)'
