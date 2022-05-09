dfx canister create devhub
dfx build devhub
dfx generate devhub
dfx canister stop devhub
dfx canister delete devhub

dfx canister create ic_management
dfx generate ic_management
dfx canister stop ic_management
dfx canister delete ic_management

II_ENV=development dfx deploy internet_identity --no-wallet --argument '(null)'
dfx deploy hub_assets