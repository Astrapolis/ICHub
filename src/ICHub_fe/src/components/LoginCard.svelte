<script>
  import { createEventDispatcher } from "svelte";
  import { Principal } from "@dfinity/principal";
  import { AuthClient } from "@dfinity/auth-client";
  import Paper, { Title, Content } from "@smui/paper";
  import Button, { Label } from "@smui/button";

  const dispatch = createEventDispatcher();
</script>
<div>
    <Paper>
        <Content>
            <Button variant="raised">
                <Label>II Login</Label>
              </Button>
        </Content>
    </Paper>
</div>
