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
            content : `whats 2 + 2 equals?
            Do not add anything else in ans, take the samples from the examples
            Examples : 
            - what is 5 + 4?
              Expected output = 9(Nine)
            - What is 10 + 10?
              Expected ouptut = 20(Twenty)  
            ` }]
    })
    console.log("Ans from ChatGpt is: ",result.choices[0].message.content );
}

main();
