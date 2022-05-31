<script>
    import { onMount, tick } from "svelte";
    import { Navigate, Route, routeIsActive, navigateTo } from "svelte-router-spa";
    import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
    import { Icon, Label } from "@smui/common";
    import Dialog, {
        Header as DHeader,
        Title as DTitle,
        Content as DContent,
        Actions,
    } from "@smui/dialog";
    import Fab from "@smui/fab";
    import Button from "@smui/button";
    import IconButton from "@smui/icon-button";
    import { v4 as uuidv4 } from "uuid";

    import { userProfileStore } from "../store/user";

    export let currentRoute;

    let params = {};
    let profileOpen = false;
    let isLoginRoute = routeIsActive('/login', true);

    $: {
        
        isLoginRoute = routeIsActive('/login', true);
        console.log("current route", currentRoute);
        console.log("is login active", isLoginRoute);
    }

    onMount(() => {
        
        // if (routeIsActive('/')) {
        //     console.log('ready to redirect to /devhub');
        //     navigateTo('/devhub');
        // }
    })
</script>

<main class="site-layout-container">
    <Dialog bind:open={profileOpen}>
        <DHeader>
            <DTitle>My Profile</DTitle>
        </DHeader>
        {#if $userProfileStore.isIcHubUser}
            <DContent>
                <Label>Principal:</Label>
                <Fab extended>
                    <Label>{$userProfileStore.identity.getPrincipal()}</Label>
                </Fab>
            </DContent>
        {/if}
        <Actions>
            <Button variant="raised">
                <Label>Cancel</Label>
            </Button>
        </Actions>
    </Dialog>
    <TopAppBar color="primary" variant="static">
        <Row>
            <Section>
                <!-- <IconButton class="material-icons">menu</IconButton> -->
                {currentRoute.name}
            </Section>
            <!-- {#if !isLoginRoute}
                <Section>
                    <Navigate to="/hub">hub</Navigate>
                    <Navigate to="/devhub">devhub</Navigate>
                </Section>
            {/if} -->
            <Section align="end">
                {#if isLoginRoute}
                    {#if $userProfileStore.login}
                        <IconButton
                            class="material-icons"
                            on:click={() => {
                                userProfileStore.set({});
                            }}>logout</IconButton
                        >
                    {/if}
                {:else if $userProfileStore.isIcHubUser}
                    <IconButton
                        class="material-icons"
                        on:click={() => {
                            profileOpen = true;
                        }}>person</IconButton
                    >
                    <Navigate to={`/logout`}>
                        <IconButton
                        class="material-icons"
                       >logout</IconButton
                    >
                    </Navigate>
                    
                {:else}
                    <Navigate to={`/login?returl=${encodeURIComponent(currentRoute.path)}`}>
                        <IconButton class="material-icons">login</IconButton>
                    </Navigate>
                {/if}
            </Section>
        </Row>
    </TopAppBar>
    <div class="main-content-container">
        <Route {currentRoute} />
    </div>
</main>

<style>
    .site-layout-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .main-content-container {
        flex: 1;
        overflow-y: scroll;
        overflow-x: hidden;
        background-color: white;
    }
</style>
