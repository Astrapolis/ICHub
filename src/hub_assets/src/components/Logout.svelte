<script>
    import { onMount, onDestroy } from "svelte";

    import { AuthClient } from "@dfinity/auth-client";
    import { navigateTo } from "svelte-router-spa";

    import { userProfileStore } from "../store/user";

    import LoadingPanel from "./LoadingPanel.svelte";

    let authClient = null;

    onMount(async () => {
        authClient = await AuthClient.create({
            idleOptions: {
                idleTimeout: 1000 * 60 * 30, // set to 30 minutes
            },
        });
        let authenticated = await authClient.isAuthenticated();
        if (authenticated) {
            await authClient.logout();
        }

        userProfileStore.set({});
        navigateTo("/");
    });
</script>

<LoadingPanel layout="full" description="logouting ..." />
