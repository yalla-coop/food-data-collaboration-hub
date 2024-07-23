import { Issuer } from "openid-client";
import * as Sentry from "@sentry/node";
import axios from "axios";

const clientId = process.env.OIDC_CLIENT_ID;
const clientSecret = process.env.OIDC_CLIENT_SECRET;
const issuerURL = process.env.OIDC_ISSUER;

const isAuthenticated = async (req, res, next) => {
  const { PRODUCER_SHOP_URL, PRODUCER_SHOP } = process.env;

  if (process.env.NODE_ENV === 'development') {
    req.user = {
      "id": "e5b41da4-2633-412f-8210-1569a2d0ce20",
      "username": "mark@yallacooperative.com",
      "name": "Mark Claydon",
      "email": "mark@yallacooperative.com",
      "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKVjg1bVRtUmh1MGtSeGNNb0FGUFl5azJMbS1WTExYV25HOG9HbUxNUkowIn0.eyJleHAiOjE3MjE3NTkwMzgsImlhdCI6MTcyMTc1NzIzOCwiYXV0aF90aW1lIjoxNzIxNjM1ODE2LCJqdGkiOiJiMzY3YzM2ZS0zMjk3LTQ1N2EtYjRmMi1kMDQwNWI4NWU0ZjIiLCJpc3MiOiJodHRwczovL2xvZ2luLmxlc2NvbW11bnMub3JnL2F1dGgvcmVhbG1zL2RhdGEtZm9vZC1jb25zb3J0aXVtIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImU1YjQxZGE0LTI2MzMtNDEyZi04MjEwLTE1NjlhMmQwY2UyMCIsInR5cCI6IkJlYXJlciIsImF6cCI6InlhbGxhZGV2Iiwic2Vzc2lvbl9zdGF0ZSI6IjI2YTk5NTRlLTI2MzItNGY2Yy04YmYxLTFiZmQ4MjliMGYyYiIsImFjciI6IjAiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1kYXRhLWZvb2QtY29uc29ydGl1bSIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwic2lkIjoiMjZhOTk1NGUtMjYzMi00ZjZjLThiZjEtMWJmZDgyOWIwZjJiIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiTWFyayBDbGF5ZG9uIiwicHJlZmVycmVkX3VzZXJuYW1lIjoibWFya0B5YWxsYWNvb3BlcmF0aXZlLmNvbSIsImdpdmVuX25hbWUiOiJNYXJrIiwiZmFtaWx5X25hbWUiOiJDbGF5ZG9uIiwiZW1haWwiOiJtYXJrQHlhbGxhY29vcGVyYXRpdmUuY29tIn0.ZYkxBAyb8NeDXB1SbeiCCgHGsIZqmZ9Lo5c6R4dacKNkzQeR-873a0S3wBjdSq61EYp0OtrIKyfIT1DmODCkvoktsvf3CvqoG2yiBOw4atHLAhP8vtSSciPhNdjzJlF_RxckiPCnUPaeWceV7qGVnHuh9j0o8pu2aif-tYYuWY8dHODc92w12JvaQZQmu7xb44mniYCuRAKUmxyM-CycOPwYg0iGh0HIWHvFsjManaL7VGCE6pwudukjQK2MZw94jDdE0IaVnfRnaLI1kbvO8evuqoqG4ZPVReHaIUM5BGtn5oz4PsUEeGOhLl1T1S1Aa8cFUT-PIr8FcQ-7V6iaMw",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmNDcyMmM0My0xNWI0LTRkN2EtYjg0MC00ZWQwYjU2ZmIzMmEifQ.eyJleHAiOjE3NTMxNzE4MTYsImlhdCI6MTcyMTc1NzIzOCwianRpIjoiNjQ3MmQ5OGMtMGQzNC00ZDhhLWEyMWQtNDMzN2ZhMjc5YzFjIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5sZXNjb21tdW5zLm9yZy9hdXRoL3JlYWxtcy9kYXRhLWZvb2QtY29uc29ydGl1bSIsImF1ZCI6Imh0dHBzOi8vbG9naW4ubGVzY29tbXVucy5vcmcvYXV0aC9yZWFsbXMvZGF0YS1mb29kLWNvbnNvcnRpdW0iLCJzdWIiOiJlNWI0MWRhNC0yNjMzLTQxMmYtODIxMC0xNTY5YTJkMGNlMjAiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoieWFsbGFkZXYiLCJzZXNzaW9uX3N0YXRlIjoiMjZhOTk1NGUtMjYzMi00ZjZjLThiZjEtMWJmZDgyOWIwZjJiIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6IjI2YTk5NTRlLTI2MzItNGY2Yy04YmYxLTFiZmQ4MjliMGYyYiJ9.h4W7yWnuCvszg1sVVWYFzhHATHnBE9Ilcw3Dt8NnDzc",
      "accessTokenExpiresAt": 1721759038,
      "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKVjg1bVRtUmh1MGtSeGNNb0FGUFl5azJMbS1WTExYV25HOG9HbUxNUkowIn0.eyJleHAiOjE3MjE3NTkwMzgsImlhdCI6MTcyMTc1NzIzOCwiYXV0aF90aW1lIjoxNzIxNjM1ODE2LCJqdGkiOiIxZGVkM2Q2Yi1hNzc3LTRhMjktOGVkZS0zYjYzOTU0MWI0MmMiLCJpc3MiOiJodHRwczovL2xvZ2luLmxlc2NvbW11bnMub3JnL2F1dGgvcmVhbG1zL2RhdGEtZm9vZC1jb25zb3J0aXVtIiwiYXVkIjoieWFsbGFkZXYiLCJzdWIiOiJlNWI0MWRhNC0yNjMzLTQxMmYtODIxMC0xNTY5YTJkMGNlMjAiLCJ0eXAiOiJJRCIsImF6cCI6InlhbGxhZGV2Iiwic2Vzc2lvbl9zdGF0ZSI6IjI2YTk5NTRlLTI2MzItNGY2Yy04YmYxLTFiZmQ4MjliMGYyYiIsImF0X2hhc2giOiI5N2Q0ME0tVmFTZUhXWnhyRkVKaFl3IiwiYWNyIjoiMCIsInNpZCI6IjI2YTk5NTRlLTI2MzItNGY2Yy04YmYxLTFiZmQ4MjliMGYyYiIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6Ik1hcmsgQ2xheWRvbiIsInByZWZlcnJlZF91c2VybmFtZSI6Im1hcmtAeWFsbGFjb29wZXJhdGl2ZS5jb20iLCJnaXZlbl9uYW1lIjoiTWFyayIsImZhbWlseV9uYW1lIjoiQ2xheWRvbiIsImVtYWlsIjoibWFya0B5YWxsYWNvb3BlcmF0aXZlLmNvbSJ9.d5QbVhgYFKIwfZZqOX7Q9dJ-4ul4fVS4ocn9uBKz_7aOAgGZOK2-YBL4wR1be92JeiyJ6oNiR8bC6zDcIStBVozURzyFWsonc-77obiuGnSXX0u_o1pYv-z9RBhX244HmbeckD2afcWkHWNSjXV-nZwt3XNLxa7lGmJ7IN3ofoprLWmJUY_PBChldZm4Mz70qWDVtFXBv6uPx8NOZXu3YhXJiAuxgvwskrZOw2G7vLeh56dfaPnr--_hatg4dCOnxqEztbTHDcMEw0Hd4L-gxD9nynOuuOM0g4DbnG_gfTTkbUdT2sS0d67hh7MEqnBEI9mKLbuw2drsXT8UFJEyMA"
    }
  }

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
        isAuthenticated: false,
      });
    }

    const { accessToken } = req.user;

    const issuer = await Issuer.discover(issuerURL);

    const client = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
    });

    const accessTokenSet = await client.introspect(accessToken);

    if (!accessTokenSet.active) {
      return res.status(403).json({
        success: false,
        message: "User not authenticated",
        isAuthenticated: false,
      });
    }

    try {
      // Set user hub information
      const { locals: { shopify: { session: { shop } = {} } = {} } = {} } =
        res || {};
      if (req.user.id && shop) {
        await axios.post(
          `${PRODUCER_SHOP_URL}fdc/hub-users/${req.user.id}?shop=${PRODUCER_SHOP}`,
          {
            userId: req.user.id,
            accessToken: req.user.accessToken,
            hubShop: shop,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
      }
    } catch (err) {
      console.log("error in storing user information ", err.message);
      Sentry.captureException(err);
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

export default isAuthenticated;
