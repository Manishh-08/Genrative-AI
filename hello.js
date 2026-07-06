import {OpenAI} from "openai"
const apiKey = process.env.OPENAI_API_KEY;

const client =  new OpenAI({
    apiKey: apiKey
})

client.chat.completions.create({
    model : "gpt-5.4-mini",
    messages: [{role: "user", content: "Hello, how are you?"}]
}).then(response => {
    console.log(response.choices[0].message.content);
})  

