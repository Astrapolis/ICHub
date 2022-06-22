# ICHub: Trigger the singularity of IC smart contracts development

## Candid+ - Better Candid UI with II, testcases and logging

## Inspiration
Candid UI, the most used tool when developing IC smart contracts, is handy and simple. However, when we are actively testing or inspecting the canisters, oftentimes we have to repetitively type the canister ids, method names, and parameters. In addition, the current setup makes the testing irreproducible, which slows down the overall development process.  Learning from our own development experience, we decided to make up the missing features of candid UI to allow developers to subscribe to canisters, store history calls, and compose test cases entirely on IC.
What it does

## What it does
Candid + allows the users to keep track of the canisters they wish to test or inspect by simply subscribing through the canister ids.  Once subscribed, users can call the methods on those canisters just like they do with candid UI, while candid+ will keep track of all the call histories. Those canister calls can be organized as test cases to allow more comprehensive testing and reproducible debugging. Developers can choose to share those test cases for better development transparency. To be noticed, all data is stored on IC blockchain with complete permission management.

Subscribe Canister => Call Methods => Compose Test Cases (Entirely on IC)

## Features
- shared canisters : users are free to use with full privacy protected with Internet Identity
- Private canisters : dedicated canister with full control
- share testcases : share test cases with others to help review and debug

## What's next for Candid+
- Candid+ is the first application of ICHub, the epic center for IC developers.
- Candid+ Chrome App: it will be a simple Chrome app that allows developers to test their canisters locally without connecting to the IC mainnet
- Geek Space: By integrating with canisters, test cases, and project descriptions, developers can demonstrate and discuss their canisters and code for coworking and reproducible debugging.
- Canister Manager: tools like create canister, install code, delete, charge cycles, etc
- Canister Monitor: Monitoring the canister for module hash changes, cycle balance, memory usage, etc.
- Canister Market Place: Enable canisters to stake neurons and trade canisters like NFTs 


## Running the project locally
```
# Starts the replica & remove history
dfx -qqq start --clean

# Deploys your canisters to the replica and generates your candid interface
./install.sh
```