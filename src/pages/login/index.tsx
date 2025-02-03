import { AuthPage } from "@refinedev/antd";
import { authCredentials } from "../../provider";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      formProps={{
        initialValues: authCredentials,
      }}
    />
  );
};
