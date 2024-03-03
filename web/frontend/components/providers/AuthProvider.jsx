import { createContext, useContext } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";

import { useAppQuery } from "../../hooks";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const app = useAppBridge();
  const redirect = Redirect.create(app);

  const { data, isLoading } = useAppQuery({
    url: "/api/user/check",
    key: "userCheck",
    reactQueryOptions: {
      refetchOnWindowFocus: true,
      onError: () => {
        redirect.dispatch(Redirect.Action.APP, "/");
      },
      onSuccess: (data) => {
        if (!data || !data?.isAuthenticated) {
          return redirect.dispatch(Redirect.Action.APP, "/");
        }
      },
    },
  });

  return (
    <AuthContext.Provider value={{ data, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
