import React, { createContext, useContext, useState } from "react";
const CompareContext = createContext(undefined);
export const CompareProvider = ({
  children
}) => {
  const [compareItems, setCompareItems] = useState([]);
  const addToCompare = product => {
    if (compareItems.length < 4 && !compareItems.find(p => p._id === product._id)) {
      setCompareItems(prev => [...prev, product]);
    }
  };
  const removeFromCompare = id => {
    setCompareItems(prev => prev.filter(p => p._id !== id));
  };
  const isInCompare = id => compareItems.some(p => p._id === id);
  const clearCompare = () => setCompareItems([]);
  return <CompareContext.Provider value={{
    compareItems,
    addToCompare,
    removeFromCompare,
    isInCompare,
    clearCompare
  }}>
      {children}
    </CompareContext.Provider>;
};
export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
};
