import {WebClient} from "@slack/web-api";
import {ConversationsMembersArguments} from "@slack/web-api/dist/methods";

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

// Read a token from the environment variables
const token = process.env.SLACK_TOKEN;
const fromChannelId = process.env.FROM_CHANNEL_ID;
const toChannelId = process.env.TO_CHANNEL_ID ?? "";

// Initialize
const web = new WebClient(token);

(async () => {
    const me = (await web.auth.test()).user_id;
    if(!me){
        return
    }
    let cursor: string | undefined = undefined;
    while(true){
        const option1 = {
            channel: fromChannelId,
            cursor: cursor,
        } as ConversationsMembersArguments
        const response = await web.conversations.members(option1);
        cursor = response.response_metadata?.next_cursor;
        const members = response.members;
        if (!members){
            break
        }
        const index = members.indexOf(me);
        if (index >=0){
            members.splice(index, 1)
        }
        await web.conversations.invite({
            channel: toChannelId,
            users: members.join(",")
        });
        await sleep(5000);
    }
})();
