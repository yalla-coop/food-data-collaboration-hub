import { getUser, createOrUpdate } from '../database/users/users.js';
import { obtainValidAccessToken } from '../modules/authentication/getNewAccessToken.js';

let userSession = null;

export default async function localAuthenticationBypass(req, resp, next) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return next();
    } else if (
      !process.env.HARD_CODED_REFRESH_TOKEN ||
      !process.env.HARD_CODED_USER_ID
    ) {
      return resp
        .status(500)
        .send(
          'Get a refresh token and user id from staging and place in your .env under HARD_CODED_REFRESH_TOKEN and HARD_CODED_USER_ID'
        );
    } else {
      const user = await getUser(process.env.HARD_CODED_USER_ID);

      if (!user) {
        await createOrUpdate({
          id: process.env.HARD_CODED_USER_ID,
          refreshToken: process.env.HARD_CODED_REFRESH_TOKEN,
          accessToken: 'expired',
          accessTokenExpiresAt: '0'
        });
      }
      if (!userSession) {
        userSession = {
          ...(await obtainValidAccessToken(process.env.HARD_CODED_USER_ID)),
          id: process.env.HARD_CODED_USER_ID
        };
      }

      next();
    }
  } catch (error) {
    console.error(error);
    resp
      .status(500)
      .send(`localAuthenticationBypass: ${JSON.stringify(error)}`);
  }
}
