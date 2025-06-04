"use client";
import { Button, ButtonProps } from "@mui/material";
import { useState } from "react";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };
  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    console.log(selectedFile)
    const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
    });
    console.log(res)
  }
  const buttonProps: ButtonProps = {
    variant: "outlined",
    component: "label",
    fullWidth: true,
    sx: {
      mt: 1,
      mb: 2,
      borderColor: "#882024",
    },
    // disabled: !selectedFile,
  };
  return (
    <div className="flex items-center justify-center">
      <Button {...buttonProps}>
        {selectedFile ? `File: ${selectedFile.name}` : "Choose PDF File"}
        <input
          type="file"
          hidden
          accept=".pdf" // Accept only PDF files
          onChange={handleFileChange}
        />
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!selectedFile}
      >
        Upload
      </Button>
    </div>
  );
}

