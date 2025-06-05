"use client";
import { Button, ButtonProps, Switch, TextField } from "@mui/material";
import { useState, useContext, useEffect } from "react";
import { EnviromentContext } from "@/context/enviroment";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLocal, setIsLocal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  // const [mongoUri, setMongoUri] = useState<string>("");
  const { mongo, setMongo, mongoCollection, setMongoCollection, mongoDb, setMongoDb } =
    useContext(EnviromentContext);
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
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mongo", mongo);
      formData.append("mongoDb", mongoDb);
      formData.append("mongoCollection", mongoCollection);
      console.log(selectedFile);
      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      console.log(res);
      setLoading(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
      setLoading(false);
    }
  };
  const handleLocal = (value: boolean) => {
    setIsLocal(value);
    if (value) {
      localStorage.setItem("mongo", mongo);
      localStorage.setItem("mongoDb", mongoDb);
      localStorage.setItem("mongoCollection", mongoCollection);
    } else {
      localStorage.removeItem("mongo");
      localStorage.removeItem("mongoDb");
      localStorage.removeItem("mongoCollection");
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
  useEffect(() => {
    const savedMongo = localStorage.getItem("mongo");
    const savedMongoCollection = localStorage.getItem("mongoCollection");
    if (savedMongo || savedMongoCollection) {
      setIsLocal(true);
    }
  }, []);
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleUpload();
    }}>
    <div className="flex items-center justify-center min-h-screen flex-col">
      <h1 className="text-2xl font-bold mb-4">Upload PDF File</h1>
      <p className="text-gray-600 mb-2">
        Please set the mongo uri and state the collection name where the index
        is set
      </p>
      <div className="flex flex-wrap gap-4 mb-4">
        <TextField
          label="Mongo URI"
          variant="outlined"
          margin="normal"
          value={mongo || ""}
          onChange={(e) => setMongo(e.target.value)}
          required
        />
        <TextField
          label="Mongo Db Name"
          variant="outlined"
          margin="normal"
          value={mongoDb || ""}
          onChange={(e) => setMongoDb(e.target.value)}
          required
        />
        <TextField
          label="Mongo Collection Name"
          variant="outlined"
          margin="normal"
          value={mongoCollection || ""}
          onChange={(e) => setMongoCollection(e.target.value)}
          required
        />
        <div className="flex items-center">
          <label className="mr-2 text-gray-600">Save Locally:</label>
          <Switch
            checked={isLocal}
            color="primary"
            inputProps={{ "aria-label": "controlled" }}
            disabled={(!mongo || !mongoCollection || !mongoDb) && !isLocal}
            onChange={(e) => handleLocal(e.target.checked)}
          />
        </div>
      </div>
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
  );
}
