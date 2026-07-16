import 'dotenv/config'; // this will automatically import the env variable 
import OpenAI from "openai";



// link .env Sdk-tut-Lec3/.env -> this cli will link .env to this particular folder with name .env

const Client = new OpenAI({
    baseURL: process.env.OPENROUTER_BASE_URL,
    apiKey: process.env.OPENROUTER_API_KEY,
});

async function init() {
    const stream = await Client.responses.create({
        model: 'gpt-5.4-mini',
        stream: true,
        max_output_tokens: 100,
        input: `
        tell me a story in sentence?
        `
    })
    
    for await (const event of stream){
        // console.log(event);
        if(event && event.delta) process.stdout.write(event.delta);
    }
    
}
init();