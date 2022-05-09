dfx canister create devhub
dfx build devhub
dfx generate devhub
II_ENV=development dfx deploy internet_identity --no-wallet --argument '(null)'
dfx deploy hub_assets