import { Readable } from 'stream';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { pipeline } from '@xenova/transformers';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');

  // const stream = streamifyRequest(req);

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
  }
  console.log(file)
  const loader = new PDFLoader(file); // use .filepath, not Blob
  const docs = await loader.load();
  const text = docs.map(doc => doc.pageContent).join("\n");
  console.log(text)
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/paraphrase-multilingual-MiniLM-L12-v2"
  );

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: formData?.fields?.chunkSize || 500,
    chunkOverlap: formData?.fields?.chunkOverlap || 50,
  });

  const output = await splitter.createDocuments([text]);

  const chunks = [];
  for (const chunk of output) {
    const embed = await extractor(chunk.pageContent);
    chunks.push({ chunk: chunk, embed: embed, meta: file.name });
  }
  console.log(chunks)

  return new Response(JSON.stringify({ success: true, chunks }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
