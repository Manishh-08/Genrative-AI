import 'dotenv/config'; // this will automatically import the env variable 
import OpenAI from "openai";

import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const RiskSchema = z.object({
    title: z.string().describe('actualt title for the risk'),
    tags: z.array(z.string()).describe('3-4 tags for this risk'),
    score: z.number().min(1).max(5).describe('risk level out of 5')
})
const OutputSchema = z.object({
    risks: z.array(RiskSchema).describe('array of risks')
})


// link .env Sdk-tut-Lec3/.env -> this cli will link .env to this particular folder with name .env

const Client = new OpenAI();

async function init() {
    const result = await Client.responses.parse({
        model: 'gpt-5.4-mini',
        input: `
        Extract the risk fromt the following document
        document: 
        CloudSync v2.0 launches August 15. 
        Android is blocked by a battery bug. 
        PayFlow changed their API and we haven't retested. 
        Two security flaws in auth are still unpatched. 
        Budget has only $1,500 left. 
        Legal hasn't reviewed GDPR export. 
        FastDrive launches August 1. 
        Support has 2 agents, not 5.
        `,
        text: {
            format: zodTextFormat(OutputSchema,'risks')
        }
    })
    console.log(result.output_parsed); // you can use json.stringfy to see actual array elements rather than Array tag
    
}
init();