dfx canister create devhub
dfx build devhub
dfx generate devhub

dfx canister create ic_management
dfx generate ic_management

II_ENV=development dfx deploy internet_identity --no-wallet --argument '(null)'
dfx deploy microblog
dfx deploy hub_assets