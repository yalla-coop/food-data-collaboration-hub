import { Issuer } from 'openid-client'
import { replaceRefreshToken } from '../../database/sales-sessions/salesSession.js'
import dayjs from 'dayjs'

export async function obtainValidAccessToken(salesSession) {

  return await replaceRefreshToken(salesSession.id, async (existingTokens) => {
    if (dayjs.unix(existingTokens.accessTokenExpiresAt).isBefore(dayjs().add(5, 'minute'))) {
      return await refresh(existingTokens.refreshToken);
    } else {
      return null;
    }
  })
}

async function refresh(refreshToken) {
  const issuer = await Issuer.discover(process.env.OIDC_ISSUER);

  const client = new issuer.Client({
    client_id: process.env.OIDC_CLIENT_ID,
    client_secret: process.env.OIDC_CLIENT_SECRET,
    respose_types: ['code'],
    redirect_uris: [process.env.OIDC_CALLBACK_URL],
  });

  const { access_token, expires_at, refresh_token } = await client.refresh(refreshToken);

  return {
    accessToken: access_token,
    accessTokenExpiresAt: expires_at,
    refreshToken: refresh_token,
  }
}