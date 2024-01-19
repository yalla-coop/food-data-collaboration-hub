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
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKVjg1bVRtUmh1MGtSeGNNb0FGUFl5azJMbS1WTExYV25HOG9HbUxNUkowIn0.eyJleHAiOjE3MDU2ODU2NDAsImlhdCI6MTcwNTY4Mzg0MCwiYXV0aF90aW1lIjoxNzA1MzQwOTQxLCJqdGkiOiI4ZTA3NzRiOS1iZWU2LTRiOGEtYjVlMi1lOTExNjA3ODU5MDEiLCJpc3MiOiJodHRwczovL2xvZ2luLmxlc2NvbW11bnMub3JnL2F1dGgvcmVhbG1zL2RhdGEtZm9vZC1jb25zb3J0aXVtIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImU1YjQxZGE0LTI2MzMtNDEyZi04MjEwLTE1NjlhMmQwY2UyMCIsInR5cCI6IkJlYXJlciIsImF6cCI6InlhbGxhZGV2Iiwic2Vzc2lvbl9zdGF0ZSI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImFjciI6IjAiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1kYXRhLWZvb2QtY29uc29ydGl1bSIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwic2lkIjoiZDRhMTY3OTYtMjU4OC00OTY1LTgyNWMtMDFlOTQ0NTEzMGRkIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiTWFyayBDbGF5ZG9uIiwicHJlZmVycmVkX3VzZXJuYW1lIjoibWFya0B5YWxsYWNvb3BlcmF0aXZlLmNvbSIsImdpdmVuX25hbWUiOiJNYXJrIiwiZmFtaWx5X25hbWUiOiJDbGF5ZG9uIiwiZW1haWwiOiJtYXJrQHlhbGxhY29vcGVyYXRpdmUuY29tIn0.gMdxtNxf6Q1JnvzsBocQaAWZ_KbsPyvhI9gGD0vx1WSY6HAvW_2wEy5PV1jE-5lg_4sugoyuglosvSrPe5Baw5GJhJ8GvKT5ZoB6lXr1LGDlakWsWcPaeOmCS-LwLyF6Dx1M8oEiqUG5xca3oGkPhtPvVTiFoCVIYkzK3Agr-GXzlegZfy9hKGZuvNCk_IMmh00Pu0y26QaVytPz3REnkPg4W7907Yyc4LHZp6JlTD6JyffjAONmoUNfAkEjLrR_U2RrPhQmAUUJDvpTWxsuogjwIcvzS8AecD-x-VLsrhFHGK-bT4xTBKySzV-sMypljFxRCaB5onhXTSc1M8Fygw',
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmNDcyMmM0My0xNWI0LTRkN2EtYjg0MC00ZWQwYjU2ZmIzMmEifQ.eyJleHAiOjE3MzY4NzY5NDEsImlhdCI6MTcwNTY3OTk1MiwianRpIjoiYWM1YzI5OGQtOTRhOC00MjBjLTg4YTktYjlhOTU1NmFjMWVjIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5sZXNjb21tdW5zLm9yZy9hdXRoL3JlYWxtcy9kYXRhLWZvb2QtY29uc29ydGl1bSIsImF1ZCI6Imh0dHBzOi8vbG9naW4ubGVzY29tbXVucy5vcmcvYXV0aC9yZWFsbXMvZGF0YS1mb29kLWNvbnNvcnRpdW0iLCJzdWIiOiJlNWI0MWRhNC0yNjMzLTQxMmYtODIxMC0xNTY5YTJkMGNlMjAiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoieWFsbGFkZXYiLCJzZXNzaW9uX3N0YXRlIjoiZDRhMTY3OTYtMjU4OC00OTY1LTgyNWMtMDFlOTQ0NTEzMGRkIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCJ9.x7CcIUuM7XMsfUSrnYj3MAG_ye0-A89aGjUgaA61a6o',
      idToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKVjg1bVRtUmh1MGtSeGNNb0FGUFl5azJMbS1WTExYV25HOG9HbUxNUkowIn0.eyJleHAiOjE3MDU2ODE3NTIsImlhdCI6MTcwNTY3OTk1MiwiYXV0aF90aW1lIjoxNzA1MzQwOTQxLCJqdGkiOiJlY2IxNjk2NC0yNjdkLTRjOGMtYjY5OS1hY2IwOTkwYWFhM2MiLCJpc3MiOiJodHRwczovL2xvZ2luLmxlc2NvbW11bnMub3JnL2F1dGgvcmVhbG1zL2RhdGEtZm9vZC1jb25zb3J0aXVtIiwiYXVkIjoieWFsbGFkZXYiLCJzdWIiOiJlNWI0MWRhNC0yNjMzLTQxMmYtODIxMC0xNTY5YTJkMGNlMjAiLCJ0eXAiOiJJRCIsImF6cCI6InlhbGxhZGV2Iiwic2Vzc2lvbl9zdGF0ZSI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImF0X2hhc2giOiI1ZlROclduQXZUejNVbjFsSjJPNEtBIiwiYWNyIjoiMCIsInNpZCI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6Ik1hcmsgQ2xheWRvbiIsInByZWZlcnJlZF91c2VybmFtZSI6Im1hcmtAeWFsbGFjb29wZXJhdGl2ZS5jb20iLCJnaXZlbl9uYW1lIjoiTWFyayIsImZhbWlseV9uYW1lIjoiQ2xheWRvbiIsImVtYWlsIjoibWFya0B5YWxsYWNvb3BlcmF0aXZlLmNvbSJ9.BaTgbphk7mZux00u1xpt4OnD4y3Uvn2HRaSGLfuIB-Hvw--fY288D98AvTg2kHgAqFZllDQ3LjkuIkncGK6DpH_tPLWWX_ttdvY0cy7VNJrFjPOT6M8n8kh1yCFg8c-YaaJH0S979Btg-1Og_mGFXr3QFARnfCj_Yqb15ztQTG9YZmGhkq1BtfjbddYPNGPrYLxjhkdkrsa6949mzq4fLGb67dXOL2yHZj5oRq8bHRjlkrZ66exPr519hg3rj1bDyjaoTV5jlpoSfollPfNPw7Fe3pF5nxgYFDn2k2q9y5QGIVmaUTSBvd6XR6A74YY-Fw0oOUN-ih82MgykOzPHmg'
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
