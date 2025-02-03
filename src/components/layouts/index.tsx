import { ThemedLayoutV2, ThemedTitleV2 } from "@refinedev/antd";
import Header from "./header";
import { useGetIdentity } from "@refinedev/core";
import { Navigate } from "react-router";
import LoadingSpinner from "../loading-spinner";

const Layout = ({ children }: React.PropsWithChildren) => {
  const { data: user, isLoading } = useGetIdentity();

  if (isLoading) return <LoadingSpinner />;
  return user ? (
    <ThemedLayoutV2
      Header={Header}
      Title={(titleProp) => <ThemedTitleV2 {...titleProp} text="Refine" />}
    >
      {children}
    </ThemedLayoutV2>
  ) : (
    <Navigate to="/login" />
  );
};

export default Layout;
