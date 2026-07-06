import { OpenAI } from 'openai';
import axios  from 'axios';
import {exec} from 'child_process';

const apiKey = process.env.OPENAI_API_KEY;

const Client = new OpenAI({
    apiKey: apiKey
})

async function getWeatherData(cityName){
  const url = `https://wttr.in/${cityName.toLowerCase()}?format=%C+%t`;
  const response = await axios.get(url,{responseType : 'text'});
  return JSON.stringify({
    cityName,
    weatherInfo : response.data
  })
}
async function executeCommandCli(cmd){
  return new Promise((res,rej)=> {
    exec(cmd,(err, out) => {
      if(err) return res(`there was an error ${err}`)
        else return res(out);
    })
  })

}

const SYSTEM_PROMPT = `
  You are an expert AI Engineer. You have to analyse user's input carefully and then you need to
  breakdown the problem into multiple sub problems before coming to the final solution or output. 
  Always breakdown the user's intention and how to solve the problem and then step by step solve it. Also talk in hood language.

  We are going to follow the pipeline of "INITAL", "THINK", "TOOL_REQUEST", "ANALYSE" and "OUTPUT" pipeline.

  The Pipeline:
  - "INITAL" when user gives an input, we will have an initial thought process of what the user is trying to do.
  - "THINK" this is where we are going to think how to solve the problem and then breaking it down further.
  - "ANALYSE" this is where we will analyse the solution and also verify if the output is correct.
  - "THINK" we can go back to think process again if any sub problem is remaining to be addressed.
  - "TOOL_REQUEST" use this for calling or requesting a tool. the format of output would be
    {"step": "TOOL_REQUEST", "functionName": "getWeatherData", "input": "Goa" }
  - "ANALYSE" again analyse the problem and get onto a solution.
  - "OUTPUT" this is where we can end and give the Final output to the User.

  Available Tools:
  - "getWeatherData": getWeatherData(cityName: string): Returns the realtime weather information of city
  - "executeCommandCli": executeCommandCli(cmd: string): Executes the command on user device and returns the output from stdout
  Rules: 
  - Always output one step at a time and wait for other step before proceeding.
  - Always maintain the sequence of pipeline as given in example.
  - Always follow JSON output format strictly.

  Example:
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

  Example:
  - "USER": "what is weather of Goa?"
  OUTPUT:
  - "INITIAL": "user wants me to fetch weather information"
  - "THINK": "From tools i can see we have a tool named getWeatherData which can be called".
  - "ANALYSE": "we are going right, we can call getWeatherData with input as Goa".
  - "TOOL_REQUEST": (strictly in JSON) { "functionName": "getWeatherData", "input": "Goa"}
  - "TOOL_OUTPUT": "weather of Goa is sunny with 30 degree celsius".
  - "THINK": "we got the weather info".
  - "OUTPUT": "weather of Goa is sunny with 30 degree celsius, its gonna be hot as fuck"
 
  Output Format: (striclty in JSON) 
  {
    "step": "INITIAL" | "THINK" | "ANALYSE" | "TOOL_REQUEST" | "OUTPUT", 
    "text": "<The Actual Text>",
    "functionName": "<NAME OF FUNCTION>",
    "input": "INPUT PARAMs of the function" }
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
    if(parsedResult.step.toUpperCase() === 'TOOL_REQUEST') {
      const {functionName, input} = parsedResult;
      switch(functionName){
        case 'executeCommandCli':{

          try {
            const toolResult = executeCommandCli(input);
            console.log(`👉: ${functionName}: ${input} => ${toolResult}`)
            MESSAGES_DB.push({
              role : 'developer',
              content: JSON.stringify({
                step: "TOOL_OUTPUT",
                content : JSON.stringify(toolResult)
              })
            });
          } catch (error) {
              MESSAGES_DB.push({
                role: 'developer',
                content: json.stringify({status: 'error', error})  
              })
          }
          continue;
        }
        case 'getWeatherData':{
          const toolResult = await getWeatherData(input);
          console.log(`👉: ${functionName}: ${input} => ${toolResult}`)
          MESSAGES_DB.push({
            role : 'developer',
            content: JSON.stringify({
              step: "TOOL_OUTPUT",
              content : JSON.stringify(toolResult)
            })
          });
          continue;
        }
        break;
      }
    }
  }
  }
    

main("what's the weather of Bhayandar and then write the output on beautiful webpage. create a new folder name weather and create all HTML CSS file and then run this on my browser");
