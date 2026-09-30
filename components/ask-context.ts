"use client";

import { createContext, useContext } from "react";

export const AskContext = createContext<(question: string) => void>(() => {});

/** Send a question from any ask box on the page. */
export const useAsk = () => useContext(AskContext);
