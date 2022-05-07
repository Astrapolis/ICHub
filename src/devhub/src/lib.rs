use candid::{Deserialize, Principal, CandidType, candid_method, IDLProg, TypeEnv, check_prog};
use serde::Serialize;
use std::cell::RefCell;
use std::collections::{VecDeque};
use std::string::String;
use ic_cdk_macros;
use ic_cdk::api;

mod export {

}

thread_local! {
    static USER_CONFIGS: std::cell::RefCell<UserConfig>  = 
    RefCell::new(UserConfig::default());
}

#[derive(CandidType, Deserialize)]
pub enum CallResult<T, U> {
    Authenticated(T),
    UnAuthenticated(U)
}

#[derive(CandidType, Deserialize, Serialize, Debug, Clone)]
pub struct CanisterCall {
    canister_id: Principal,
    function_name: String,
    time_at: u64,
    params: String,
    result: Vec<u8>,
}

#[derive(CandidType, Debug, Deserialize, Clone, Serialize)]
pub struct CanisterMeta {
    moudule_hash : Vec<u8>,
    controller: Principal,
    time_updated: u64,
    did_file: String
}

#[derive(CandidType, Debug, Deserialize, Clone, Serialize)]
pub struct CanisterConfig {
    canister_id: Principal,
    time_updated: u64,
    is_active: bool,
    is_public: bool,
    config: String,
    meta_data: Vec<CanisterMeta>
}

#[derive(Serialize, Debug, Deserialize, CandidType)]
pub struct UserConfig {
    registry_canister_id: Principal,
    users: Vec<Principal>,
    calls_limit: u32,
    ui_config: String,
    canister_configs: Vec<CanisterConfig>,
    canister_calls: VecDeque<CanisterCall>,
}

#[derive(CandidType)]
pub struct UserConfigViewPrivate {
    users:  Vec<Principal>,
    ui_config: String,
    calls_limit: u32,
    canister_configs: Vec<CanisterConfig>,
    canister_calls: Vec<CanisterCall>
}

#[derive(CandidType)]
pub struct UserConfigViewPublic {
    user:  Vec<Principal>,
    ui_config: String,
    canister_configs: Vec<CanisterConfig>,
}

impl UserConfig {
    fn default() -> Self{
        UserConfig {
            registry_canister_id: Principal::anonymous(),
            users : vec![Principal::anonymous()],
            ui_config : String::new(),
            calls_limit: u32::MAX,
            canister_configs: Vec::new(),
            canister_calls: VecDeque::new()
        }
    }

    fn init(&mut self, registry_canister_id : Principal, user : Principal, calls_limit : u32, ui_config : String) {
        self.registry_canister_id = registry_canister_id; 
        self.users = vec![user];
        self.calls_limit = calls_limit;
        self.ui_config = ui_config;
    }

    fn add_user(&mut self, user: Principal) {
        self.users.push(user);
    }    

    fn is_authenticated(&self, user: &Principal) -> bool {
        // The anonymous principal is not allowed to interact with canister.
        if self.users.contains(user) {
            true
        } else {
            false
        }
    }

    fn update_ui_config(&mut self, ui_config : &String){
        self.ui_config = ui_config.clone();
    }

    fn update_canister_config(&mut self, canister_config : &CanisterConfig){
        for  config in &mut self.canister_configs {
            if config.canister_id == canister_config.canister_id {
                *config = canister_config.clone();
                return ;
            }
        }
        self.canister_configs.push(canister_config.clone());
    }

    fn insert_canister_calls(&mut self, canister_calls : &Vec<CanisterCall>){
        for canister_call in canister_calls {
            match self.canister_calls.len() as u32 == self.calls_limit {
                true => {
                    self.canister_calls.pop_back();
                    self.canister_calls.push_front(canister_call.clone())
                }
                false => {self.canister_calls.push_front(canister_call.clone())}
            }
        }
    }    

    fn get_user_config_private(&self) -> UserConfigViewPrivate {
        UserConfigViewPrivate{
            users: self.users.clone(),
            ui_config: self.ui_config.clone(),
            calls_limit: self.calls_limit,
            canister_configs: self.get_canisters_configs(true, false),
            canister_calls: self.get_canister_calls(None, None, Some(100))
        }
    }

    fn get_user_config_public(&self) -> UserConfigViewPublic {
        UserConfigViewPublic{
            user: self.users.clone(),
            ui_config: self.ui_config.clone(),
            canister_configs: self.get_canisters_configs(true,true)
        }
    }

    fn get_canisters_configs(&self, is_active: bool, is_public: bool) -> Vec<CanisterConfig>
    {
        if is_public {
            self.canister_configs.iter().filter(|config| 
                config.is_active == is_active && config.is_public == is_public).cloned().collect()
        } else {
            self.canister_configs.iter().filter(|config| 
                config.is_active == is_active).cloned().collect()            
        }
    }     

    fn get_canister_calls(&self, canister_id: Option<Principal>, function_name: Option<String>, limit: Option<u16>) -> Vec<CanisterCall>
    {
        let mut related_calls = Vec::new();
        for call in self.canister_calls.iter() {
            if Some(related_calls.len() as u16) == limit {
                return related_calls;
            }
            else if (Some(call.canister_id) == canister_id && (Some(call.function_name.clone()) == function_name ||  function_name == None))
                    || (Some(call.canister_id) == None)
            {
                related_calls.push(call.clone());
            }
        }
        return related_calls;
    }        
}

#[ic_cdk_macros::init]
#[candid_method(init)]
async fn init(registry_canister_id : Principal, user : Principal, calls_limit : u32, ui_config : String){
    USER_CONFIGS.with(|config| {
        let mut config = config.borrow_mut();
        config.init(registry_canister_id, user, calls_limit, ui_config);
    }        
    );
}

#[ic_cdk_macros::update(name = "add_user")]
#[candid_method(update, rename = "add_user")]
async fn add_user(new_user : Principal) -> CallResult<String, String>{
    let caller = api::caller();
    let (is_authenticated, registry_canister_id ) = 
    USER_CONFIGS.with(|config|{
        let config = config.borrow();
        (config.is_authenticated(&caller), config.registry_canister_id)});
    match is_authenticated {
        true => {
            let call_result: Result<(CallResult<String, String>,), _> = api::call::call(registry_canister_id, "add_user_to_existing_canister", (new_user,)).await;        
            match call_result {
                Ok(result) => {
                    match result.0  {
                        CallResult::Authenticated(msg) =>{
                            USER_CONFIGS.with(|config| config.borrow_mut().add_user(caller));
                            CallResult::Authenticated(msg)
                        }
                        CallResult::UnAuthenticated(msg) => {
                            CallResult::UnAuthenticated(msg)
                        }
                    }
                }
                Err(msg) => {
                    panic!("{:?}, {}", msg.0, msg.1)
                }
            }                
        }
        false => {
            CallResult::UnAuthenticated(String::from("add_user requires authentication"))
        }
    }
}        

#[ic_cdk_macros::update(name = "cache_ui_config")]
#[candid_method(update, rename = "cache_ui_config")]
async fn cache_ui_config(ui_config : String) -> CallResult<String, String>{
    USER_CONFIGS.with(|config| {
        let caller = api::caller();
        let mut config = config.borrow_mut();
        match config.is_authenticated(&caller){
            true => {
                config.update_ui_config(&ui_config);
                CallResult::Authenticated(String::from("ui config is updated"))
            }
            false => {
                CallResult::UnAuthenticated(String::from("cache_ui_config requires authentication"))
            }
        }
    }        
    )
}

#[ic_cdk_macros::update(name = "cache_canister_config")]
#[candid_method(update, rename = "cache_canister_config")]
async fn cache_canister_config(canister_config : CanisterConfig) -> CallResult<String, String>{
    USER_CONFIGS.with(|config| {
        let caller = api::caller();
        let mut config = config.borrow_mut();
        match config.is_authenticated(&caller){
            true => {
                config.update_canister_config(&canister_config);
                CallResult::Authenticated(String::from("canister config is updated"))
            }
            false => {
                CallResult::UnAuthenticated(String::from("cache_canister_config requires authentication"))
            }
        }
    }           
    )
}

#[ic_cdk_macros::update(name = "cache_canister_calls")]
#[candid_method(update, rename = "cache_canister_calls")]
async fn cache_canister_calls(canister_calls : Vec<CanisterCall>)-> CallResult<String, String>{
    USER_CONFIGS.with(|config| {
        let caller = api::caller();
        let mut config = config.borrow_mut();
        match config.is_authenticated(&caller){
            true => {
                config.insert_canister_calls(&canister_calls);
                CallResult::Authenticated(String::from("canister calls are updated"))
            }
            false => {
                CallResult::UnAuthenticated(String::from("cache_canister_calls requires authentication"))
            }
        }
    }            
    )
}

#[ic_cdk_macros::query(name = "get_user_config")]
#[candid_method(query, rename = "get_user_config")]
fn get_user_config() -> CallResult<UserConfigViewPrivate, UserConfigViewPublic>{
    USER_CONFIGS.with(|config| {
        let caller = api::caller();        
        let config = config.borrow();
        match config.is_authenticated(&caller){
            true => {
                CallResult::Authenticated(config.get_user_config_private())
            }
            false => {
                CallResult::UnAuthenticated(config.get_user_config_public())
            }
        }   
    }        
    )
}

#[ic_cdk_macros::query(name = "get_canister_calls")]
#[candid_method(query, rename = "get_canister_calls")]
fn get_canister_calls(canister_id: Option<Principal>, function_name: Option<String>, limit: Option<u16>) 
                    -> CallResult<Vec<CanisterCall>, String>
{
    USER_CONFIGS.with(|config| {
        let caller = api::caller();
        let config = config.borrow();
        match config.is_authenticated(&caller){
            true => {
                CallResult::Authenticated(config.get_canister_calls(canister_id, function_name, limit))
            }
            false => {
                CallResult::UnAuthenticated(String::from("get_canister_calls requires authentication"))
            }
        }     
    })   
}

#[ic_cdk_macros::query(name = "get_principal")]
#[candid_method(query, rename = "get_principal")]
fn get_principal() -> Principal
{
    api::caller()
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
