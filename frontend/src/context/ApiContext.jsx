import React from "react";
import { createContext, useContext } from "react";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const BASE_URL = "http://localhost:2014";

  return (
    <ApiContext.Provider value={{ BASE_URL }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
