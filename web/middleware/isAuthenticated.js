import { Issuer } from 'openid-client';

const clientId = process.env.OIDC_CLIENT_ID;
const clientSecret = process.env.OIDC_CLIENT_SECRET;
const issuerURL = process.env.OIDC_ISSUER;

const isAuthenticated = async (req, res, next) => {
  try {
    req.user = {
      id: 'e5b41da4-2633-412f-8210-1569a2d0ce20',
      username: 'mark@yallacooperative.com',
      name: 'Mark Claydon',
      email: 'mark@yallacooperative.com',
      accessToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKVjg1bVRtUmh1MGtSeGNNb0FGUFl5azJMbS1WTExYV25HOG9HbUxNUkowIn0.eyJleHAiOjE3MDU5NDgxMjgsImlhdCI6MTcwNTk0NjMyOCwiYXV0aF90aW1lIjoxNzA1MzQwOTQxLCJqdGkiOiI1MTk2ZmM2YS1lYThlLTQwMGItYWJkZi0zOGE5OWUyOTkzNTAiLCJpc3MiOiJodHRwczovL2xvZ2luLmxlc2NvbW11bnMub3JnL2F1dGgvcmVhbG1zL2RhdGEtZm9vZC1jb25zb3J0aXVtIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImU1YjQxZGE0LTI2MzMtNDEyZi04MjEwLTE1NjlhMmQwY2UyMCIsInR5cCI6IkJlYXJlciIsImF6cCI6InlhbGxhZGV2Iiwic2Vzc2lvbl9zdGF0ZSI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImFjciI6IjAiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1kYXRhLWZvb2QtY29uc29ydGl1bSIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwic2lkIjoiZDRhMTY3OTYtMjU4OC00OTY1LTgyNWMtMDFlOTQ0NTEzMGRkIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiTWFyayBDbGF5ZG9uIiwicHJlZmVycmVkX3VzZXJuYW1lIjoibWFya0B5YWxsYWNvb3BlcmF0aXZlLmNvbSIsImdpdmVuX25hbWUiOiJNYXJrIiwiZmFtaWx5X25hbWUiOiJDbGF5ZG9uIiwiZW1haWwiOiJtYXJrQHlhbGxhY29vcGVyYXRpdmUuY29tIn0.h8lYV_qwpY-9y1LKC00LEsVmQZc1boH1uRUDA-uTdSDMT4h9Pgm57sCIvQf7-RtvE7eda_8zk_zqge1U0eRzNw-NscjCRlJWh_xWZP_Axx5Ul07jFzoQqflL3WG-VLcisouKJt_6cBov_XG7MC6rS8FzrYnoVstPheI33qUQBtWvo7QF9a4zSi-lPjfcAahTHUw_SqZ3sAHNeuQU1HJBY4kJKmSh1mwPHnda5h2g-YMMH9STVz9biFCAuDQTNF07wi6BNDzNmqspJjh855H13YY1V8P4t9xAYecqIUBaZPj9AYge7_BRnNuURydVP7m67NgD8xIc4Y9h5rqrqeMdtw',
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmNDcyMmM0My0xNWI0LTRkN2EtYjg0MC00ZWQwYjU2ZmIzMmEifQ.eyJleHAiOjE3MzY4NzY5NDEsImlhdCI6MTcwNTk0NjMyNiwianRpIjoiNmUzOGUxNTItNjUxNy00MmU3LWJlMDktMmNmZjBkOWQ4NWI0IiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5sZXNjb21tdW5zLm9yZy9hdXRoL3JlYWxtcy9kYXRhLWZvb2QtY29uc29ydGl1bSIsImF1ZCI6Imh0dHBzOi8vbG9naW4ubGVzY29tbXVucy5vcmcvYXV0aC9yZWFsbXMvZGF0YS1mb29kLWNvbnNvcnRpdW0iLCJzdWIiOiJlNWI0MWRhNC0yNjMzLTQxMmYtODIxMC0xNTY5YTJkMGNlMjAiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoieWFsbGFkZXYiLCJzZXNzaW9uX3N0YXRlIjoiZDRhMTY3OTYtMjU4OC00OTY1LTgyNWMtMDFlOTQ0NTEzMGRkIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCJ9.4J7NOy65rzozG_d_xfS-jbj_DqqZWHQqXe7KtIXpm50',
      idToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKVjg1bVRtUmh1MGtSeGNNb0FGUFl5azJMbS1WTExYV25HOG9HbUxNUkowIn0.eyJleHAiOjE3MDU5NDgxMjYsImlhdCI6MTcwNTk0NjMyNiwiYXV0aF90aW1lIjoxNzA1MzQwOTQxLCJqdGkiOiJhYjVjM2VkZi04OGQyLTRmZTItODZlNC01ZTkzM2U2NDIzMWIiLCJpc3MiOiJodHRwczovL2xvZ2luLmxlc2NvbW11bnMub3JnL2F1dGgvcmVhbG1zL2RhdGEtZm9vZC1jb25zb3J0aXVtIiwiYXVkIjoieWFsbGFkZXYiLCJzdWIiOiJlNWI0MWRhNC0yNjMzLTQxMmYtODIxMC0xNTY5YTJkMGNlMjAiLCJ0eXAiOiJJRCIsImF6cCI6InlhbGxhZGV2Iiwic2Vzc2lvbl9zdGF0ZSI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImF0X2hhc2giOiI2cUxfSEYwOGxrN1FlTXVtalEtUE93IiwiYWNyIjoiMCIsInNpZCI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6Ik1hcmsgQ2xheWRvbiIsInByZWZlcnJlZF91c2VybmFtZSI6Im1hcmtAeWFsbGFjb29wZXJhdGl2ZS5jb20iLCJnaXZlbl9uYW1lIjoiTWFyayIsImZhbWlseV9uYW1lIjoiQ2xheWRvbiIsImVtYWlsIjoibWFya0B5YWxsYWNvb3BlcmF0aXZlLmNvbSJ9.kzunTZ0Tlhc8Ra_3E1TC8QoNQyEWXV2mTzoUUMB7SE6p8OJw-DxRkbRZ40F4yjrljhcaeHdyWdHCtHBpjYUDrfJuVuHheQJ3ejnYIPgSRKQMO2oOy1GJx4pTifY6WwPcM6uqDKD8LCEyYhgBGrjskLvTGOZebjLvsR9d6UzAGlCe_kzPKCq7gOP5_ebo5c58Y1kBc141QIvcmUhxUgVpvJL6zbNsI2vQd9Zspe01EOOISF3xzwMxo19ffTFG_yz-2L-cQHBKzaB3cLOraakWszmYpkBPNuWecqII-I3YjF9JtZYMUiOnyizXmvM7koW18KYUfx5pFah_sqCi3f21Qg'
    };

    // if (!req.user) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'User not authenticated',
    //     isAuthenticated: false
    //   });
    // }

    // const { refreshToken } = req.user;

    // const issuer = await Issuer.discover(issuerURL);

    // const client = new issuer.Client({
    //   client_id: clientId,
    //   client_secret: clientSecret
    // });

    // const tokenSet = await client.refresh(refreshToken);

    // const accessTokenSet = await client.introspect(tokenSet.access_token);

    // req.user.accessToken = tokenSet.access_token;

    // if (!accessTokenSet.active) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'User not authenticated',
    //     isAuthenticated: false
    //   });
    // }

    return next();
  } catch (err) {
    return next(err);
  }
};

export default isAuthenticated;
