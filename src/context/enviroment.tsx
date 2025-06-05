"use client";

import { createContext, useEffect, useState } from "react";

export const EnviromentContext = createContext<{
  mongo: string;
  mongoDb: string;
  mongoCollection: string;
  chatgpt: string;
  setMongo: (value: string) => void;
  setMongoDb: (value: string) => void;
  setMongoCollection: (value: string) => void;
  setChatgpt: (value: string) => void;
}>({
  mongo: "",
  mongoDb: "",
  mongoCollection: "",
  chatgpt: "",
  setMongo: () => {},
  setMongoDb: () => {},
  setMongoCollection: () => {},
  setChatgpt: () => {},
});

export const EnviromentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mongo, setMongo] = useState<string>("");
  const [mongoDb, setMongoDb] = useState<string>("");
  const [mongoCollection, setMongoCollection] = useState<string>("");
  const [chatgpt, setChatgpt] = useState<string>("");

  useEffect(() => {
    const mongo = localStorage.getItem("mongo");
    const mongoDb = localStorage.getItem("mongoDb");
    const mongoCollection = localStorage.getItem("mongoCollection");
    const chatgpt = localStorage.getItem("chatgpt");
    if (mongo) setMongo(mongo);
    if (mongoDb) setMongoDb(mongoDb);
    if (mongoCollection) setMongoCollection(mongoCollection);
    if (chatgpt) setChatgpt(chatgpt);
  }, []);

  return (
    <EnviromentContext.Provider
      value={{
        mongo,
        mongoDb,
        mongoCollection,
        chatgpt,
        setMongo,
        setMongoDb,
        setMongoCollection,
        setChatgpt,
      }}
    >
      {children}
    </EnviromentContext.Provider>
  );
};
