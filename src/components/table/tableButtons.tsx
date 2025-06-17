"use client";
import { Button } from "@mui/material";
// import { useState } from "react";
import { initDB } from "@/app/(helpers)/indexDb";
import { MdDeleteForever } from "react-icons/md";
import { TbMessageChatbotFilled } from "react-icons/tb";
import { text } from "stream/consumers";
export function DeleteButton({
  id,
  disabled = true,
  refetch,
}: //   ...props
{
  id: number;
  disabled?: boolean;
  refetch: () => void;
}) {
  const handleDelete: () => void = async () => {
    // const deleteFile = async (id: number) => {
    if (!disabled && confirm("Are you sure you want to delete this file?")) {
      const db = await initDB();
      await db.delete("files", id);
      console.log(`File with id ${id} deleted successfully.`);
      refetch();
    }
    // Optionally, you can refetch the data or update the state to reflect the deletion
    // };
  };
  return (
    <MdDeleteForever
      color={disabled ? "gray" : "red"}
      onClick={handleDelete}
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "1.5rem",
      }}
    />
  );
}

export function ChatButton({
  disabled = true,
  chunks,
  fileName,
  sessionId,
  texts,
  refetch,
}: {
  disabled?: boolean;
  chunks: string[];
  fileName: string;
  sessionId: string;
  texts: string[];
  refetch: () => void;
}) {
  const handleChat = async () => {
    try {
      if (chunks && fileName && sessionId && texts && disabled) {
        const formdata = new FormData();
        formdata.append("fileName", fileName);
        formdata.append("sessionId", sessionId);
        formdata.append("chunks", JSON.stringify(chunks));
        formdata.append("texts", JSON.stringify(texts));
        // console.log(formdata.get("chunks"));
        const res = await fetch("/api/files", {
          method: "PUT",
          body: formdata,
        });
        const data = await res.json();
        if (data.error) {
          alert(data.error);
        } else {
            alert(`file ${fileName} added to current session successfully.`);
          
        }
        refetch();
      }
    } catch (error) {
      alert(error || "An error occurred while processing your request.");
      console.error("Error in ChatButton:", error);
    }
  };
  return (
    <TbMessageChatbotFilled
      onClick={handleChat}
      color={disabled ? "gray" : "green"}
      style={{
        cursor: disabled ? "pointer" : "not-allowed",
        fontSize: "1.5rem",
      }}
    />
  );
}
