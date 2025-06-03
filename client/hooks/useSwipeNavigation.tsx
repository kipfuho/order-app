import { createContext, useContext } from "react";

interface SwipeContextType {
  navigateToNext: (_currentIndex: number) => void;
  navigateToPrevious: (_currentIndex: number) => void;
  totalPages: number;
}

export const SwipeContext = createContext<SwipeContextType | null>(null);

export const useSwipeNavigation = () => {
  const context = useContext(SwipeContext);
  if (!context) {
    throw new Error("useSwipeNavigation must be used within SwipeContext");
  }
  return context;
};
