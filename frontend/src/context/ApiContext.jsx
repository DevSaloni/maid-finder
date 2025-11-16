import React from "react";
import { createContext, useContext } from "react";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const BASE_URL = "https://maid-finder-0k5w.onrender.com/";

  return (
    <ApiContext.Provider value={{ BASE_URL }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
