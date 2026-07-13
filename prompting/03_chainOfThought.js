import { OpenAI } from 'openai';
const apiKey = process.env.OPENAI_API_KEY;
const Client = new OpenAI({
  apiKey: apiKey
})

const SYSTEM_PROMPT = `
  You are an expert AI Engineer. You have to analyse user's input carefully and then you need to
  breakdown the problem into multiple sub problems before coming to the final solution or output. 
  Always breakdown the user's intention and how to solve the problem and then step by step solve it.

  We are going to follow the pipeline of "INITAL", "THINK", "ANALYSE" and "OUTPUT" pipeline.

  The Pipeline:
  - "INITIAL" when user gives an input, we will have an initial thought process of what the user is trying to do.
  - "THINK" this is where we are going to think how to solve the problem and then breaking it down further.
  - "ANALYSE" this is where we will analyse the solution and also verify if the output is correct.
  - "THINK" we can go back to think process again if any sub problem is remaining to be addressed.
  - "ANALYSE" again analyse the problem and get onto a solution.
  - "OUTPUT" this is where we can end and give the Final output to the User.

  Rules: 
  - Always output one step at a time and wait for other step before proceeding.
  - Always maintain the sequence of pipeline as given in example.
  - Always follow JSON output format strictly.

  Examples:
  - "USER": what is 2 + 2 - 5 * 10 / 2?
  OUTPUT:
  - "INITIAL": "user wants me to simplify math expression"
  - "THINK": "I will use the BODMAS(maths one not the computer one) rule to solve this particular problem, so first i will find the division part since there are no brackets i.e 10 / 2 is equal to 5 ".
  - "ANALYSE": "yes, i have applied BODMAS rule to solve all divide subproblems first now the problem breaks down to 2 + 2 - 5 * 5 ".
  - "THINK": "now i should solve all the multiplication part i.e so now find all the multiplication part so now the problem becomes 2 + 2 - 25"
  - "ANALYSE": "yes i have solve all multiplications sub problems and i just simply need to solve add and subtract part"
  - "THINK" : " 2 + 2 - 25, this becomes -19".
  - "ANALYSE": "yes i have solve all subproblems using BODMAS rule and come to an final solution of -19".
  - "OUTPUT": "Your Final ans is -19"
 
  Output Format:
  {
    "step": "INITIAL" | "THINK" | "ANALYSE" | "OUTPUT", 
    "text": "<The Actual Text>" }
  }
`;

const MESSAGES_DB = [{ role: 'system', content: SYSTEM_PROMPT}];

async function main(prompt = '') { 

  MESSAGES_DB.push({ role: 'user', content: prompt})

  while(true){
      const result = await Client.chat.completions.create({
        model : 'gpt-5.4-mini',
        messages : MESSAGES_DB,
        response_format: { type: "json_object" }
      });
    
    const rawResult = result.choices[0].message.content;
    const parsedResult = JSON.parse(rawResult);

    MESSAGES_DB.push({ role: 'assistant', content: rawResult})

    console.log(`🤖 (${parsedResult.step}) : ${parsedResult.text}` )

    // if(parsedResult.step.toLowerCase() === 'think') {
    //   //TODO: make a claude call to validate if thinking is right or not,,,, here work is done by gpt by verified by claude
    //  multiple agents working together to figure it out
    // }

    if(parsedResult.step.toLowerCase() === 'output') break;
  }
  }
    

main("what is meaning of life?");
