use ic_cdk::export::candid::{Deserialize, Principal, CandidType, candid_method, IDLProg, TypeEnv, check_prog};
use serde::Serialize;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::string::String;
use ic_cdk_macros;
use ic_cdk::api;
mod management;

thread_local! {
    pub static REGISTRY: std::cell::RefCell<Registry>  = 
    RefCell::new(Registry::new());
}

const STORAGE_WASM: &[u8] =std::include_bytes!("../../../.dfx/local/canisters/ICHub/ICHub.wasm");

#[derive(CandidType)]
pub enum CallResult<T, U> {
    Authenticated(T),
    UnAuthenticated(U)
}

pub enum CanisterStatsAction {
    Follow,
    UnFollow,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct CanisterStats {
    followers : u64,
}

    
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct CanisterHub {
    canister_stats : HashMap<Principal, CanisterStats>,
}

impl CanisterHub {
    pub fn update_canister_stats(&mut self, canister_id: Principal, action : CanisterStatsAction) {
        match action {
            CanisterStatsAction::Follow => {
                self.canister_stats.entry(canister_id)
                .and_modify(|canister_stat| canister_stat.followers += 1)
                .or_insert(CanisterStats{followers: 1});                
            }
            CanisterStatsAction::UnFollow => {
                self.canister_stats.entry(canister_id)
                .and_modify(|canister_stat| canister_stat.followers -= 1);            
            }            
        }
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
    pub struct Registry {
    //map<user_id, vec<canister_id>>
    registry : HashMap<Principal, Vec<Principal>>,
    existing_canister_ids: HashSet<Principal>
}

impl Registry{
    pub fn new() -> Self{
        Registry{
            registry: HashMap::new(),
            existing_canister_ids: HashSet::new()
        }
    }

    fn user_is_authenticated(& self, user : Principal) -> bool{
        self.registry.contains_key(&user)
    }

    fn canister_is_authenticated(& self, user : Principal) -> bool{
        self.existing_canister_ids.contains(&user)
    }

    fn add_canister_for_user(&mut self, canister_id: Principal, user: Principal) {
        self.registry.entry(user)
                     .and_modify(|canister_ids| {canister_ids.push(canister_id)})
                     .or_insert(vec![canister_id]);
        self.existing_canister_ids.insert(canister_id);
    }
}

async fn create_n_install_new_canister(user_id : Principal, cycles: u64) -> Result<Principal, String>{
    let create_canister_config = management::CreateCanisterArgs{
        cycles,
        settings: management::CanisterSettings{
            controllers: Some(vec![user_id]),
            compute_allocation: None,
            memory_allocation: None,
            freezing_threshold: None
        }
    };
    match management::create_canister(create_canister_config).await {
        Ok(canister_id) => {
            match management::install_canister(&canister_id, STORAGE_WASM.to_vec(), Vec::new()).await {
                Ok(_) => {
                    Ok(canister_id)
                }
                Err(msg) => Err(msg)                    
            }
        },
        Err(msg) => Err(msg)
    }
}

//create and install canister for end user
#[ic_cdk_macros::update(name = "register_new_canister")]
#[candid_method(update, rename = "register_new_canister")]
async fn register_new_canister(cycles: u64)-> Result<Principal, String>{
    let user = api::caller();
    match create_n_install_new_canister(user, cycles).await {
        Ok(canister_id) => {
            REGISTRY.with(|registry|  {
                let mut registry = registry.borrow_mut();
                registry.add_canister_for_user(canister_id, user);
                Ok(canister_id)
            })
        }
        Err(msg) => {
            Err(msg)
        }
    }
}

#[ic_cdk_macros::update(name = "add_user_to_existing_canister")]
#[candid_method(update, rename = "add_user_to_existing_canister")]
async fn add_user_to_existing_canister(user : Principal)-> CallResult<String, String>{
    let canister_id = api::caller();
    REGISTRY.with(|registry|  {
        let mut registry = registry.borrow_mut();
        match registry.canister_is_authenticated(canister_id) {
            true => {
                registry.add_canister_for_user(canister_id, user);
                CallResult::Authenticated(format!("{} is added as an user for canister {}", user.to_string(), canister_id.to_string()))
            }
            false => {
                CallResult::UnAuthenticated(format!("{} is not a hub canister", canister_id.to_string()))
            }
        }
    }
    )
}

#[ic_cdk_macros::query(name = "get_canisters_by_user")]
#[candid_method(query, rename = "get_canisters_by_user")]
fn get_canisters_by_user() -> CallResult<Vec<Principal>, String>{
    let user = api::caller();
    REGISTRY.with(|registry|  {
        let registry = registry.borrow_mut();
        match registry.user_is_authenticated(user) {
            true => {
                CallResult::Authenticated(registry.registry.get(&user).unwrap().clone())
            }
            false => {
                CallResult::UnAuthenticated(format!("{} is not a hub user", user.to_string()))
            }
        }
    }     
    )
}

#[ic_cdk_macros::query(name = "did_to_js")]
#[candid_method(query, rename = "did_to_js")]
fn did_to_js(prog: String) -> Option<String> {
    let ast = prog.parse::<IDLProg>().ok()?;
    let mut env = TypeEnv::new();
    let actor = check_prog(&mut env, &ast).ok()?;
    let res = ic_cdk::export::candid::bindings::javascript::compile(&env, &actor);
    Some(res)
}

candid::export_service!();

#[ic_cdk_macros::query(name = "__get_candid_interface_tmp_hack")]
#[candid_method(query, rename = "__get_candid_interface_tmp_hack")]
fn __get_candid_interface_tmp_hack() -> String {
    __export_service()
}
