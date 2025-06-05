import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { pipeline } from "@xenova/transformers";
import { MongoClient } from "mongodb";

export const config = {
  api: {
    bodyParser: false,
  },
};
function preprocessText(text) {
  text = text.replace(/\W+/g, " "); // Remove special characters
  text = text.replace(/\s+/g, " ").trim(); // Remove extra spaces
  return text.toLowerCase();
}

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");
  const mongo = formData.get("mongo");
  const mongoDb = formData.get("mongoDb");
  const mongoCollection = formData.get("mongoCollection");
  let collection, db;
  if (!mongo || !mongoDb || !mongoCollection) {
    return new Response(
      JSON.stringify({ error: "MongoDB connection details are required" }),
      { status: 400 }
    );
  } else {
    console.log("MongoDB connection details provided");
    const client = new MongoClient(mongo);
    try {
      await client.connect();
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      return new Response(
        JSON.stringify({ error: "Failed to connect to MongoDB" }),
        { status: 500 }
      );
    }
    db = client.db(mongoDb);
    collection = db.collection(mongoCollection);
    console.log(`Using MongoDB collection: ${mongoCollection}`);
  }
  // const stream = streamifyRequest(req);

  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), {
      status: 400,
    });
  }
  console.log(file);
  const loader = new PDFLoader(file); // use .filepath, not Blob
  const docs = await loader.load();
  const textExtract = docs.map((doc) => doc.pageContent).join("\n");
  const text = preprocessText(textExtract);

  console.log(text);
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
    chunks.push({ chunk: chunk, embedding: embed, meta: file.name });
  }
  console.log(`Extracted ${chunks.length} chunks from the document.`);
  if (mongo && mongoDb && mongoCollection) {
    try {
      await collection.insertMany(chunks);
      await db.collection("pdfs-names").insertOne({ name: file.name });
      console.log(
        `Inserted ${chunks.length} chunks of ${file.name} into MongoDB collection: ${mongoCollection}`
      );
    } catch (error) {
      console.error("Failed to insert chunks into MongoDB:", error);
      return new Response(
        JSON.stringify({ error: "Failed to insert chunks into MongoDB" }),
        { status: 500 }
      );
    }
  }

  return new Response(JSON.stringify({ success: true, chunks }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req) {
  const uri = req.nextUrl.searchParams.get("mongo");
  const dbName = req.nextUrl.searchParams.get("mongoDb");
  const client = new MongoClient(uri);
  let db, collection;
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db(dbName);
    collection = db.collection("pdfs-names");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return new Response(
      JSON.stringify({ error: "Failed to connect to MongoDB" }),
      { status: 500 }
    );
  }
  const names = await collection.find().toArray();
  // console.log(names);
  return new Response(JSON.stringify({ success: true, files: names }), {
    status: 200,
  });
}

export async function DELETE(req) {
  const uri = req.nextUrl.searchParams.get("mongo");
  const dbName = req.nextUrl.searchParams.get("mongoDb");
  const collectionName = req.nextUrl.searchParams.get("mongoCollection");
  const fileName = req.nextUrl.searchParams.get("fileName");
  const client = new MongoClient(uri);
  let db, collection;
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db(dbName);
    collection = db.collection("pdfs-names");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return new Response(
      JSON.stringify({ error: "Failed to connect to MongoDB" }),
      { status: 500 }
    );
  }
  try {
    await db.collection(collectionName).deleteMany({ meta: fileName });
    await collection.deleteOne({ name: fileName });
  } catch (error) {
    console.error("Failed to delete file from MongoDB:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete file from MongoDB" }),
      { status: 500 }
    );
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
