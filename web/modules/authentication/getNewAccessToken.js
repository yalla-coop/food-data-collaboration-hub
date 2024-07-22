import { Issuer } from 'openid-client'
import {replaceRefreshToken} from '../../database/sales-sessions/salesSession.js'
export async function getNewAccessToken(salesSession) {
    const issuer = await Issuer.discover(process.env.OIDC_ISSUER);

    const client = new issuer.Client({
      client_id: process.env.OIDC_CLIENT_ID,
      client_secret: process.env.OIDC_CLIENT_SECRET,
      respose_types: ['code'],
      redirect_uris: [process.env.OIDC_CALLBACK_URL],
    });

    const {access_token, refresh_token} = await client.refresh(salesSession.creatorRefreshToken);

    await replaceRefreshToken(salesSession.id, refresh_token);

    return access_token;
}