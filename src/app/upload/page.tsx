"use client";
import { Button, ButtonProps, Switch, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { initDB } from "@/app/(helpers)/indexDb";
import FilesTable from "@/components/table/table";
import { text } from "stream/consumers";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLocal, setIsLocal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [session, setSession] = useState<string>("");
  // const [localDb, setLocalDb] = useState<string[]>([]);

  const { data, refetch } = useQuery({
    queryKey: ["getIndexes"],
    queryFn: async () => {
      const res = await fetch(`/api/files?sessionId=${session}`, {
        method: "GET",
      });
      console.log(res);
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return data.data;
    },
  });
  const { data:localDb, refetch: refetchLocalDb } = useQuery({
    queryKey: ["getLocalDb", selectedFile, session],
    queryFn: async () => {
      const db = await initDB();
      const files = await db.getAll("files");
      return files;
    },
  });
  // useEffect(() => {
    // const fetchLocalDb = async () => {
    //   const db = await initDB();
    //   const files = await db.getAll("files");
    //   setLocalDb(files);
    // };
    // fetchLocalDb();
  // }, [selectedFile]);

  const checkDuplicateFile = async (fileName: string) => {
    const db = await initDB();
    const files = await db.getAll("files");
    return files.some((file: { name: string }) => file.name === fileName);
  }
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }
    setSelectedFile(file);
  };
  const handleUpload = async () => {
    if (!selectedFile) return;
    const isDuplicate = await checkDuplicateFile(selectedFile.name);
    if (isDuplicate) {
      alert("File already exists in the database.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (session) formData.append("sessionId", session);
      console.log(selectedFile);
      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setLoading(false);
      setSession(data.sessionId || "");
      localStorage.setItem("sessionId", data.sessionId || "");
      setSelectedFile(null);
      const db = await initDB();
      await db.add("files", {
        name: selectedFile.name,
        date: new Date(),
        chunks: data.chunks,
        texts: data.texts,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
      setLoading(false);
    }
  };
  const buttonProps: ButtonProps = {
    variant: "outlined",
    component: "label",
    fullWidth: true,
    sx: {
      mt: 1,
      mb: 2,
      borderColor: "#882024",
      width: "fit-content",
    },
    // disabled: !selectedFile,
  };
  // useEffect(() => {
  //   const savedMongo = localStorage.getItem("mongo");
  //   const savedMongoCollection = localStorage.getItem("mongoCollection");
  //   if (savedMongo || savedMongoCollection) {
  //     setIsLocal(true);
  //   }
  // }, []);
  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      setSession(sessionId);
    }
  }, []);
  console.log("Local DB:", localDb);
  console.log('Data:',data)
  return (
    <div>
      
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleUpload();
      }}
    >
      <div className="flex items-center justify-center min-h-screen flex-col">
        {localDb && localDb.length > 0 && (
        <div className="flex items-center justify-center flex-col mb-4">
          <p className="text-gray-600">
            You have uploaded the following files:
          </p>
          {/* <ul className="list-disc list-inside">
            {localDb.map((value: any) => (
              <li key={value.name}>{value.name}</li>
            ))}
          </ul> */}
          <FilesTable tableData={localDb} indexed={data} refetchLocal={refetchLocalDb} refetchIndex={refetch} sessionId={session}/>
        </div>
      )}
        <p className="text-gray-600">
          Select a PDF file to upload. The file will be processed and stored.
        </p>
        <p className="text-gray-600 mb-4">
          Make sure the file is less than 10MB in size and is a valid PDF.
        </p>
        <Button {...buttonProps}>
          {selectedFile ? `File: ${selectedFile.name}` : "Choose PDF File"}
          <input
            type="file"
            hidden
            accept=".pdf" // Accept only PDF files
            onChange={handleFileChange}
            required
          />
        </Button>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="contained"
            color="primary"
            // onClick={handleUpload}
            type="submit"
            disabled={!selectedFile || loading}
          >
            Upload
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setSelectedFile(null)}
            disabled={!selectedFile || loading}
          >
            Delete
          </Button>
        </div>
      </div>
    </form>
    </div>
  );
}
