import { createContext, ReactNode } from "react";

type Context = {
  fontFamily: string;
};

type Props = { children: ReactNode };

const context: Context = { fontFamily: "Inter_400Regular" };

export const AppContext = createContext<Context>(context);

export function AppContextProvider({ children }: Props) {
  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}
