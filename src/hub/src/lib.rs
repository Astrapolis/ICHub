use ic_cdk::export::candid::{Deserialize, Principal, CandidType, candid_method, encode_args};
use serde::Serialize;
use std::cell::RefCell;
use std::collections::{HashMap};
use std::string::String;
use ic_cdk_macros;
use ic_cdk::api;
use ic_cdk::api::stable::{stable_bytes, StableWriter};
mod management;

thread_local! {
    pub static REGISTRY: std::cell::RefCell<Registry>  = 
    RefCell::new(Registry::new());
}

const STORAGE_WASM: &[u8] =std::include_bytes!("../../../target/wasm32-unknown-unknown/release/devhub.wasm");

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

#[derive(Deserialize, Serialize, Debug, Clone, CandidType, PartialEq, Eq)]
pub struct UserConfigIndex {
    canister_index : u16,
    // 0 means the user created the user config, root user
    config_index: u16,
}

#[derive(CandidType)]
pub struct UserConfigIndexView {
    canister_id : Principal,
    config_index: u16,
}

#[derive(CandidType)]
pub struct CanisterStateView {
    user_state_meta : CanisterStateMeta,
    //[true, false, true] true mark for active userconfig
    num_configs: u16,
    root_user: Principal
}

#[derive(Deserialize, Serialize, Debug, Clone,)]
pub struct CanisterState {
    user_state_meta : CanisterStateMeta,
    //[true, false, true] true mark for active userconfig
    configs: Vec<UserConfigMeta>
}

#[derive(Deserialize, Serialize, Debug, Clone, CandidType)]
pub struct CanisterStateMeta {
    canister_id : Principal,
    is_public : bool,
    user_config_limit : u16,
    calls_limit: u32,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct UserConfigMeta {
    users : Vec<Principal>,
    is_active : bool
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Registry {
    //map<user_id, vec<canister_id>>
    user_registry : HashMap<Principal, Vec<UserConfigIndex>>,
    //map<canister_id, user_state_meta>
    canister_registry: Vec<CanisterState>
}

impl Default for Registry {
    fn default() -> Self {
        Self { user_registry: HashMap::new(), canister_registry: Vec::new() }
    }
}

impl Registry{
    pub fn new() -> Self{
        Registry{
            user_registry: HashMap::new(),
            canister_registry: Vec::new()
        }
    }

    fn user_is_authenticated(& self, user : &Principal, user_config_index : &UserConfigIndex) -> bool{
        match self.user_registry.get(user) {
            Some(v) => {
                 v.contains(user_config_index) 
                }
            None => false
            }
        }

    // check if certain canister_id exsits, none if not, index if exists
    fn canister_is_authenticated(& self, canister_id : Principal) -> Option<usize>{
        self.canister_registry.iter().position(|state| state.user_state_meta.canister_id == canister_id)
    }

    fn insert_user_registry(&mut self, user: Principal, user_config_index : UserConfigIndex) {
        self.user_registry.entry(user)
                     .and_modify(|user_configs| {user_configs.push(user_config_index.clone())})
                     .or_insert(vec![user_config_index.clone()]);
    }

    fn insert_canister_registry(&mut self, user_state_meta : CanisterStateMeta, user_config_meta : UserConfigMeta) -> UserConfigIndex{
        match self.canister_registry.iter().position(|state| state.user_state_meta.canister_id == user_state_meta.canister_id) {
            None => {
                self.canister_registry.push(CanisterState{user_state_meta, configs: vec![user_config_meta]});
                UserConfigIndex{canister_index: (self.canister_registry.len() - 1) as u16, config_index: 0}
            }
            Some(state_index) => {
                let configs = &mut self.canister_registry[state_index].configs;
                configs.push(user_config_meta);
                UserConfigIndex{ canister_index: state_index as u16, config_index: (configs.len() - 1) as u16 }
            }
        }
    } 
}

async fn create_n_install_new_canister(user_id : Principal, cycles: u64, calls_limit : u32, ui_config : String, is_public : bool, user_configs_limit : u16) -> Result<Principal, String>{
    let create_canister_config = management::CreateCanisterArgs{
        cycles,
        settings: management::CanisterSettings{
            controllers: Some(vec![api::id(), user_id]),
            compute_allocation: None,
            memory_allocation: None,
            freezing_threshold: None
        }
    };
    match management::create_canister(create_canister_config).await {
        Ok(canister_id_record) => {
            match encode_args((user_id, calls_limit, ui_config, is_public, user_configs_limit)) {
                Ok(args) => {
                    match management::install_canister(&canister_id_record.canister_id, STORAGE_WASM.to_vec(), args).await {
                        Ok(_) => {
                            Ok(canister_id_record.canister_id)
                        }
                        Err(msg) => Err(msg)                    
                    }                    
                }
                Err(msg) => {
                    Err(msg.to_string())
                }
            } 
        },
        Err(msg) => Err(msg)
    }
}

//create and install canister for end user
#[ic_cdk_macros::update(name = "register_new_canister")]
#[candid_method(update, rename = "register_new_canister")]
async fn register_new_canister(cycles: u64, calls_limit : u32, ui_config : String, 
                                is_public : bool, user_config_limit : u16)-> Result<UserConfigIndexView, String>{
    let user = api::caller();
    match create_n_install_new_canister(user, cycles, calls_limit, ui_config, is_public, user_config_limit).await {
        Ok(canister_id) => {
            REGISTRY.with(|registry|  {
                let mut registry = registry.borrow_mut();

                let user_config_index = registry.insert_canister_registry(
                    CanisterStateMeta {canister_id, is_public, user_config_limit,calls_limit},
                    UserConfigMeta{is_active: true, users: vec![user]}
                );
                registry.insert_user_registry(user, user_config_index.clone());
                Ok(UserConfigIndexView{canister_id, config_index: 0})
            })
        }
        Err(msg) => {
            Err(msg)
        }
    }
}

#[ic_cdk_macros::update(name = "add_user_to_existing_user_config")]
#[candid_method(update, rename = "add_user_to_existing_user_config")]
async fn add_user_to_existing_user_config(existing_user: Principal, new_user : Principal, config_index: u16)-> CallResult<String, String>{
    let canister_id = api::caller();    
    REGISTRY.with(|registry|  {
        let mut registry = registry.borrow_mut();
        match registry.canister_is_authenticated(canister_id) {
            None => {CallResult::UnAuthenticated(format!("{} is not a hub canister", canister_id.to_string()))}
            Some(canister_index) => {
                let user_config_index = UserConfigIndex{canister_index : canister_index as u16, config_index};
                match registry.user_is_authenticated(&existing_user, &user_config_index) {
                    true => {
                        registry.insert_user_registry(new_user, user_config_index);
                        CallResult::Authenticated(format!("{} is added as an user for canister {}", new_user.to_string(), canister_id.to_string()))
                    }
                    false => {
                        CallResult::UnAuthenticated(format!("{} is not a hub canister", canister_id.to_string()))
                    }
                }
            }
        }
    }
    )
}

#[ic_cdk_macros::update(name = "add_user_to_existing_canister")]
#[candid_method(update, rename = "add_user_to_existing_canister")]
async fn add_user_to_existing_canister(new_user : Principal)-> CallResult<String, String>{
    let canister_id = api::caller();    
    REGISTRY.with(|registry|  {
        let mut registry = registry.borrow_mut();
        match registry.canister_is_authenticated(canister_id) {
            None => {CallResult::UnAuthenticated(format!("{} is not a registered canister", canister_id.to_string()))}
            Some(canister_index) => {
                let state_meta = registry.canister_registry[canister_index].user_state_meta.clone();
                match state_meta.is_public {
                    true => {
                        let user_config_index = registry.insert_canister_registry(state_meta, UserConfigMeta{users : vec![new_user], is_active : true} );
                        registry.insert_user_registry(new_user, user_config_index);
                        CallResult::Authenticated(format!("{} is registered", new_user.to_string()))
                    }
                    false => {CallResult::UnAuthenticated(format!("{} is not a public canister", canister_id.to_string()))}
                }
            }
        }
    }
    )
}

#[ic_cdk_macros::query(name = "get_user_configs_by_user")]
#[candid_method(query, rename = "get_user_configs_by_user")]
fn get_user_configs_by_user() -> CallResult<Vec<UserConfigIndexView>, String>{
    let user = api::caller();
    REGISTRY.with(|registry|  {
        let registry = registry.borrow();
        match registry.user_registry.get(&user) {
            Some(configs) => {
                let confic_indexes = configs.iter().map(|c| 
                    UserConfigIndexView{
                        canister_id: registry.canister_registry[c.canister_index as usize].user_state_meta.canister_id, 
                        config_index: c.config_index}
                    ).collect();
                CallResult::Authenticated(confic_indexes)
            }
            None => {
                CallResult::UnAuthenticated(format!("{} is not a hub user", user.to_string()))
            }
        }
    }     
    )
}

#[ic_cdk_macros::query(name = "get_public_canister_states")]
#[candid_method(query, rename = "get_public_canister_states")]
fn get_public_canister_states() -> Vec<CanisterStateView>{
    REGISTRY.with(|registry|  {
        let registry = registry.borrow();
        registry.canister_registry.iter().filter_map(|state|{
            match state.user_state_meta.is_public == true {
                true => {Some(CanisterStateView{user_state_meta: state.user_state_meta.clone(), 
                                                num_configs: state.configs.len() as u16, 
                                                root_user: state.configs[0].users[0]})}
                false => {None}
            }
        }).collect()
    }     
    )
}

#[ic_cdk_macros::query(name = "did_to_js")]
#[candid_method(query, rename = "did_to_js")]
fn did_to_js(prog: String) -> Option<String> {
    management::did_to_js(prog)
}

candid::export_service!();

#[ic_cdk_macros::query(name = "__get_candid_interface_tmp_hack")]
#[candid_method(query, rename = "__get_candid_interface_tmp_hack")]
fn __get_candid_interface_tmp_hack() -> String {
    __export_service()
}

#[ic_cdk_macros::pre_upgrade]
fn pre_upgrade() {
    REGISTRY.with(|s| {
        let state = s.take();
        let bytes = bincode::serialize(&state).unwrap();
        match StableWriter::default().write(bytes.as_slice()) {
            Ok(size) => {
                format!("after pre_upgrade stable_write size{}", size);
            }
            Err(_) => {
                format!("{}", "stable_write error");
            }
        }
    })
}

#[ic_cdk_macros::post_upgrade]
fn post_upgrade() {
    REGISTRY.with(|s| {
        let bytes = stable_bytes();
        let restore_state = bincode::deserialize(&bytes).unwrap();
        s.replace(restore_state);
    })
}