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
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKVjg1bVRtUmh1MGtSeGNNb0FGUFl5azJMbS1WTExYV25HOG9HbUxNUkowIn0.eyJleHAiOjE3MDYxODM1NzksImlhdCI6MTcwNjE4MTc3OSwiYXV0aF90aW1lIjoxNzA1MzQwOTQxLCJqdGkiOiI1YzQyNGYyZC0yMjZhLTQ5YzAtYjgxZi04YjZjZDFkNDViMGEiLCJpc3MiOiJodHRwczovL2xvZ2luLmxlc2NvbW11bnMub3JnL2F1dGgvcmVhbG1zL2RhdGEtZm9vZC1jb25zb3J0aXVtIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImU1YjQxZGE0LTI2MzMtNDEyZi04MjEwLTE1NjlhMmQwY2UyMCIsInR5cCI6IkJlYXJlciIsImF6cCI6InlhbGxhZGV2Iiwic2Vzc2lvbl9zdGF0ZSI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImFjciI6IjAiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1kYXRhLWZvb2QtY29uc29ydGl1bSIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwic2lkIjoiZDRhMTY3OTYtMjU4OC00OTY1LTgyNWMtMDFlOTQ0NTEzMGRkIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiTWFyayBDbGF5ZG9uIiwicHJlZmVycmVkX3VzZXJuYW1lIjoibWFya0B5YWxsYWNvb3BlcmF0aXZlLmNvbSIsImdpdmVuX25hbWUiOiJNYXJrIiwiZmFtaWx5X25hbWUiOiJDbGF5ZG9uIiwiZW1haWwiOiJtYXJrQHlhbGxhY29vcGVyYXRpdmUuY29tIn0.OX13JSEzr5hi2QzJGavWEn6AOvjj0N1wXwS9hh1p-tx0Ejcy6yQ4EuEgx5NEbd7LZLAuVKzClCQsF6T-Dx42zbza9yfE5XikET1G-IX62SDDeTnl8jHSWjnlj3qftFTOc255IncS_M8CL-7fVA5icoNeQD4VsaaOWYzEBeBv0DQlhlw9vyxbzY619vTA_Hn9GVK40zCTz06_dg5LcnFULTfiPHTPQBXRUFccK7FJmXQZ0kUEV1uoQs142oAngXhTRSxWUveTRqT1i2TlYsFbJ3Peg9nbmGv9cTBoiS0iYhzwh_NseWwudkoJIpttAESz3YZ1QFusW3wkmHdiq7hAEg',
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmNDcyMmM0My0xNWI0LTRkN2EtYjg0MC00ZWQwYjU2ZmIzMmEifQ.eyJleHAiOjE3MzY4NzY5NDEsImlhdCI6MTcwNjE3NTU4MCwianRpIjoiMmYxZjIxOWMtYjlhYi00M2M1LWI1NDQtNjYyODhmYWVkZmM0IiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5sZXNjb21tdW5zLm9yZy9hdXRoL3JlYWxtcy9kYXRhLWZvb2QtY29uc29ydGl1bSIsImF1ZCI6Imh0dHBzOi8vbG9naW4ubGVzY29tbXVucy5vcmcvYXV0aC9yZWFsbXMvZGF0YS1mb29kLWNvbnNvcnRpdW0iLCJzdWIiOiJlNWI0MWRhNC0yNjMzLTQxMmYtODIxMC0xNTY5YTJkMGNlMjAiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoieWFsbGFkZXYiLCJzZXNzaW9uX3N0YXRlIjoiZDRhMTY3OTYtMjU4OC00OTY1LTgyNWMtMDFlOTQ0NTEzMGRkIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCJ9.pSSrFtLQ6y7ooF9xsWT4Sk0GiXp5ou3qgel8AixwbG8',
      idToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKVjg1bVRtUmh1MGtSeGNNb0FGUFl5azJMbS1WTExYV25HOG9HbUxNUkowIn0.eyJleHAiOjE3MDYxNzczODAsImlhdCI6MTcwNjE3NTU4MCwiYXV0aF90aW1lIjoxNzA1MzQwOTQxLCJqdGkiOiIwOWJhNjQzMS0wZGY4LTQ1MjEtODRkYi04MDJmZThlZjU4ZmIiLCJpc3MiOiJodHRwczovL2xvZ2luLmxlc2NvbW11bnMub3JnL2F1dGgvcmVhbG1zL2RhdGEtZm9vZC1jb25zb3J0aXVtIiwiYXVkIjoieWFsbGFkZXYiLCJzdWIiOiJlNWI0MWRhNC0yNjMzLTQxMmYtODIxMC0xNTY5YTJkMGNlMjAiLCJ0eXAiOiJJRCIsImF6cCI6InlhbGxhZGV2Iiwic2Vzc2lvbl9zdGF0ZSI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImF0X2hhc2giOiJSbTFlYk1IcEdUOVdNU2pZa2RHWnlnIiwiYWNyIjoiMCIsInNpZCI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6Ik1hcmsgQ2xheWRvbiIsInByZWZlcnJlZF91c2VybmFtZSI6Im1hcmtAeWFsbGFjb29wZXJhdGl2ZS5jb20iLCJnaXZlbl9uYW1lIjoiTWFyayIsImZhbWlseV9uYW1lIjoiQ2xheWRvbiIsImVtYWlsIjoibWFya0B5YWxsYWNvb3BlcmF0aXZlLmNvbSJ9.a3jT-WrZk0N_J-PoP77OxQdDOTL8bQiwLb7RPkO683MgMi02mOulix7xa40A0ykydzGubcZDBBfb6fOWrdvD6x_KgWwZjNY2qbRdrGyf9sWisviXp2SlsNHwL-Idx-3jo51kyohrOwmc-c49CtFqJk-82eePni3O4gChrTfyBH10EIzBlJhkPL3ZaYwEP1iUhXI1Toyb20sJdqGH5LEEJUbGMpdJGYDhf34iiBbPEg0RX_nDoclePtsVOUB2W91wmFKEATutDqCFeFKVQHLviQa9VEGxifKq2ugA0A6DcPequPqu22je0Ug-keVvkAeVXCG1oRc3iaW4h8KlifB9aw'
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
