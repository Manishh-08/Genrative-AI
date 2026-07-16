import {Anthropic} from '@anthropic-ai/sdk';

const Client = new Anthropic({
    apiKey: process.env["ANTHROPIC_API_KEY"] // This is the default and can be omitted
});
// bhosdika credit card maaang rha h API key ke liye, kaha se laau bhenchod sikhne ke liye

async function init(){
    const result = await Client.messages.create({
        max_tokens : 1024,
        messages: [{ role: "user", content: "Hello, Claude" }],
        model: "claude-opus-4-8"
    })

    for (const block of result.content) {
        if (block.type === "text") {
          console.log(block.text);
        }
    }
}

init();