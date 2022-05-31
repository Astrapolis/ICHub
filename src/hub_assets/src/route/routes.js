
import RootLayout from "../layout/RootLayout.svelte";
import Login from "../components/Login.svelte";
import Logout from "../components/Logout.svelte";
import DevhubLayout from '../layout/DevhubLayout.svelte';
import DevhubGeneralDashboard from "../components/DevhubGeneralDashboard.svelte";
import DevhubAdminDashboard from "../components/DevhubAdminDashboard.svelte";
import NewFollowCard from "../components/NewFollowCard.svelte";
import CanisterList from "../components/CanisterList.svelte";

import { userProfileStore } from '../store/user';

import * as CONSTANT from "../constant";

let userProfile = {};

const unsubscribe = userProfileStore.subscribe(value => {
    console.log('router guard ', value);
    userProfile = value;
});

function isIcHubUser() {
    return userProfile.isIcHubUser;
}

const onlyIf = {
    guard: isIcHubUser, redirect: '/devhub/admin/follows/new'
}

const routes = [
    {
        name: '/',
        layout: RootLayout,
        redirectTo: '/devhub/admin'
    },
    {
        name: 'login',
        component: Login,
        layout: RootLayout
    },
    {
        name: 'logout',
        component: Logout,
        layout: RootLayout
    },
    {
        name: 'myprofile',
        onlyIf
    },
    {
        name: 'devhub',
        layout: RootLayout,
        nestedRoutes: [
            {
                name: 'index',
                component: DevhubGeneralDashboard,
            },
            {
                name: 'view/:userid', nestedRoutes: [
                    { name: 'index' },
                    { name: 'follows' },
                    {
                        name: 'cases/:caseid', nestedRoutes: [
                            {
                                name: 'index',
                            }, {
                                name: 'history/:runid', nestedRoutes: [{
                                    name: 'index'
                                }]
                            }
                        ]
                    }
                ]
            },
            {
                name: 'admin',
                nestedRoutes: [
                    {
                        name: 'index',
                        layout: DevhubLayout,
                        component: DevhubAdminDashboard
                    },
                    {
                        name: 'follows', nestedRoutes: [
                            {
                                name: 'index',
                                component: CanisterList,
                                layout: DevhubLayout,
                                onlyIf,
                            }, {
                                name: 'new',
                                component: NewFollowCard,
                                layout: DevhubLayout
                            }
                        ]
                    },
                    {
                        name: 'cases',
                        onlyIf,
                        nestedRoutes: [
                            {
                                name: 'index'
                            },
                            {
                                name: 'cases/new',

                            },
                            {
                                name: 'cases/:caseid',
                                onlyIf,
                                nestedRoutes: [
                                    {
                                        name: 'index',
                                    }, {
                                        name: 'addmethod',
                                    }, {
                                        name: 'configmethod/:methodindex',
                                    }, {
                                        name: 'run'
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: 'history',
                        onlyIf
                    }
                ]
            }
        ]
    }




];

export { routes }
