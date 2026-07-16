import 'dotenv/config';
import {PDFLoader} from '@langchain/community/document_loaders/fs/pdf';
import {OpenAIEmbeddings} from '@langchain/openai';
import {QdrantVectorStore} from '@langchain/qdrant';
import OpenAI from 'openai';

async function query(userQuery) {
    const client =  new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey : process.env.OPENROUTER_API_KEY
    })

    // convert the userQuery into vector embeddings

    // initialize the embeddings model
    const embedddings = new OpenAIEmbeddings({
        model: 'text-embedding-3-small',
        configuration: {
            baseURL: 'https://openrouter.ai/api/v1',
        },
        openAIApiKey: process.env.OPENROUTER_API_KEY
    })

    // search the vector embeddings in the qdrants

    // the vector store
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embedddings,
        {
            url: 'http://localhost:6333',
            collectionName: 'chaicode-docs'
        }
    );

    // get similar vector and chunks
    const vectorRetriever = vectorStore.asRetriever({k:5}); // this means give me only top 5 chunks
    const results = await vectorRetriever.invoke(userQuery); // this will automatically convert the user query into vector embeddings and search it in vector store


    // feed those chunks to llm model and do a simple chat with {userQuery}
    const SYSTEM_PROMPT= `
    you are an expert in answering user query based on provided context about document. 
    do not answer beyond what is not provided.
    always answer the user in short and tell in which page the information/content is available and also name of the book

    User Document:
    ${results.map((e) => JSON.stringify({bookName: e.metadata.source, pageContent : e.pageContent, pageNumber: e.metadata.loc.pageNumber})).join('\n\n')} 
    `
    // console.log(SYSTEM_PROMPT);

    const LLMresponse = await client.responses.create({
        model:  'gpt-5.4-mini',
        input: [
            {role: 'system', content: SYSTEM_PROMPT},
            {role: 'user', content: userQuery }
        ]
    })

    console.log(`LLM Response: `, LLMresponse.output_text);
}

query('what is Black life?')