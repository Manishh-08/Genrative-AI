import { OpenAI } from "openai";
const apiKey = process.env.OPENAI_API_KEY;

const Client = new OpenAI({
    apiKey: apiKey
})

async function main() {
    const result = await Client.chat.completions.create({
        model : "gpt-5.4-mini",
        messages : [{
            role: 'user', 
            content : "tell me a story about trauamatizing red wedding" }]
    })
    console.log("Ans from ChatGpt is: ",result.choices[0].message.content );
}

main();