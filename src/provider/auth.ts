import type { AuthProvider } from "@refinedev/core";
import { API_URL, dataProvider } from "./data";

// For demo purposes and to make it easier to test the app, you can use the following credentials:

export const authCredentials = {
  email: "michael.scott@dundermifflin.com",
  password: "demodemo",
};

export const authProvider: AuthProvider = {
  login: async ({ email }) => {
    try {
      const { data } = await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        meta: {
          variables: { email },
          rawQuery: `
                    mutation Login($email: String!) {
                        login(loginInput: { email: $email }) {
                            accessToken
                        }
                    }
                `,
        },
      });

      if (!data?.login?.accessToken) {
        throw new Error("Invalid credentials");
      }

      localStorage.setItem("access_token", data.login.accessToken);

      return {
        success: true,
        redirectTo: "/",
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return {
          success: false,
          error: {
            message: error.message || "Login failed",
            name: error.name || "Invalid email or password",
          },
        };
      }

      return {
        success: false,
        error: {
          message: "An unknown error occurred",
          name: "UnknownError",
        },
      };
    }
  },

  // simply remove the accessToken from local storage for the logout
  logout: async () => {
    localStorage.removeItem("access_token");

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  onError: async (error) => {
    // a check to see if the error is an authentication error
    if (error.statusCode === "UNAUTHENTICATED") {
      return {
        logout: true,
      };
    }

    return { error };
  },
  check: async () => {
    try {
      // get the identity of the user
      // this to know if the user is authenticated or not
      await dataProvider.custom({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          rawQuery: `
                    query Me {
                        me {
                          name
                        }
                      }
                `,
        },
      });

      // if the user is authenticated redirect to home page
      return {
        authenticated: true,
        redirectTo: "/",
      };

      // for any other error redirect to login page
    } catch (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },

  // get the user info
  getIdentity: async () => {
    const accessToken = localStorage.getItem("access_token");

    try {
      // call the GraphQL API to get the user info
      // we're using me:any because the GraphQL API doesn't have a type for me query yet
      const { data } = await dataProvider.custom<{ me: any }>({
        url: API_URL,
        method: "post",
        headers: accessToken
          ? {
              // send the accessToken in the AUthorization header
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
        meta: {
          // get the user info like email, name etc
          rawQuery: `
                    query Me {
                        me {
                            id,
                            name,
                            email,
                            phone,
                            jobTitle,
                            timezone
                            avatarUrl
                        }
                      }
                `,
        },
      });

      return data.me;
    } catch (error) {
      return undefined;
    }
  },
};
