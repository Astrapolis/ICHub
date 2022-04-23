use candid::{Deserialize, Principal, CandidType, candid_method};
use serde::Serialize;
use std::cell::RefCell;
use std::collections::{VecDeque, HashMap};
use std::string::String;
use ic_cdk_macros;
use ic_cdk::{api};

thread_local! {
    pub static USER_CONFIGS: std::cell::RefCell<HashMap<Principal, UserConfig>>  = 
    RefCell::new(HashMap::new());
}

#[derive(CandidType, Deserialize, Serialize, Debug, Clone)]
pub struct CanisterCall {
    canister_id: Principal,
    function_name: String,
    params: Vec<u8>,
    result: Vec<u8>,
}

#[derive(CandidType, Debug, Deserialize, Clone, Serialize)]
pub struct CanisterConfig {
    canister_id: Principal,
    is_active: bool,
    config: Vec<u8>
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct UserConfig {
    user: Principal,
    ui_config: Vec<u8>,
    canister_configs: Vec<CanisterConfig>,
    canister_calls: VecDeque<CanisterCall>,
}

#[derive(CandidType)]
pub struct UserConfigDisplay {
    user:  Principal,
    ui_config: Vec<u8>,
    canister_configs: Vec<CanisterConfig>,
    canister_calls: Vec <CanisterCall>
}


impl UserConfig {
    fn init(user: Principal, ui_config : &Vec<u8>, canister_configs : &Vec<CanisterConfig>) -> Self {
        UserConfig {
            user,
            ui_config : ui_config.clone(),
            canister_configs: canister_configs.clone(),
            canister_calls: VecDeque::new()
        }
    }

    fn update_ui_config(&mut self, ui_config : &Vec<u8>) {
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
            self.canister_calls.push_front(canister_call.clone())
        }
    }    

    fn get_user_config(&self) -> UserConfigDisplay {
        UserConfigDisplay{
            user: self.user,
            ui_config: self.ui_config.clone(),
            canister_configs: self.canister_configs.clone(),
            canister_calls: self.get_canister_calls(None, None, Some(100))
        }
    }

    fn get_canister_calls(&self, canister_id: Option<Principal>, function_name: Option<String>, limit: Option<u16>) -> Vec<CanisterCall>
    {
        let mut related_calls = Vec::new();
        for call in self.canister_calls.iter() {
            if Some(related_calls.len() as u16) == limit {
                return related_calls;
            }
            else if (Some(call.canister_id) == canister_id ||  canister_id == None) &&
                    (Some(call.function_name.clone()) == function_name ||  function_name == None)
            {
                related_calls.push(call.clone());
            }
        }
        return related_calls;
    }        
}

#[ic_cdk_macros::init]
#[candid_method(init)]
async fn canister_init(ui_config : Vec<u8>, canister_configs : Vec<CanisterConfig>){
    USER_CONFIGS.with(|config| {
        let mut configs = config.borrow_mut();
        configs.insert(api::caller(), UserConfig::init(api::caller(), &ui_config, &canister_configs));
    }        
    );
}

#[ic_cdk_macros::update(name = "cache_user_config")]
#[candid_method(update, rename = "cache_user_config")]
async fn cache_user_config(ui_config : Vec<u8>){
    USER_CONFIGS.with(|config| {
        let mut config = config.borrow_mut();
        let user_config = config.get_mut(&api::caller()).unwrap();
        user_config.update_ui_config(&ui_config);
    }        
    );
}

#[ic_cdk_macros::update(name = "cache_canister_config")]
#[candid_method(update, rename = "cache_canister_config")]
async fn cache_canister_config(canister_config : CanisterConfig){
    USER_CONFIGS.with(|config| {
        let mut config = config.borrow_mut();
        let user_config = config.get_mut(&api::caller()).unwrap();
        user_config.update_canister_config(&canister_config);
    }        
    );
}

#[ic_cdk_macros::update(name = "cache_canister_calls")]
#[candid_method(update, rename = "cache_canister_calls")]
async fn cache_canister_calls(canister_calls : Vec<CanisterCall>){
    USER_CONFIGS.with(|config| {
        let mut config = config.borrow_mut();
        let user_config = config.get_mut(&api::caller()).unwrap();
        user_config.insert_canister_calls(&canister_calls);
    }        
    );
}

#[ic_cdk_macros::query(name = "get_user_config")]
#[candid_method(query, rename = "get_user_config")]
fn get_user_config() -> UserConfigDisplay{
    USER_CONFIGS.with(|config| {
        let config = config.borrow();
        let user_config = config.get(&api::caller()).unwrap();
        user_config.get_user_config()
    }        
    )
}

candid::export_service!();

#[ic_cdk_macros::query(name = "__get_candid_interface_tmp_hack")]
#[candid_method(query, rename = "__get_candid_interface_tmp_hack")]
fn __get_candid_interface_tmp_hack() -> String {
    __export_service()
}
