use candid::{Deserialize, Principal, CandidType, candid_method, IDLProg, TypeEnv, check_prog};
use serde::Serialize;
use std::cell::RefCell;
use std::collections::VecDeque;
use std::string::String;
use ic_cdk_macros;
use ic_cdk::api;
use std::mem::size_of_val;
use ic_cdk::api::stable::{stable_bytes, StableWriter};

thread_local! {
    static STATE: std::cell::RefCell<CanisterState>  = 
    RefCell::new(CanisterState::default());
}

#[derive(Deserialize, Serialize, Debug)]
pub struct CanisterState {
    user_configs : Vec<UserConfig>,
    registry_canister_id : Principal,
    state_meta : StateMeta,
}

#[derive(Deserialize, Serialize, Debug, CandidType)]
pub struct StateMeta {
    is_public : bool,
    user_configs_limit : u16,
    calls_limit: u32
}

impl CanisterState {
    fn init(&mut self, registry_canister_id : Principal, user_config : UserConfig, state_meta : StateMeta){
        self.registry_canister_id = registry_canister_id;
        self.user_configs[0] = user_config;
        self.state_meta = state_meta;
    }

    fn is_authenticated(&self, user_config_index: u16, user: &Principal) -> bool {
        // The anonymous principal is not allowed to interact with canister.
        match self.user_configs.get(user_config_index as usize) {
            None => {false}
            Some(config) => {
                if config.users.contains(user) {
                    true
                } else {
                    false
                }
            }
        }
    }

    fn is_root_user(&self, user: &Principal) -> bool {
        // check if user is in root user config
        self.user_configs[0].users.contains(user)
    }
    
    fn check_num_configs_by_user(& self, user: &Principal) -> usize {
        self.user_configs.iter().filter(|&c| c.users[0] == *user).count()
    }

    fn add_user_config(&mut self, user_config : UserConfig) {
        self.user_configs.push(user_config)
    }
}

impl Default for CanisterState {
    fn default() -> Self {
        Self { 
            user_configs: vec![UserConfig::default()],
            registry_canister_id: Principal::anonymous(),
            state_meta : StateMeta{is_public: false, user_configs_limit : 1, calls_limit : u32::MAX}
        }
    }
}

#[derive(CandidType, Deserialize)]
pub enum CallResult<T, U> {
    Authenticated(T),
    UnAuthenticated(U)
}

#[derive(CandidType, Deserialize, Serialize, Debug, Clone)]
pub struct CanisterCallEvent {
    time_at: u64,
    caller: Principal,
    params: String,
    result: Vec<u8>,
}

#[derive(CandidType, Deserialize, Serialize, Debug, Clone)]
pub struct CanisterCall {
    canister_id: Principal,
    function_name: String,
    event: Option<CanisterCallEvent>
}

#[derive(Deserialize, Serialize, Debug, Clone)]
struct TestCase {
    tag: String,
    config: String,
    time_at: u64,
    canister_call_ids: std::ops::Range<u32>
}

#[derive(CandidType, Deserialize, Serialize, Debug, Clone)]
pub struct TestCaseView {
    tag: String,
    config: String,
    time_at: u64,
    canister_calls: Vec<CanisterCall>
}

#[derive(CandidType, Debug, Deserialize, Clone, Serialize)]
struct CanisterConfig {
    canister_id: Principal,
    time_updated: u64,
    is_active: bool,
    is_public: bool,
    config: String,
    meta_data: Vec<String>
}

#[derive(Serialize, Debug, Deserialize)]
pub struct UserConfig {
    users: Vec<Principal>,
    calls_limit: u32,
    ui_config: String,
    is_active: bool,
    canister_configs: Vec<CanisterConfig>,
    canister_calls: VecDeque<CanisterCall>,
    last_call_id: u32,
    test_cases: Vec<TestCase>,
}

#[derive(CandidType)]
pub struct UserConfigViewPrivate {
    users:  Vec<Principal>,
    ui_config: String,
    calls_limit: u32,
    canister_configs: Vec<CanisterConfig>,
    canister_calls: Vec<CanisterCall>,
    test_cases: Vec<TestCaseView>,
    mem_size : u32
}

#[derive(CandidType)]
pub struct UserConfigViewPublic {
    user:  Vec<Principal>,
    ui_config: String,
    canister_configs: Vec<CanisterConfig>,
}

impl Default for UserConfig {
    fn default() -> Self{
        Self {
            users : vec![Principal::anonymous()],
            ui_config : String::new(),
            is_active: true,
            calls_limit: u32::MAX,
            canister_configs: Vec::new(),
            canister_calls: VecDeque::new(),
            last_call_id: 0,
            test_cases: Vec::new()
        }
    }
}

impl UserConfig {
    fn new(user : Principal, calls_limit : u32, ui_config : String) -> Self{
        Self {
            users : vec![user],
            ui_config,
            is_active: true,
            calls_limit,
            canister_configs: Vec::new(),
            canister_calls: VecDeque::new(),
            last_call_id: 0,
            test_cases: Vec::new()
        }
    }

    fn add_user(&mut self, user: Principal) {
        self.users.push(user);
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

    fn insert_canister_calls(&mut self, canister_calls : Vec<CanisterCall>){
        self.last_call_id += canister_calls.len() as u32;
        for canister_call in canister_calls {
            match self.canister_calls.len() as u32 == self.calls_limit {
                true => {
                    self.canister_calls.pop_back();
                    self.canister_calls.push_front(canister_call.clone());
                }
                false => {
                    self.canister_calls.push_front(canister_call.clone());
                }
            }
        }
    }
    
    fn insert_test_case(&mut self, test_case: TestCaseView) {
        self.test_cases.push(TestCase { 
            tag: test_case.tag, config: test_case.config, 
            time_at: test_case.time_at, 
            canister_call_ids: (self.last_call_id..self.last_call_id+test_case.canister_calls.len() as u32) });
        self.insert_canister_calls(test_case.canister_calls);            
    }

    fn get_user_config_private(&self) -> UserConfigViewPrivate {
        UserConfigViewPrivate{
            users: self.users.clone(),
            ui_config: self.ui_config.clone(),
            calls_limit: self.calls_limit,
            canister_configs: self.get_canisters_configs(true, false),
            canister_calls: self.get_canister_calls(None, None, Some(100)),
            test_cases: self.get_test_cases(None, Some(10), true),
            mem_size: size_of_val(&*self) as u32
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
            if limit != None && related_calls.len() as u16 == limit.unwrap() {
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

    fn get_canister_calls_by_range(&self, r : &std::ops::Range<u32>) -> Vec<CanisterCall>{
        if self.last_call_id - r.start + 1 > self.canister_calls.len() as u32 {
            return Vec::new()
        }
        self.canister_calls.range(
            (self.last_call_id - r.end + 1) as usize..(self.last_call_id - r.start + 1) as usize)
            .rev().cloned().collect()
    }
    
    fn get_test_cases(&self, tag: Option<String>, limit: Option<u16>, include_canister_calls : bool) -> Vec<TestCaseView> {
        let mut related_test_cases : Vec<TestCaseView> = Vec::new();
        for test_case in self.test_cases.iter().rev() {
            if limit != None && related_test_cases.len() as u16 == limit.unwrap(){
                return related_test_cases;
            }
            else if tag == None || (Some(test_case.tag.clone()) == tag) {
                related_test_cases.push(
                    TestCaseView { tag: test_case.tag.clone(), config: test_case.config.clone(), time_at: test_case.time_at.clone(), 
                        canister_calls: match include_canister_calls {
                            true => {self.get_canister_calls_by_range(&test_case.canister_call_ids)}
                            false => {Vec::new()}
                        }
                    }
                );
            }
        }
        related_test_cases
    }
}

#[ic_cdk_macros::init]
#[candid_method(init)]
async fn init(user : Principal, calls_limit : u32, 
                ui_config : String, is_public : bool, user_configs_limit : u16){
    let state_meta = StateMeta{is_public, user_configs_limit, calls_limit};
    let registry_canister_id = api::caller();
    STATE.with(|config_state| {
        let mut config_state = config_state.borrow_mut();
        config_state.init(registry_canister_id, 
                            UserConfig::new(user, calls_limit, ui_config), state_meta);
    }        
    );
}

#[ic_cdk_macros::update(name = "update_state_meta")]
#[candid_method(update, rename = "update_state_meta")]
async fn update_state_meta(state_meta : StateMeta) -> CallResult<String, String>{
    STATE.with(|config_state| {
        let caller = api::caller();
        let mut config_state = config_state.borrow_mut();
        match config_state.is_root_user(&caller) {
            true => {
                config_state.state_meta = state_meta;
                CallResult::Authenticated(String::from("state meta data is updated"))
            }
            false => {
                CallResult::UnAuthenticated(format!("{} is not root user", caller))
            }
        }
    }        
    )    
}

#[ic_cdk_macros::update(name = "add_user_to_existing_user_config")]
#[candid_method(update, rename = "add_user_to_existing_user_config")]
async fn add_user_to_existing_user_config(user_config_index : u16, new_user : Principal) -> CallResult<String, String>{
    let caller = api::caller();
    let (is_authenticated, registry_canister_id ) = 
    STATE.with(|config_state|{
        let config_state = config_state.borrow();
        (config_state.is_authenticated(user_config_index, &caller), config_state.registry_canister_id)});
    match is_authenticated {
        true => {
            let call_result: Result<(CallResult<String, String>,), _> = 
                api::call::call(registry_canister_id, "add_user_to_existing_user_config", (caller, new_user,user_config_index)).await;        
            match call_result {
                Ok(result) => {
                    match result.0  {
                        CallResult::Authenticated(msg) =>{
                            STATE.with(|config_state| {config_state.borrow_mut().user_configs[user_config_index as usize].add_user(caller)}
                        );
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

#[ic_cdk_macros::update(name = "add_user_config")]
#[candid_method(update, rename = "add_user_config")]
async fn add_user_config(ui_config : String) -> CallResult<String, String>{
    let new_user = api::caller();
    let (configs_owned, is_root_user, registry_canister_id ) = 
    STATE.with(|config_state|{
        let config_state = config_state.borrow();
        (config_state.check_num_configs_by_user(&new_user), 
        config_state.is_root_user(&new_user),
        config_state.registry_canister_id)});
    let is_allowed = configs_owned <= 3 && is_root_user == false || is_root_user == true;
    match is_allowed {
        true => {
            let call_result: Result<(CallResult<String, String>,), _> = 
                api::call::call(registry_canister_id, "add_user_to_existing_canister", (new_user,)).await;        
            match call_result {
                Ok(result) => {
                    match result.0  {
                        CallResult::Authenticated(msg) =>{
                            STATE.with(|config_state| {
                                let mut config_state = config_state.borrow_mut();
                                let user_config = UserConfig::new(new_user, config_state.state_meta.calls_limit, ui_config);
                                config_state.add_user_config(user_config);
                            }
                        );
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
            CallResult::UnAuthenticated(format!("add_user_config limit exceeds for {}", new_user))
        }
    }
}

#[ic_cdk_macros::update(name = "cache_ui_config")]
#[candid_method(update, rename = "cache_ui_config")]
async fn cache_ui_config(user_config_index : u16, ui_config : String) -> CallResult<String, String>{
    STATE.with(|config_state| {
        let caller = api::caller();
        let mut config_state = config_state.borrow_mut();
        match config_state.is_authenticated(user_config_index, &caller){
            true => {
                config_state.user_configs[user_config_index as usize].update_ui_config(&ui_config);
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
async fn cache_canister_config(user_config_index : u16, canister_config : CanisterConfig) -> CallResult<String, String>{
    STATE.with(|config_state| {
        let caller = api::caller();
        let mut config_state = config_state.borrow_mut();
        match config_state.is_authenticated(user_config_index, &caller){
            true => {
                config_state.user_configs[user_config_index as usize].update_canister_config(&canister_config);
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
async fn cache_canister_calls(user_config_index: u16, canister_calls : Vec<CanisterCall>)-> CallResult<String, String>{
    STATE.with(|config_state| {
        let caller = api::caller();
        let mut config_state = config_state.borrow_mut();
        match config_state.is_authenticated(user_config_index, &caller){
            true => {
                config_state.user_configs[user_config_index as usize].insert_canister_calls(canister_calls);
                CallResult::Authenticated(String::from("canister calls are updated"))
            }
            false => {
                CallResult::UnAuthenticated(String::from("cache_canister_calls requires authentication"))
            }
        }
    }        
    )      
}

#[ic_cdk_macros::update(name = "cache_test_case")]
#[candid_method(update, rename = "cache_test_case")]
async fn cache_test_case(user_config_index: u16, test_case : TestCaseView)-> CallResult<String, String>{
    STATE.with(|config_state| {
        let caller = api::caller();
        let mut config_state = config_state.borrow_mut();
        match config_state.is_authenticated(user_config_index, &caller){
            true => {
                config_state.user_configs[user_config_index as usize].insert_test_case(test_case);
                CallResult::Authenticated(String::from("test case is cached"))
            }
            false => {
                CallResult::UnAuthenticated(String::from("cache_test_case requires authentication"))
            }
        }
    }        
    )        
}


#[ic_cdk_macros::query(name = "get_user_config")]
#[candid_method(query, rename = "get_user_config")]
fn get_user_config(user_config_index: u16) -> CallResult<UserConfigViewPrivate, UserConfigViewPublic>{
    STATE.with(|config_state| {
        let caller = api::caller();        
        let config_state = config_state.borrow();
        match config_state.is_authenticated(user_config_index, &caller){
            true => {
                CallResult::Authenticated(config_state.user_configs[user_config_index as usize].get_user_config_private())
            }
            false => {
                CallResult::UnAuthenticated(config_state.user_configs[user_config_index as usize].get_user_config_public())
            }
        }   
    }        
    )
}

#[ic_cdk_macros::query(name = "get_canister_calls")]
#[candid_method(query, rename = "get_canister_calls")]
fn get_canister_calls(user_config_index: u16, canister_id: Option<Principal>, function_name: Option<String>, limit: Option<u16>) 
                    -> CallResult<Vec<CanisterCall>, String>
{
    STATE.with(|config_state| {
        let caller = api::caller();        
        let config_state = config_state.borrow();
        match config_state.is_authenticated(user_config_index, &caller){
            true => {
                CallResult::Authenticated(config_state.user_configs[user_config_index as usize]
                                                      .get_canister_calls(canister_id, function_name, limit))
            }
            false => {
                CallResult::UnAuthenticated(String::from("get_canister_calls requires authentication"))
            }
        }   
    }        
    )
}

#[ic_cdk_macros::query(name = "get_test_cases")]
#[candid_method(query, rename = "get_test_cases")]
fn get_test_cases(user_config_index: u16, tag: Option<String>, limit: Option<u16>, include_canister_calls : bool) 
                    -> CallResult<Vec<TestCaseView>, String>
{
    STATE.with(|config_state| {
        let caller = api::caller();        
        let config_state = config_state.borrow();
        match config_state.is_authenticated(user_config_index, &caller){
            true => {
                CallResult::Authenticated(config_state.user_configs[user_config_index as usize]
                                                      .get_test_cases(tag, limit, include_canister_calls))
            }
            false => {
                CallResult::UnAuthenticated(String::from("get_test_cases requires authentication"))
            }
        }   
    }        
    )       
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


#[ic_cdk_macros::pre_upgrade]
fn pre_upgrade() {
    STATE.with(|s| {
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
    STATE.with(|s| {
        let bytes = stable_bytes();
        let restore_state = bincode::deserialize(&bytes).unwrap();
        s.replace(restore_state);
    })
}
