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
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKVjg1bVRtUmh1MGtSeGNNb0FGUFl5azJMbS1WTExYV25HOG9HbUxNUkowIn0.eyJleHAiOjE3MDYxMDIzNjQsImlhdCI6MTcwNjEwMDU2NCwiYXV0aF90aW1lIjoxNzA1MzQwOTQxLCJqdGkiOiIwMDM2MmJlNS1iODQxLTRlOGQtOTcxZi01YTExYTNlMzVhNDUiLCJpc3MiOiJodHRwczovL2xvZ2luLmxlc2NvbW11bnMub3JnL2F1dGgvcmVhbG1zL2RhdGEtZm9vZC1jb25zb3J0aXVtIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImU1YjQxZGE0LTI2MzMtNDEyZi04MjEwLTE1NjlhMmQwY2UyMCIsInR5cCI6IkJlYXJlciIsImF6cCI6InlhbGxhZGV2Iiwic2Vzc2lvbl9zdGF0ZSI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImFjciI6IjAiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1kYXRhLWZvb2QtY29uc29ydGl1bSIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwic2lkIjoiZDRhMTY3OTYtMjU4OC00OTY1LTgyNWMtMDFlOTQ0NTEzMGRkIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiTWFyayBDbGF5ZG9uIiwicHJlZmVycmVkX3VzZXJuYW1lIjoibWFya0B5YWxsYWNvb3BlcmF0aXZlLmNvbSIsImdpdmVuX25hbWUiOiJNYXJrIiwiZmFtaWx5X25hbWUiOiJDbGF5ZG9uIiwiZW1haWwiOiJtYXJrQHlhbGxhY29vcGVyYXRpdmUuY29tIn0.amo5Bhsr_xd-cxTkg_PCHEkKXoVhP_64YEHtKPQpAUBKXxR1Ccz8_WujumaO7O6DdNsAdUXzhv-COaogTsNdeOoPFxtbM0en3xULvMkO8ubmCqbzdDN38dDVwjljJYJ0rY_lUGPkd9wzc7tUa28WP20Bex9fo5aOa1KcKgeBwQxP8CRZJWFxUHMujAh3rcQIpsXsSi1EpNBNAnQ_VfVa1PPxWvFqW7aj-BinJdmFYQ6WT8mZ0I32b6kTf15P--wdq27duRrH_Vzy5dhXrfT7NBPFDAqaAREfx4Rhms2mTrUfjA9xpb8bXTlw8InV6di6h6ptrRMhZdeV2O6_kxosZg',
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmNDcyMmM0My0xNWI0LTRkN2EtYjg0MC00ZWQwYjU2ZmIzMmEifQ.eyJleHAiOjE3MzY4NzY5NDEsImlhdCI6MTcwNjA5ODcxNywianRpIjoiNGI5MjRiNjEtMTg1Yi00ZWEyLTkzMzctNTZjM2IwZWNiNGJjIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5sZXNjb21tdW5zLm9yZy9hdXRoL3JlYWxtcy9kYXRhLWZvb2QtY29uc29ydGl1bSIsImF1ZCI6Imh0dHBzOi8vbG9naW4ubGVzY29tbXVucy5vcmcvYXV0aC9yZWFsbXMvZGF0YS1mb29kLWNvbnNvcnRpdW0iLCJzdWIiOiJlNWI0MWRhNC0yNjMzLTQxMmYtODIxMC0xNTY5YTJkMGNlMjAiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoieWFsbGFkZXYiLCJzZXNzaW9uX3N0YXRlIjoiZDRhMTY3OTYtMjU4OC00OTY1LTgyNWMtMDFlOTQ0NTEzMGRkIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCJ9.Hm-oBeC5GdBVfzEsHf28q0_UXmFM-ys7S2jl01u8n7Q',
      idToken:
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKVjg1bVRtUmh1MGtSeGNNb0FGUFl5azJMbS1WTExYV25HOG9HbUxNUkowIn0.eyJleHAiOjE3MDYxMDA1MTcsImlhdCI6MTcwNjA5ODcxNywiYXV0aF90aW1lIjoxNzA1MzQwOTQxLCJqdGkiOiJjZmJmYzA3Yy1hNGJhLTQwYmQtYjljZS05NzQ5NDUwMGE1NzYiLCJpc3MiOiJodHRwczovL2xvZ2luLmxlc2NvbW11bnMub3JnL2F1dGgvcmVhbG1zL2RhdGEtZm9vZC1jb25zb3J0aXVtIiwiYXVkIjoieWFsbGFkZXYiLCJzdWIiOiJlNWI0MWRhNC0yNjMzLTQxMmYtODIxMC0xNTY5YTJkMGNlMjAiLCJ0eXAiOiJJRCIsImF6cCI6InlhbGxhZGV2Iiwic2Vzc2lvbl9zdGF0ZSI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImF0X2hhc2giOiJxZ3FXRURHdWo0ZWI0V3ZsMUxZdHB3IiwiYWNyIjoiMCIsInNpZCI6ImQ0YTE2Nzk2LTI1ODgtNDk2NS04MjVjLTAxZTk0NDUxMzBkZCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6Ik1hcmsgQ2xheWRvbiIsInByZWZlcnJlZF91c2VybmFtZSI6Im1hcmtAeWFsbGFjb29wZXJhdGl2ZS5jb20iLCJnaXZlbl9uYW1lIjoiTWFyayIsImZhbWlseV9uYW1lIjoiQ2xheWRvbiIsImVtYWlsIjoibWFya0B5YWxsYWNvb3BlcmF0aXZlLmNvbSJ9.PRx74YPU7q3a5iaBTiypcb_tC1ay4sH9uGGpwvjTvISS0kPpbeh_see06xWCh6PzzOqnpGRo2qs0OlgpiEJTsvf3PecUKpzc5d5uB1QM018jJA4P8ByPITqbQAy7gTSeH7wWOM-xOR5A6oC6oahyF9lHGdctzJNQLp-9MDBbmNAfcb0GP3szrxE139iIKJJ2FFBuaQdmfk8QEvrcj-QFi0PfqtReOI6TtJTNH5Pl-SKLQAYGtrEarMM0LhhJ4rDURL4hqCYCtliBjADG4EwHxayUbtOrIK00SjKijQ2CrjA25JtnewzYltRpv1YwjkLAVTWN6yCG8ySln758zgopSw'
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
