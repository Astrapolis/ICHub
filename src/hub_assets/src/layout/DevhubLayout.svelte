<script>
    import { onMount } from "svelte";
    import { Navigate, Route, navigateTo, routeIsActive } from "svelte-router-spa";
    import Drawer, { AppContent, Content } from "@smui/drawer";
    import List, {
        Item,
        Graphic,
        Separator,
        Text,
        Meta,
        Group,
        Subheader,
    } from "@smui/list";
    import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
    import { Icon, Label } from "@smui/common";

    import Fab from "@smui/fab";
    import Button from "@smui/button";
    import IconButton from "@smui/icon-button";

    export let currentRoute;

    const ROOTPATH = "/devhub/admin";
    let params = {};
    let casesOpen = false;

    onMount(() => {
        console.log("dev hub layout", currentRoute);
    });
</script>

<div class="drawer-container">
    <Drawer>
        <Content>
            <!-- <Group>
            <Subheader>
                <Item>
                    <Graphic class="material-icons">dashboard</Graphic>
                    <Text>
                        <Navigate to={`${ROOTPATH}`}>dashboard</Navigate>
                    </Text>
                </Item>
            </Subheader>
            <Subheader>
                <Graphic class="material-icons">favorite</Graphic>
                <Text>
                    <Navigate to={`${ROOTPATH}/follows`}>follows</Navigate>
                </Text>
            </Subheader>
            <Subheader>
                <Graphic
                    ><IconButton toggle>
                        <Icon class="material-icons" on>unfold_less</Icon>
                        <Icon class="material-icons">unfold_more</Icon>
                    </IconButton></Graphic
                >
                <Text>cases</Text>
            </Subheader> -->
            <List dense>
                <Item on:SMUI:action={() => navigateTo(`${ROOTPATH}`)}>
                    <Graphic class="material-icons">dashboard</Graphic>
                    <Text>dashboard</Text>
                    {#if routeIsActive(`${ROOTPATH}`)}
                        <Meta>
                            <Icon class="material-icons">arrow_right</Icon>
                        </Meta>
                    {/if}
                </Item>
                <Item on:SMUI:action={() => navigateTo(`${ROOTPATH}/follows`)}>
                    <Graphic class="material-icons">favorite</Graphic>
                    <Text>follows</Text>
                    {#if routeIsActive(`${ROOTPATH}/follows`, true)}
                        <Meta>
                            <Icon class="material-icons">arrow_right</Icon>
                        </Meta>
                    {/if}
                </Item>
                <Item on:SMUI:action={() => navigateTo(`${ROOTPATH}/cases`)}>
                    <Graphic class="material-icons">work</Graphic>
                    <Text>cases</Text>
                    {#if routeIsActive(`${ROOTPATH}/cases`, true)}
                        <Meta>
                            <Icon class="material-icons">arrow_right</Icon>
                        </Meta>
                    {/if}
                </Item>
                <!-- {#if casesOpen}
                    <List>
                        <Item>
                            <Text>a</Text>
                        </Item>
                        <Item>
                            <Text>b</Text>
                        </Item>
                        <Item>
                            <Text>c</Text>
                        </Item>
                    </List>
                {/if} -->
                <Item on:SMUI:action={() => navigateTo(`${ROOTPATH}/history`)}>
                    <Graphic class="material-icons">work_history</Graphic>
                    <Text>history</Text>
                    {#if routeIsActive(`${ROOTPATH}/history`, true)}
                        <Meta>
                            <Icon class="material-icons">arrow_right</Icon>
                        </Meta>
                    {/if}
                </Item>
            </List>
            <!-- <Subheader>
                <Graphic class="material-icons">work_history</Graphic>
                <Text>
                    <Navigate to={`${ROOTPATH}/history`}>history</Navigate>
                </Text>
            </Subheader>
        </Group> -->
        </Content>
    </Drawer>
    <AppContent class="app-content">
        <div class="main-content">
            <Route {currentRoute} />
        </div>
    </AppContent>
</div>

<style>
    .drawer-container {
        position: relative;
        display: flex;
        height: 100%;
        width: 100%;
        border: 1px solid
            var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.1));
        overflow: hidden;
        z-index: 0;
    }

    * :global(.app-content) {
        flex: auto;
        overflow: auto;
        position: relative;
        flex-grow: 1;
    }

    .main-content {
        overflow: auto;
        padding: 16px;
        height: 100%;
        box-sizing: border-box;
    }
</style>
