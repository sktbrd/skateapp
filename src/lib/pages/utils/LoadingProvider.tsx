import { ReactNode, createContext, useState } from "react";

interface LoadingContextProps {
  isLoadingInitial: boolean;
  setIsLoadingInitial: (isLoading: boolean) => void;
}

export const LoadingContext = createContext<LoadingContextProps>({
  isLoadingInitial: true,
  setIsLoadingInitial: () => {},
});

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  return (
    <LoadingContext.Provider value={{ isLoadingInitial, setIsLoadingInitial }}>
      {children}
    </LoadingContext.Provider>
  );
};
