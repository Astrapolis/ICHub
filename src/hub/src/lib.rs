use ic_cdk::export::candid::{Deserialize, Principal, CandidType, candid_method, IDLProg, TypeEnv, check_prog};
use std::cell::RefCell;
use std::collections::HashMap;
use std::string::String;
use ic_cdk_macros;
use ic_cdk::api;

thread_local! {
    pub static USER_CONFIGS: std::cell::RefCell<Registry>  = 
    RefCell::new(Registry::new());
}

pub struct Registry {
    registry : HashMap<Principal, Principal>
}

impl Registry{
    fn new() -> Self{
        Registry{
            registry: HashMap::new()
        }
    }
}

#[derive(CandidType, Debug, Clone, Deserialize)]
pub struct CanisterSettings {
    pub controllers: Option<Vec<Principal>>,
    pub compute_allocation: Option<u128>,
    pub memory_allocation: Option<u128>,
    pub freezing_threshold: Option<u128>,
}

#[allow(non_camel_case_types)]
#[derive(CandidType, Debug, Deserialize)]
pub enum CanisterStatus {
    #[serde(rename = "running")]
    Running,
    #[serde(rename = "stopping")]
    Stopping,
    #[serde(rename = "stopped")]
    Stopped,
}

#[derive(CandidType, Debug, Deserialize)]
pub struct CanisterStatusResponse {
    pub status: CanisterStatus,
    pub settings: CanisterSettings,
    pub module_hash: Option<Vec<u8>>,
    pub controller: Principal,
    pub memory_size: u128,
    pub cycles: u128,
}

// Install Wasm
#[derive(CandidType, Deserialize)]
enum InstallMode {
    #[serde(rename = "install")]
    Install,
    #[serde(rename = "reinstall")]
    Reinstall,
    #[serde(rename = "upgrade")]
    Upgrade,
}

#[derive(CandidType, Deserialize)]
struct CanisterInstall {
    mode: InstallMode,
    canister_id: Principal,
    #[serde(with = "serde_bytes")]
    wasm_module: Vec<u8>,
    #[serde(with = "serde_bytes")]
    arg: Vec<u8>,
}

#[derive(CandidType, Clone, Deserialize)]
pub struct CreateCanisterArgs {
    pub cycles: u64,
    pub settings: CanisterSettings,
}

pub async fn get_canister_status(
    id_record: Principal,
) -> Result<CanisterStatusResponse, String> {
    let res: Result<(CanisterStatusResponse,), _> = api::call::call(
        Principal::management_canister(),
        "canister_status",
        (id_record,),
    )
    .await;
    match res {
        Ok(x) => Ok(x.0),
        Err((code, msg)) => Err(format!(
            "An error happened during the call: {}: {}",
            code as u8, msg
        )),
    }
}

pub async fn create_canister(args: CreateCanisterArgs) -> Result<Principal, String> {
    let (create_result,): (Principal,) = match api::call::call_with_payment(
        Principal::management_canister(),
        "create_canister",
        (Some(args.settings),),
        args.cycles,
    )
    .await
    {
        Ok(x) => x,
        Err((code, msg)) => {
            return Err(format!(
                "An error happened during the call: {}: {}",
                code as u8, msg
            ))
        }
    };

    Ok(create_result)
}

pub async fn install_canister(
    canister_id: &Principal,
    wasm_module: Vec<u8>,
    args: Vec<u8>,
) -> Result<(), String> {
    let install_config = CanisterInstall {
        mode: InstallMode::Install,
        canister_id: *canister_id,
        wasm_module: wasm_module.clone(),
        arg: args,
    };

    match api::call::call(
        Principal::management_canister(),
        "install_code",
        (install_config,),
    )
    .await
    {
        Ok(x) => x,
        Err((code, msg)) => {
            return Err(format!(
                "An error happened during the call: {}: {}",
                code as u8, msg
            ))
        }
    };
    Ok(())
}

pub async fn deposit_cycles(id_record: Principal) -> Result<(), String> {
    let res: Result<(), _> = api::call::call(
        Principal::management_canister(),
        "canister_status",
        (id_record,),
    )
    .await;
    match res {
        Ok(_) => Ok(()),
        Err((code, msg)) => Err(format!(
            "An error happened during the call: {}: {}",
            code as u8, msg
        )),
    }
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
