import { Issuer } from "openid-client";
import * as Sentry from "@sentry/node";
import axios from "axios";

const clientId = process.env.OIDC_CLIENT_ID;
const clientSecret = process.env.OIDC_CLIENT_SECRET;
const issuerURL = process.env.OIDC_ISSUER;

const isAuthenticated = async (req, res, next) => {
  const { PRODUCER_SHOP_URL, PRODUCER_SHOP } = process.env;
  req.user = {
    "id": "e5b41da4-2633-412f-8210-1569a2d0ce20",
    "username": "mark@yallacooperative.com",
    "name": "Mark Claydon",
    "email": "mark@yallacooperative.com",
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKVjg1bVRtUmh1MGtSeGNNb0FGUFl5azJMbS1WTExYV25HOG9HbUxNUkowIn0.eyJleHAiOjE3MTA4NzI4MjcsImlhdCI6MTcxMDg3MTAyNywiYXV0aF90aW1lIjoxNzEwMzQ4OTE1LCJqdGkiOiIyMmQzMzQwNC0wNDkxLTQxNzMtYmRiNC1hYjEyYjk5YjliOTAiLCJpc3MiOiJodHRwczovL2xvZ2luLmxlc2NvbW11bnMub3JnL2F1dGgvcmVhbG1zL2RhdGEtZm9vZC1jb25zb3J0aXVtIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImU1YjQxZGE0LTI2MzMtNDEyZi04MjEwLTE1NjlhMmQwY2UyMCIsInR5cCI6IkJlYXJlciIsImF6cCI6InlhbGxhZGV2Iiwic2Vzc2lvbl9zdGF0ZSI6IjRlMGExM2JjLWJjN2EtNDc3Mi05YjE3LWRkNDNlNmE3MTA5NSIsImFjciI6IjAiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiZGVmYXVsdC1yb2xlcy1kYXRhLWZvb2QtY29uc29ydGl1bSIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwic2lkIjoiNGUwYTEzYmMtYmM3YS00NzcyLTliMTctZGQ0M2U2YTcxMDk1IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJuYW1lIjoiTWFyayBDbGF5ZG9uIiwicHJlZmVycmVkX3VzZXJuYW1lIjoibWFya0B5YWxsYWNvb3BlcmF0aXZlLmNvbSIsImdpdmVuX25hbWUiOiJNYXJrIiwiZmFtaWx5X25hbWUiOiJDbGF5ZG9uIiwiZW1haWwiOiJtYXJrQHlhbGxhY29vcGVyYXRpdmUuY29tIn0.YgKYToHHf-Fcrdvci0bPgfatEIsDMqZyC16yGmyacMfV5diCixc4TKd6awWe3l3SvCPJOeP_4UgnPW0tQrmW-vLRFnSL-ozAGqhCpOyiOHYWi5Ma8zy1mEJ8LmjBVHbWljYINpo3kRk1IKV9dyRiWThQU3DcDhCtieBjaeU9q2INNcQ90PtunigoQ8oGIc8PGUjsND_Dvj4O2wE3NzB_ae6EtFoWDjJc-gluvu6VwRxc_TGTFzhLjdH7PlEpwZb2NREgvYLqgW2ZMKVziSjcSWZxvlq1vZddXP9k7PqtGdcbRHcu1h870-HeYz-ags-LgImBBrP7_Kq0gTtywTvL_g",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJmNDcyMmM0My0xNWI0LTRkN2EtYjg0MC00ZWQwYjU2ZmIzMmEifQ.eyJleHAiOjE3NDE4ODQ5MTUsImlhdCI6MTcxMDg3MTAwNywianRpIjoiOTQ0N2Q4NTktZWNhOC00ZDlhLTk4N2QtYTI5MjZiOTU0NGRiIiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi5sZXNjb21tdW5zLm9yZy9hdXRoL3JlYWxtcy9kYXRhLWZvb2QtY29uc29ydGl1bSIsImF1ZCI6Imh0dHBzOi8vbG9naW4ubGVzY29tbXVucy5vcmcvYXV0aC9yZWFsbXMvZGF0YS1mb29kLWNvbnNvcnRpdW0iLCJzdWIiOiJlNWI0MWRhNC0yNjMzLTQxMmYtODIxMC0xNTY5YTJkMGNlMjAiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoieWFsbGFkZXYiLCJzZXNzaW9uX3N0YXRlIjoiNGUwYTEzYmMtYmM3YS00NzcyLTliMTctZGQ0M2U2YTcxMDk1Iiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6IjRlMGExM2JjLWJjN2EtNDc3Mi05YjE3LWRkNDNlNmE3MTA5NSJ9.8Pf5Ie6jvRl9zhRYXHCulXlhlGJP3-zCOXpcuVhzV1o",
    "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJKVjg1bVRtUmh1MGtSeGNNb0FGUFl5azJMbS1WTExYV25HOG9HbUxNUkowIn0.eyJleHAiOjE3MTA4NzI4MDcsImlhdCI6MTcxMDg3MTAwNywiYXV0aF90aW1lIjoxNzEwMzQ4OTE1LCJqdGkiOiJjMWRkOWIzNC1jYTA3LTRkNjEtOWUxZC0zMmMwMjMwODEwNTAiLCJpc3MiOiJodHRwczovL2xvZ2luLmxlc2NvbW11bnMub3JnL2F1dGgvcmVhbG1zL2RhdGEtZm9vZC1jb25zb3J0aXVtIiwiYXVkIjoieWFsbGFkZXYiLCJzdWIiOiJlNWI0MWRhNC0yNjMzLTQxMmYtODIxMC0xNTY5YTJkMGNlMjAiLCJ0eXAiOiJJRCIsImF6cCI6InlhbGxhZGV2Iiwic2Vzc2lvbl9zdGF0ZSI6IjRlMGExM2JjLWJjN2EtNDc3Mi05YjE3LWRkNDNlNmE3MTA5NSIsImF0X2hhc2giOiI0MFo3SHJqM1VrTHkwU2ZuTnNBQ19RIiwiYWNyIjoiMCIsInNpZCI6IjRlMGExM2JjLWJjN2EtNDc3Mi05YjE3LWRkNDNlNmE3MTA5NSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwibmFtZSI6Ik1hcmsgQ2xheWRvbiIsInByZWZlcnJlZF91c2VybmFtZSI6Im1hcmtAeWFsbGFjb29wZXJhdGl2ZS5jb20iLCJnaXZlbl9uYW1lIjoiTWFyayIsImZhbWlseV9uYW1lIjoiQ2xheWRvbiIsImVtYWlsIjoibWFya0B5YWxsYWNvb3BlcmF0aXZlLmNvbSJ9.WMIlkm6O-TF9TxDnPxT0wh9UK8Q4OEpLJ30ZOMdH_jrPcXapsZ_0yOKTTcTqzFiLtyxATDvTl4MN-gpEj3mCEj6zkB6x7-Ho1LesHtOebHw-DlkMYQrCn7aSrsaE-tW9p_zMML05S4zqlIv6xT5x2NmjOZZOm9NuqCbm_E0FDpdAx0DUliRZ62CfqpPYqTKFJYoKh-qq2Et8gtlV2KW_phI-A_WKmHXebuUAQA0Q3j6XClsY7sNDtsbnbGXGtphQmo82WdqhSIsLjujeNDt9y_wq9qZH5gf88QStFMaghIAtDTo3oCkEDW-3eHC5gNl5wxAWdEusQVHVVF7SAwk3dw"
  };

  return next();
};

export default isAuthenticated;
