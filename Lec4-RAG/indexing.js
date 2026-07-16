import 'dotenv/config';
import {PDFLoader} from '@langchain/community/document_loaders/fs/pdf';
import {OpenAIEmbeddings} from '@langchain/openai'; // model we will use to create vector embeddings
import {QdrantVectorStore} from '@langchain/qdrant'; // to store the vector embeddings

console.log("--- DEBUG ENVIRONMENT ---");
console.log("Current Working Directory:", process.cwd());
console.log("OpenRouter Key Exists?:", !!process.env.OPENROUTER_API_KEY);
console.log("-------------------------");

async function generateVectorEmbeddingsForFile(filepath) {
    //Load the PDF content as document
    const loader = new PDFLoader(filepath);
    const document = await loader.load(); // already chunk data page by page

    // Initialize the embedding model
    const embedddings = new OpenAIEmbeddings({
        model: 'text-embedding-3-small',
        configuration: {
            baseURL: 'https://openrouter.ai/api/v1',
        },
        openAIApiKey: process.env.OPENROUTER_API_KEY
    })

    // the vector store
    const vectorStore = await QdrantVectorStore.fromExistingCollection(
        embedddings,
        {
            url: 'http://localhost:6333',
            collectionName: 'chaicode-docs'
        }
    );

    await vectorStore.addDocuments(document); // save the document + chunking into vector embeddings -> all those things it did internally

    console.log(`All the documents are indexed`);

}

generateVectorEmbeddingsForFile("./projectAI.pdf"); // if you want to index another pdf just run this file again 
// giving path to that particular pdf and it will add the vector embeddings of the boook to that same qdrant