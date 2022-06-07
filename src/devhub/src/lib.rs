use candid::{Deserialize, Principal, CandidType, candid_method, IDLProg, TypeEnv, check_prog};
use serde::Serialize;
use std::cell::RefCell;
use std::collections::VecDeque;
use std::string::String;
use ic_cdk_macros;
use ic_cdk::api;
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

#[derive(Deserialize, Serialize, Debug, CandidType, Clone)]
pub struct StateMeta {
    is_public : bool,
    user_configs_limit : u16,
    calls_limit: u32,
}

#[derive(CandidType)]
pub struct CanisterStateStats {
    state_meta : StateMeta,
    user_config_stats: Vec<UserStats>,
    agg_stats: UserStats,
}

impl CanisterState {
    fn init(&mut self, registry_canister_id : Principal, user_config : UserConfig, state_meta : StateMeta){
        self.registry_canister_id = registry_canister_id;
        self.user_configs[0] = user_config;
        self.state_meta = state_meta;
    }

    // fn is_authenticated(&self, user_config_index: u16, user: &Principal) -> bool {
    //     // The anonymous principal is not allowed to interact with canister.
    //     match self.user_configs.get(user_config_index as usize) {
    //         None => {false}
    //         Some(config) => {
    //             if config.meta_data.users.contains(user) {
    //                 true
    //             } else {
    //                 false
    //             }
    //         }
    //     }
    // }

    fn get_user_config(&self, user_config_index : u16, user : &Principal) -> Result<&UserConfig, String> {
        match self.user_configs.get(user_config_index as usize) {
            None => {Err(String::from("user config does not exist"))}
            Some(user_config) => {
                let meta_data = &user_config.meta_data;
                match meta_data.users.contains(user) {
                    true => {Ok(user_config)}
                    false => {match meta_data.is_public {
                        true => {Ok(user_config)}
                        false => {Err(String::from("user config is private"))}
                    }}
                }
            }
        }
    }

    fn get_user_config_mut(&mut self, user_config_index : u16, user : &Principal) -> Result<&mut UserConfig, String> {
        match self.user_configs.get_mut(user_config_index as usize) {
            None => {Err(String::from("user config does not exist"))}
            Some(user_config) => {
                match user_config.meta_data.users.contains(user){
                    true => {Ok(user_config)}
                    false => {Err(String::from("users are not authenticated to write"))}
                }
            }
        }
    }    

    fn is_root_user(&self, user: &Principal) -> bool {
        // check if user is in root user config
        self.user_configs[0].meta_data.users.contains(user)
    }
    
    fn check_num_configs_by_user(& self, user: &Principal) -> usize {
        self.user_configs.iter().filter(|&c| c.meta_data.users[0] == *user).count()
    }

    fn add_user_config(&mut self, user_config : UserConfig) {
        self.user_configs.push(user_config)
    }

    fn get_canister_state_stats(&self) -> CanisterStateStats { 
        let mut user_config_stats : Vec<UserStats> = Vec::new();
        let mut users_count = 0;
        let mut is_public_count = 0;
        let mut canister_configs_count = 0;
        let mut canister_calls_count = 0;
        let mut test_cases_count = 0;
        for user_config in &self.user_configs {
            let user_stats = user_config.get_user_config_stats(false);
            user_config_stats.push(user_stats.clone());
            users_count += user_stats.users_count;
            is_public_count += user_stats.is_public_count;
            canister_configs_count += user_stats.canister_configs_count;
            canister_calls_count += user_stats.canister_calls_count;
            test_cases_count += user_stats.test_cases_count;
        }
        CanisterStateStats{
            state_meta: self.state_meta.clone(),
            user_config_stats,
            agg_stats: UserStats{users_count, is_public_count, canister_configs_count, canister_calls_count, test_cases_count, mem_size : None}
        }
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
    result: Vec<u8>,
}

#[derive(CandidType, Deserialize, Serialize, Debug, Clone)]
pub struct CanisterCall {
    canister_id: Principal,
    function_name: String,
    params: String,
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
    case_run_id : Option<u16>,
    tag: String,
    config: String,
    time_at: u64,
    canister_calls: Vec<CanisterCall>
}

#[derive(CandidType, Deserialize, Serialize, Debug, Clone)]
pub enum TestCaseFilter {
    #[serde(rename = "tag")]
    Tag(String),
    #[serde(rename = "case_run_id")]
    TestCaseId(u16)
}

#[derive(CandidType, Debug, Deserialize, Clone, Serialize)]
struct CanisterConfig {
    canister_id: Principal,
    time_updated: u64,
    is_active: bool,
    config: String,
    meta_data: Vec<String>
}

#[derive(Serialize, Debug, Deserialize, Clone, CandidType)]
pub struct UserConfigMeta {
    users: Vec<Principal>,
    calls_limit: u32,
    is_public: bool,
    is_active: bool,
}

impl Default for UserConfigMeta {
    fn default() -> Self {
        Self {
            users: vec![Principal::anonymous()],
            calls_limit: u32::MAX,
            is_public: true,
            is_active: true,
        }
    }
}

#[derive(Serialize, Debug, Deserialize)]
pub struct UserConfig {
    meta_data: UserConfigMeta,
    ui_config: String,
    canister_configs: Vec<CanisterConfig>,
    canister_calls: VecDeque<CanisterCall>,
    last_call_id: u32,
    test_cases: Vec<TestCase>,
}

#[derive(CandidType)]
pub struct UserConfigView {
    meta_data: UserConfigMeta,
    ui_config: String,
    canister_configs: Vec<CanisterConfig>,
    canister_calls: Vec<CanisterCall>,
    test_cases: Vec<TestCaseView>,
    stats: UserStats,
}

impl Default for UserConfig {
    fn default() -> Self{
        Self {
            meta_data : UserConfigMeta::default(),
            ui_config : String::new(),
            canister_configs: Vec::new(),
            canister_calls: VecDeque::new(),
            last_call_id: 0,
            test_cases: Vec::new()
        }
    }
}

impl UserConfig {
    fn new(user : Principal, calls_limit : u32, ui_config : String) -> Self{
        let meta_data = UserConfigMeta {
            users: vec![user],
            calls_limit: calls_limit,
            is_public: false,
            is_active: true,
        };
        Self {
            meta_data,
            ui_config,
            canister_configs: Vec::new(),
            canister_calls: VecDeque::new(),
            last_call_id: 0,
            test_cases: Vec::new()
        }
    }

    fn check_ser_size(&self) -> u32{
        bincode::serialize(&self).unwrap().len() as u32
    }

    fn add_user(&mut self, user: Principal) {
        self.meta_data.users.push(user);
    }    

    fn update_ui_config(&mut self, ui_config : &String){
        self.ui_config = ui_config.clone();
    }

    fn cache_canister_config(&mut self, canister_config : CanisterConfig){
        for  config in &mut self.canister_configs {
            if config.canister_id == canister_config.canister_id {
                *config = canister_config;
                return ;
            }
        }
        self.canister_configs.push(canister_config);
    }

    fn insert_canister_calls(&mut self, canister_calls : Vec<CanisterCall>){
        self.last_call_id += canister_calls.len() as u32;
        for canister_call in canister_calls {
            match self.canister_calls.len() as u32 == self.meta_data.calls_limit {
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
    
    fn cache_test_case(&mut self, test_case: TestCaseView) -> Result<u16, String> {
        match test_case.case_run_id {
            None => {
                self.test_cases.push(TestCase { 
                    tag: test_case.tag, config: test_case.config, 
                    time_at: test_case.time_at, 
                    canister_call_ids: (self.last_call_id..self.last_call_id+test_case.canister_calls.len() as u32) });
                self.insert_canister_calls(test_case.canister_calls);            
                Ok((self.test_cases.len()-1) as u16)
            }
            Some(case_run_id) => {
                match self.test_cases.get_mut(case_run_id as usize) {
                    None => {Err(format!("case_run_id : {} not found", case_run_id))}
                    Some(existing_test_case) => {
                        match existing_test_case.tag == test_case.tag {
                            true => {
                                existing_test_case.config = test_case.config; 
                                existing_test_case.time_at = test_case.time_at;
                                existing_test_case.canister_call_ids = self.last_call_id..self.last_call_id+test_case.canister_calls.len() as u32;
                                self.insert_canister_calls(test_case.canister_calls);            
                                Ok(case_run_id as u16)
                            }
                            false => {Err(format!("inconsistent test_case tag : {} vs {}", existing_test_case.tag, test_case.tag))}
                        }
                    }
                }
            }
        }
    }

    fn build_user_config_view(&self) -> UserConfigView {
        UserConfigView{
            meta_data: self.meta_data.clone(),
            ui_config: self.ui_config.clone(),
            canister_configs: self.get_canisters_configs(true),
            canister_calls: self.get_canister_calls(None, None, Some(100)),
            test_cases: self.get_test_cases(None, Some(10)),
            stats: self.get_user_config_stats(true),
        }
    }

    fn get_canisters_configs(&self, is_active: bool) -> Vec<CanisterConfig>{
        self.canister_configs.iter().filter(|config| config.is_active == is_active).cloned().collect()            
    }     

    fn get_canister_calls(&self, canister_id: Option<Principal>, function_name: Option<String>, limit: Option<u16>) -> Vec<CanisterCall> {
        let mut related_calls = Vec::new();
        for call in self.canister_calls.iter() {
            if Some(related_calls.len() as u16) == limit {return related_calls}
            match canister_id {
                Some(c_id) => {
                    if c_id == call.canister_id {
                            match function_name.clone() {
                                Some(f_name) => {
                                    if f_name == call.function_name {
                                       related_calls.push(call.clone())
                                    }
                                }
                                None => related_calls.push(call.clone())
                            }
                    }
                   }
                None => {related_calls.push(call.clone())}
            }
        }
        related_calls
    }

    fn get_canister_calls_by_range(&self, r : &std::ops::Range<u32>) -> Vec<CanisterCall>{
        if self.last_call_id - r.start > self.canister_calls.len() as u32 {
            return Vec::new()
        }
        self.canister_calls.range(
            (self.last_call_id - r.end ) as usize..(self.last_call_id - r.start ) as usize)
            .rev().cloned().collect()
    }

    fn build_view_by_test_case(&self, case_run_id: u16, test_case:  &TestCase) -> TestCaseView {
        TestCaseView { 
            case_run_id: Some(case_run_id as u16),
            tag: test_case.tag.clone(), 
            config: test_case.config.clone(), 
            time_at: test_case.time_at.clone(), 
            canister_calls : self.get_canister_calls_by_range(&test_case.canister_call_ids)}
    }    
    
    fn get_test_cases(&self, filter_by: Option<TestCaseFilter>, limit: Option<u16>) -> Vec<TestCaseView> {
        let mut related_test_cases : Vec<TestCaseView> = Vec::new();
        let test_cases_length = self.test_cases.len();
        match filter_by {
            None => {
                for (idx, test_case) in self.test_cases.iter().rev().enumerate() {
                    if Some(related_test_cases.len() as u16) == limit { return related_test_cases }
                    let case_run_id = (test_cases_length - idx - 1) as u16 ; 
                    related_test_cases.push(self.build_view_by_test_case(case_run_id, test_case))
                }
            }
            Some(filter) => {
                match filter {
                    TestCaseFilter::Tag(tag) => {
                        for (idx, test_case) in self.test_cases.iter().rev().enumerate() {
                            if Some(related_test_cases.len() as u16) == limit { return related_test_cases }                            
                            if tag == test_case.tag {
                                let case_run_id = (test_cases_length - idx - 1) as u16;
                                related_test_cases.push(self.build_view_by_test_case(case_run_id as u16, test_case));
                            }
                        }                        
                    }
                    TestCaseFilter::TestCaseId(case_run_id) => {
                        match self.test_cases.get(case_run_id as usize) {
                            None => {return Vec::new()}
                            Some(test_case) => {return vec![self.build_view_by_test_case(case_run_id as u16, test_case)]}
                        }
                    }
                }
            }
        }
        related_test_cases
    }

    fn get_user_config_stats(&self, include_mem_size: bool) -> UserStats{
        UserStats {
            users_count: self.meta_data.users.len() as u16,
            is_public_count: 1,
            canister_configs_count: self.canister_configs.len() as u8,
            canister_calls_count: self.last_call_id - 1,
            test_cases_count: self.test_cases.len() as u16,
            mem_size: if include_mem_size {Some(self.check_ser_size())} else {None}
        }
    }
}

#[derive(CandidType, Clone)]
pub struct UserStats{
    users_count: u16,
    is_public_count: u16,
    canister_configs_count: u8,
    canister_calls_count: u32,
    test_cases_count: u16,
    mem_size: Option<u32>,
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
        let mut config_state = config_state.borrow_mut();
        (config_state.get_user_config_mut(user_config_index, &caller).is_ok(), config_state.registry_canister_id)});
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

#[ic_cdk_macros::update(name = "set_user_config_public")]
#[candid_method(update, rename = "set_user_config_public")]
async fn set_user_config_public(user_config_index : u16, is_public : bool) -> CallResult<String, String>{
    STATE.with(|config_state| {
        let caller = api::caller();
        let mut config_state = config_state.borrow_mut();
        match config_state.get_user_config_mut(user_config_index, &caller){
            Ok(user_config) => {
                user_config.meta_data.is_public = is_public;
                CallResult::Authenticated(format!("ui config is_public : {}", is_public))
            }
            Err(msg) => {
                CallResult::UnAuthenticated(msg)
            }
        }
    }        
    )
}

#[ic_cdk_macros::update(name = "cache_ui_config")]
#[candid_method(update, rename = "cache_ui_config")]
async fn cache_ui_config(user_config_index : u16, ui_config : String) -> CallResult<String, String>{
    STATE.with(|config_state| {
        let caller = api::caller();
        let mut config_state = config_state.borrow_mut();
        match config_state.get_user_config_mut(user_config_index, &caller){
            Ok(user_config) => {
                user_config.update_ui_config(&ui_config);
                CallResult::Authenticated(String::from("ui config is updated"))
            }
            Err(msg) => {
                CallResult::UnAuthenticated(msg)
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
        match config_state.get_user_config_mut(user_config_index, &caller){
            Ok(user_config) => {
                user_config.cache_canister_config(canister_config);
                CallResult::Authenticated(String::from("canister config is updated"))
            }
            Err(msg) => {
                CallResult::UnAuthenticated(String::from(msg))
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
        match config_state.get_user_config_mut(user_config_index, &caller){
            Ok(user_config) => {
                user_config.insert_canister_calls(canister_calls);
                CallResult::Authenticated(String::from("canister calls are updated"))
            }
            Err(msg) => {
                CallResult::UnAuthenticated(String::from(msg))
            }
        }
    }        
    )      
}

#[ic_cdk_macros::update(name = "cache_test_case")]
#[candid_method(update, rename = "cache_test_case")]
async fn cache_test_case(user_config_index: u16, test_case : TestCaseView)-> CallResult<Result<u16, String>, String>{
    STATE.with(|config_state| {
        let caller = api::caller();
        let mut config_state = config_state.borrow_mut();
        match config_state.get_user_config_mut(user_config_index, &caller){
            Ok(user_config) => {
                let case_run_id = user_config.cache_test_case(test_case);
                CallResult::Authenticated(case_run_id)
            }
            Err(msg) => {
                CallResult::UnAuthenticated(String::from(msg))
            }
        }
    }        
    )        
}

// #[ic_cdk_macros::query(name = "migrate_user_config")]
// #[candid_method(query, rename = "migrate_user_config")]
// async fn migrate_user_config(user_config_index: u16)-> Vec<u8>{
//     STATE.with(|config_state| {
//         let config_state = config_state.borrow();
//         bincode::serialize(&config_state.user_configs[user_config_index as usize]).unwrap()
//     }        
//     )        
// }

// #[ic_cdk_macros::update(name = "set_user_config")]
// #[candid_method(update, rename = "set_user_config")]
// async fn set_user_config(user_config_bin : Vec<u8>)-> UserConfigView{
//     STATE.with(|config_state| {
//         let mut config_state = config_state.borrow_mut();
//         let new_user_config : UserConfig = bincode::deserialize(&user_config_bin).unwrap();
//         config_state.add_user_config(new_user_config);
//         config_state.user_configs[config_state.user_configs.len()-1].get_user_config_private()
//     }        
//     )        
// }

#[ic_cdk_macros::query(name = "get_user_config")]
#[candid_method(query, rename = "get_user_config")]
fn get_user_config(user_config_index: u16) -> CallResult<UserConfigView, String>{
    STATE.with(|config_state| {
        let caller = api::caller();        
        let config_state = config_state.borrow();
        match config_state.get_user_config(user_config_index, &caller){
            Ok(user_config) => {
                CallResult::Authenticated(user_config.build_user_config_view())
            }
            Err(msg) => {
                CallResult::UnAuthenticated(msg)
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
        match config_state.get_user_config(user_config_index, &caller){
            Ok(user_config) => {
                CallResult::Authenticated(user_config.get_canister_calls(canister_id, function_name, limit))
            }
            Err(msg) => {
                CallResult::UnAuthenticated(msg)
            }
        }   
    }        
    )
}

#[ic_cdk_macros::query(name = "get_test_cases")]
#[candid_method(query, rename = "get_test_cases")]
fn get_test_cases(user_config_index: u16, filter_by: Option<TestCaseFilter>, limit: Option<u16>) 
                    -> CallResult<Vec<TestCaseView>, String>
{
    STATE.with(|config_state| {
        let caller = api::caller();        
        let config_state = config_state.borrow();
        match config_state.get_user_config(user_config_index, &caller){
            Ok(user_config) => {
                CallResult::Authenticated(user_config.get_test_cases(filter_by, limit))
            }
            Err(msg) => {
                CallResult::UnAuthenticated(msg)
            }
        }   
    }        
    )       
}

#[ic_cdk_macros::query(name = "get_user_config_stats")]
#[candid_method(query, rename = "get_user_config_stats")]
fn get_user_config_stats(user_config_index: u16) -> Option<UserStats>{
    STATE.with(|config_state| {
        let config_state = config_state.borrow();
        match config_state.user_configs.get(user_config_index as usize){
            None => {None}
            Some(user_config) => {Some(user_config.get_user_config_stats(true))}
        }
    }        
    )
}

#[ic_cdk_macros::query(name = "get_canister_state_stats")]
#[candid_method(query, rename = "get_canister_state_stats")]
fn get_canister_state_stats() -> CanisterStateStats
{
    STATE.with(|config_state| {
        let config_state = config_state.borrow();
        config_state.get_canister_state_stats()  
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
