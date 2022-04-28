<script>
  import { IDL } from "@dfinity/candid";
  import Paper, { Title, Content } from "@smui/paper";
  import Textfield from "@smui/textfield";
  import Button, { Label } from "@smui/button";
  let newCanisterId = null;
  function handleSubmitNewCanister(event) {
    event.preventDefault();
    console.log("submit with new canister id", newCanisterId);
  }
</script>

<div>
  <Paper>
    <Title>观察新的canister</Title>
    <Content>
      <form on:submit={handleSubmitNewCanister}>
        <div>
          <Textfield
            variant="outlined"
            bind:value={newCanisterId}
            label="请输入新的canister id"
            required
          />
          <Button variant="raised" type="submit">
            <Label>添加到观察列表</Label>
          </Button>
        </div>
      </form>
    </Content>
  </Paper>
</div>
