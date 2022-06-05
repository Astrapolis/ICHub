import React, { useContext, createContext, useState } from "react";
import { Navigate, useLocation, Route } from 'react-router-dom';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent, Actor } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { InternetIdentity } from "@connect2ic/core/providers/internet-identity";
import { idlFactory } from '../../../declarations/hub/hub.did.js';
import { getActorFromCanisterId, isLocalEnv } from '../utils/actorUtils';
import localCanisterJson from "../../../../.dfx/local/canister_ids.json";
import * as CONSTANT from "../constant";

const DEFAULT_CYCLE_FOR_NEW_DEVHUB = 1000000;
const USER_TYPE_NEW = "new";
const USER_TYPE_REGISTERED = "registered";
let devhubsOfCurrentIdentity = [];
let hubActor = null;

async function getUserRegisterStatus() {

    try {
        let result = await hubActor.get_user_configs_by_user();
        console.log("get_canisters_by_user result", result);
        if (result.Authenticated && result.Authenticated.length > 0) {
            devhubsOfCurrentIdentity = [...result.Authenticated];
            return true;
        }
        return false;
    } catch (err) {
        console.log("check register status error", err);
    }

}

async function registerNewUser() {

    try {
        let result = await hubActor.register_new_canister(
            BigInt(DEFAULT_CYCLE_FOR_NEW_DEVHUB),
            CONSTANT.DEFAULT_CALL_LIMITS,
            JSON.stringify(CONSTANT.DEFAULT_UI_CONFIG),
            true, // is public
            CONSTANT.DEFAULT_USER_CONFIG_LIMIT
        );
        console.log("register result", result);
        if (result.Ok) {
            devhubsOfCurrentIdentity.push(result.Ok);
            return true;
        } else {
            console.log("register failed", result.Err);
            return false;
        }
    } catch (err) {
        console.log("register error", err);
    }

}

function signinResult(cb, success, relativeObject) {
    if (cb) {
        cb(success, relativeObject);
    }
}

class localIIProvider {
    #identity = null;
    #principal = null;
    #client = null;
    constructor() {
        this.#identity = null;
        this.#principal = null;
        this.#client = null;
    }
    get principal() {
        return this.#principal
    }

    get client() {
        return this.#client
    }

    async init() {

        this.#client = await AuthClient.create({
            idleOptions: {
                idleTimeout: 1000 * 60 * 30, // set to 30 minutes
            },
        });
        const isConnected = await this.isConnected()
        // // TODO: fix?
        if (isConnected) {
            this.#identity = this.#client.getIdentity()
            this.#principal = this.#identity?.getPrincipal().toString()
        }
        return true


    }
    async isConnected() {
        if (!this.#client) return false;
        return await this.#client.isAuthenticated()
    }
    async connect() {
        let iiCanisterId = localCanisterJson.internet_identity.local;
        if (!this.#client) return false;
        await new Promise((resolve, reject) => {
            this.#client.login({
                identityProvider: `http://${iiCanisterId}.localhost:8000/`,
                onSuccess: () => resolve(true),
                onError: reject,
            })
        });
        const identity = this.#client.getIdentity();
        const principal = identity.getPrincipal().toString();
        // this.#identity = identity;
        // this.#principal = principal;
        return true
    }

    async disconnect() {
        if (!this.#client) return false;
        await this.#client.logout();
        return true
    }

    async createActor(canisterId, idlFactory) {
        const agent = new HttpAgent({
            //...this.#config,
            identity: this.#identity,
        });
        agent.fetchRootKey().catch(err => {
            console.warn("Unable to fetch root key. Check to ensure that your local replica is running")
            console.error(err)
        });

        return Actor.createActor(idlFactory, {
            agent,
            canisterId,
        });

    }

}

class iiAuthObject {
    constructor(isDev) {
        this.isAuthenticated = false;
        this.providerInit = false;
        this.provider = isDev ? new localIIProvider() : new InternetIdentity.connector();
    }

    async signin(cb) {
        try {
            if (!this.providerInit) {
                let ret = await this.provider.init();
                if (ret) {
                    this.providerInit = true;
                }
            }
            let ret = await this.provider.connect();
            if (ret) {
                this.isAuthenticated = true;
                hubActor = await this.provider.createActor(localCanisterJson.hub.local, idlFactory);
                let result = await getUserRegisterStatus();
                let devhubAgent = new HttpAgent({
                    //...this.#config,
                    identity: this.provider.client.getIdentity(),
                });
                if (isLocalEnv()) {
                    devhubAgent.fetchRootKey().catch(err => {
                        console.warn("Unable to fetch root key. Check to ensure that your local replica is running")
                        console.error(err)
                    });
                }
                if (result) {
                    // already registered
                    let devhubActor = await getActorFromCanisterId(devhubsOfCurrentIdentity[0].canister_id, devhubAgent);
                    signinResult(cb, true, {
                        identity: this.provider.client.getIdentity(),
                        hubActor,
                        devhubs: [...devhubsOfCurrentIdentity],
                        devhubActor
                    });
                } else {
                    // new user and register for the user
                    if (result === undefined) {
                        signinResult(cb, false, "failed to query user status");
                    } else {
                        let r = await registerNewUser();
                        if (r) {

                            let devhubActor = await getActorFromCanisterId(devhubsOfCurrentIdentity[0].canister_id, devhubAgent);
                            signinResult(cb, true, {
                                identity: this.provider.client.getIdentity(),
                                hubActor,
                                devhubs: [...devhubsOfCurrentIdentity],
                                devhubActor
                            });
                        } else {
                            signinResult(cb, false, "failed to register new user")
                        }
                    }
                }

            } else {
                signinResult(cb, false, "connect failed");
            }
        } catch (err) {
            console.log('auth error', err);
            signinResult(cb, false, err);
        }
    };
    async signout(cb) {
        try {
            let ret = await this.provider.disconnect();
            if (ret) {
                this.isAuthenticated = false;
                devhubsOfCurrentIdentity = [];
                hubActor = null;
                if (cb)
                    cb(true);
            } else {
                if (cb)
                    cb(false);
            }
        } catch (err) {
            console.log('logout error', err);
            if (cb)
                cb(false, err);
        }

    };
}

const iiAuth = new iiAuthObject(true);

export const authContext = createContext();


export function useAuth() {
    return useContext(authContext);
}

export function useProvideAuth() {
    const [user, setUser] = useState(null);

    const signin = cb => {
        return iiAuth.signin((success, relativeObject) => {
            if (success) {
                setUser(relativeObject);
                cb(success);
            } else {
                cb(success, relativeObject);
            }

        });
    };

    const signout = cb => {
        return iiAuth.signout(() => {
            setUser(null);
            cb();
        });
    };

    return {
        user,
        signin,
        signout
    };
}

export const ProvideAuth = ({ children }) => {
    const auth = useProvideAuth();
    console.log('return provide auth');
    return (
        <authContext.Provider value={auth}>
            {children}
        </authContext.Provider>
    );
}

export const AuthGuardedRoute = ({ children, ...rest }) => {
    console.log('AuthGuardedRoute  ======>', children, rest);
    let {user} = useAuth();
    let loc = useLocation();
    
    return (
        <Route
            {...rest}
            element={ 
                user ? (children) : <Navigate to={{
                    pathname: "/connect",
                    state: { from: location }
                }} />
            }/>
    );
}