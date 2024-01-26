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
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKVjg1bVRtUmh1MGtSeGNNb0FGUFl5azJMbS1WTExYV25HOG9HbUxNUkowIn0.eyJleHAiOjE3MDYyODc3ODYsImlhdCI6MTcwNjI4NTk4NiwiYXV0aF90aW1lIjoxNzA1MzQwOTQxLCJqdGkiOiIyYjk1ZWQ3YS04YzJhLTQ1ZjItYjAwNC1hYTc2MmM4MWZlMjQiLCJpc3MiOiJodHRwczovL2xvZ2luLmxlc2NvbW11bnMub3JnL2F1dGgvcmVhbG1zL2RhdGEtZm9vZC1jb25zb3J0aXVtIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImU1YjQxZGE0LTI2MzMtNDEyZi04MjEwLTE1NjlhMmQwY2UyMCIsInR5cCI6IkJlYXJlciIsImF6cCI6InlhbGxhZGV2Iiwic2Vzc2lvbl9zdGF0ZSI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImFjciI6IjAiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1kYXRhLWZvb2QtY29uc29ydGl1bSIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwic2lkIjoiZDRhMTY3OTYtMjU4OC00OTY1LTgyNWMtMDFlOTQ0NTEzMGRkIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiTWFyayBDbGF5ZG9uIiwicHJlZmVycmVkX3VzZXJuYW1lIjoibWFya0B5YWxsYWNvb3BlcmF0aXZlLmNvbSIsImdpdmVuX25hbWUiOiJNYXJrIiwiZmFtaWx5X25hbWUiOiJDbGF5ZG9uIiwiZW1haWwiOiJtYXJrQHlhbGxhY29vcGVyYXRpdmUuY29tIn0.ZJVD3361shg-wsoP2O0As_46rOirMUsKCCqouLPBeagy4AwUeYtUp-ITP-oUe1pfEw0kgl-_6KO1G3FbF7I-EHNnrWV5kQS-d_QmJtJx9Amvyg80_cacSOFHxf82bP6cvcpQYlyGsvjxe9V70eVFkHN_atMLu9_BtwLDSBk5SsbUwPdG0z1BSFIMzXNIGiDaIgue1vVGSzyurq93yor1hlatLmEzgPRwDcYF01olSBM5LqBWZQR0-lWC0Ynv90NdcyfL9x0jMK3NLDowYDrglbqXbwWd60FYeXSGPHqwdGemSX6HGToUIsd5pBuZakV8ur8W0Nxk530_YP5kGCL8kA',
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmNDcyMmM0My0xNWI0LTRkN2EtYjg0MC00ZWQwYjU2ZmIzMmEifQ.eyJleHAiOjE3MzY4NzY5NDEsImlhdCI6MTcwNjI4NTk3NCwianRpIjoiMGI4NzU5YmMtYjlmMy00Njc5LTllNDctMjg2NzljNTAxMWUyIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5sZXNjb21tdW5zLm9yZy9hdXRoL3JlYWxtcy9kYXRhLWZvb2QtY29uc29ydGl1bSIsImF1ZCI6Imh0dHBzOi8vbG9naW4ubGVzY29tbXVucy5vcmcvYXV0aC9yZWFsbXMvZGF0YS1mb29kLWNvbnNvcnRpdW0iLCJzdWIiOiJlNWI0MWRhNC0yNjMzLTQxMmYtODIxMC0xNTY5YTJkMGNlMjAiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoieWFsbGFkZXYiLCJzZXNzaW9uX3N0YXRlIjoiZDRhMTY3OTYtMjU4OC00OTY1LTgyNWMtMDFlOTQ0NTEzMGRkIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCJ9.QX9q8RRwWqcm1TTaZscpAJx21V9KdcSZXaHGbi2gf1I',
      idToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKVjg1bVRtUmh1MGtSeGNNb0FGUFl5azJMbS1WTExYV25HOG9HbUxNUkowIn0.eyJleHAiOjE3MDYyODc3NzQsImlhdCI6MTcwNjI4NTk3NCwiYXV0aF90aW1lIjoxNzA1MzQwOTQxLCJqdGkiOiIzNjViNjFjNy1jNWNkLTQzMTMtYmIwMC1mMDdkMzQwYmFjYTUiLCJpc3MiOiJodHRwczovL2xvZ2luLmxlc2NvbW11bnMub3JnL2F1dGgvcmVhbG1zL2RhdGEtZm9vZC1jb25zb3J0aXVtIiwiYXVkIjoieWFsbGFkZXYiLCJzdWIiOiJlNWI0MWRhNC0yNjMzLTQxMmYtODIxMC0xNTY5YTJkMGNlMjAiLCJ0eXAiOiJJRCIsImF6cCI6InlhbGxhZGV2Iiwic2Vzc2lvbl9zdGF0ZSI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImF0X2hhc2giOiJ5cGpvNWcySVAtYm9hZlcwYnUzWTRBIiwiYWNyIjoiMCIsInNpZCI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6Ik1hcmsgQ2xheWRvbiIsInByZWZlcnJlZF91c2VybmFtZSI6Im1hcmtAeWFsbGFjb29wZXJhdGl2ZS5jb20iLCJnaXZlbl9uYW1lIjoiTWFyayIsImZhbWlseV9uYW1lIjoiQ2xheWRvbiIsImVtYWlsIjoibWFya0B5YWxsYWNvb3BlcmF0aXZlLmNvbSJ9.U3y7KcBktk97CsFa2K6SqxGv_VX_qMLJyp5kk59BoMuFj4PfKPnpFTcgcZsz15a8U9PLzObIPx2_mOVVKRSrTEEFHhI9xZti-BunE4KsW1MZ27z85dZxprBPmnUZGTcKWss6WD0Oz51QI8y8vkVQag3J-EVtscSzwAPwAbiFK-o81g42Nopdwl9tSHz-g0I8-hKhEdVnjcdi6hW8TojUadXxJMkgdCwTWGWveioq3LkkIIDerOT1pQPmRcsxW7MSrGGQ8zoACxF4HP4pia9dE-zU1OW637b7xvjgt_HGZ1ASZVFJiXr_LA3zFflnC2FCTcBFD_cJp9xJocZqDitPqw'
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
