export const runtime = "nodejs";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { pipeline } from "@xenova/transformers";
import {
  addToIndex,
  deleteIndex,
  getIndexFiles,
  searchIndex,
  vectorPool,
  reshapeTensor,
  preprocessText,
} from "../(helpers)/indexes";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");
  let sessionId = formData.get("sessionId");

  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), {
      status: 400,
    });
  }
  // console.log(file);
  const loader = new PDFLoader(file); // use .filepath, not Blob
  const docs = await loader.load();
  const textExtract = docs.map((doc) => doc.pageContent).join("\n");
  const text = preprocessText(textExtract);

  // console.log(text);
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
  const texts = [];
  for (const chunk of output) {
    let embed = await extractor(chunk.pageContent);
    const reshaped = reshapeTensor(embed.data, embed.dims); // [tokens][384]
    embed = vectorPool(reshaped);
    chunks.push(embed);
    texts.push(chunk.pageContent);

    console.log(embed.length, embed);
  }
  console.log(`Extracted ${chunks.length} chunks from the document.`);
  if (!sessionId) {
    sessionId = uuidv4();
  }
  // console.log(chunks)
  console.log(`session ID: ${sessionId}`);
  const index = addToIndex(sessionId, chunks, texts, file.name);
  console.log(index);
  return new Response(JSON.stringify({ success: true, sessionId, chunks, texts }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT(req) {
  const formData = await req.formData();
  const files = formData.get("fileName");
  const sessionId = formData.get("sessionId");
  const chunks = formData.getAll("chunks");
  const texts = formData.getAll("texts");
  if (!sessionId || !files || !chunks || !texts) {
    return new Response(
      JSON.stringify({
        error: "Session ID, file name and chunks are required",
      }),
      { status: 400 }
    );
  }
  console.log("Updating index for session:", sessionId);
  console.log("Files:", files);
  // console.log("chunks:", JSON.parse(chunks)[0].length);

  const index = addToIndex(sessionId, JSON.parse(chunks), files, JSON.parse(texts));
  console.log("Index updated:", index);
  if (index.error) {
    return new Response(JSON.stringify({ error: index.error }), {
      status: 500,
    });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function GET(req) {
  const query = req.nextUrl.searchParams.get("query") || "";
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "Session ID is required" }), {
      status: 400,
    });
  }

  let names;
  try {
    if (query) {
      const extractor = await pipeline(
        "feature-extraction",
        "Xenova/paraphrase-multilingual-MiniLM-L12-v2"
      );
      const embed = await extractor(query);
      const reshaped = reshapeTensor(embed.data, embed.dims);
      const vector = vectorPool(reshaped);
      
      names = searchIndex(sessionId, vector);
      console.log(names);
    } else {
      names = getIndexFiles(sessionId);
      if (names.files) {
        names = names.files;
      }
    }
    if (!names || names.length === 0) {
      return new Response(JSON.stringify({ error: "No files found" }), {
        status: 404,
      });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
  console.log(names)
  return new Response(JSON.stringify({ success: true, data: names }), {
    status: 200,
  });
}

export async function DELETE(req) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "Session ID is required" }), {
      status: 400,
    });
  }
  deleteIndex(sessionId);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
