// app/sessions.js
import { redirect, createCookieSessionStorage } from "@remix-run/node"; // or "@remix-run/cloudflare"

// Initialize Firebase
// ---------------------
import admin from "firebase-admin";
import { LOGIN_ROUTE } from "../constants";
import { CleanDecodedIdToken } from "./types";
import { env } from "../env";

if (Number(admin.apps?.length) === 0) {
  admin.initializeApp({
    projectId: env.FIREBASE_PROJECT_ID,
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

/**
 * setup the session cookie to be used for firebase
 */
const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "fb:token",
      expires: new Date(Date.now() + 60 * 60 * 24 * 5 * 1000),
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 5,
      domain: env.NODE_ENV === "production" ? ".splitbox.io" : undefined,
      path: "/",
      sameSite: "lax",
      secrets: ["f3cr@z7"],
      secure: false,
    },
  });

const cache: { [key: string]: CleanDecodedIdToken } = {};

/**
 * Validates the session associated with the provided request.
 * @param {Request} request - The request object containing the session information.
 * @returns {Promise<object|undefined>} A promise resolving to the decoded claims of the session if valid,
 * or undefined if the session is invalid or unavailable.
 */
const validateSession = async (
  request: Request
): Promise<CleanDecodedIdToken | undefined> => {
  const cookie = request.headers.get("cookie") ?? "";
  const session = await getSession(cookie);
  if (env.NODE_ENV === "development" && cache[JSON.stringify(session)!]) {
    console.log("firebase cache hit");
    return cache[JSON.stringify(session)!];
  }
  console.log("firebase cache miss");
  try {
    // Verify the session cookie. In this case an additional check is added to detect
    // if the user's Firebase session was revoked, user deleted/disabled, etc.
    const decodedClaims = await admin
      .auth()
      .verifySessionCookie(session.get("idToken"), true /** checkRevoked */);
    cache[JSON.stringify(session)!] = decodedClaims;
    return decodedClaims;
  } catch (error) {
    return undefined;
  }
};

/**
 * Checks if the session associated with the provided request is valid.
 * Rediects otherwise.
 */
const validateSessionAndRedirectIfInvalid = async (request: Request) => {
  const cookieString = request.headers.get("cookie");
  const session = await getSession(cookieString);

  try {
    console.log("Verifying session...");
    // Verify the session cookie. In this case an additional check is added to detect
    // if the user's Firebase session was revoked, user deleted/disabled, etc.
    const decodedClaims = await admin
      .auth()
      .verifySessionCookie(session.get("idToken"), true /** checkRevoked */);

    return decodedClaims;
  } catch (error) {
    console.error("Error in validateSessionAndRedirectIfInvalid:", error);
    // Session cookie is unavailable or invalid. Force user to login.
    const errorString = "Session cookie is invalid";
    throw redirect(LOGIN_ROUTE, {
      statusText: errorString,
    });
  }
};

/**
 * set the cookie on the header and redirect to the specified route
 *
 * @param {*} sessionCookie
 * @param {*} redirectTo
 * @returns
 */
const setCookieAndRedirect = async (
  request: Request,
  sessionCookie: string,
  redirectTo = "/"
) => {
  const session = await getSession(request.headers.get("cookie"));
  session.set("idToken", sessionCookie);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const getUserInfoFromIdToken = (idToken: string) => {
  return admin.auth().verifyIdToken(idToken);
};

/**
 * login the session by verifying the token, if all is good create/set cookie
 * and redirect to the appropriate route
 *
 * @param {*} idToken
 * @param {*} redirectTo
 * @returns
 */
const sessionLogin = async ({
  request,
  idToken,
  redirectTo,
  retryCount = 0,
  error,
}: {
  request: Request;
  idToken: string;
  redirectTo: string;
  retryCount?: number;
  error?: string;
}) => {
  console.log(`[sessionLogin] retry count ${retryCount}`);
  if (retryCount === 3) {
    console.error("Error in sessionLogin:", error);
    return {
      error: String(error),
    };
  }

  try {
    // admin.app().auth().verifyIdToken(idToken);
    // getAuth().verifyIdToken(idToken);
    await admin.auth().verifyIdToken(idToken, true);

    return admin
      .auth()
      .createSessionCookie(idToken, {
        expiresIn: 60 * 60 * 24 * 5 * 1000,
      })
      .then(
        (sessionCookie) => {
          console.log("Session cookie created successfully");
          // Set cookie policy for session cookie.
          return setCookieAndRedirect(request, sessionCookie, redirectTo);
        },
        (error) => {
          console.error("Error creating session cookie:", error);
          return {
            error: `sessionLogin error!: ${error.message}`,
          };
        }
      );
  } catch (error) {
    return sessionLogin({
      error: String(error),
      request,
      redirectTo,
      idToken,
      retryCount: retryCount + 1,
    });

    console.error("Error in sessionLogin:", error);
    return {
      error: String(error),
    };
  }
};

/**
 * revokes the session cookie from the firebase admin instance
 * @param {*} request
 * @returns
 */
const sessionLogout = async (request: Request) => {
  const session = await getSession(request.headers.get("cookie"));

  // Verify the session cookie. In this case an additional check is added to detect
  // if the user's Firebase session was revoked, user deleted/disabled, etc.
  return admin
    .auth()
    .verifySessionCookie(session.get("idToken"), false /** checkRevoked */)
    .then((decodedClaims) => {
      return admin.auth().revokeRefreshTokens(decodedClaims?.sub);
    })
    .then(async () => {
      return redirect(LOGIN_ROUTE, {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      });
    })
    .catch((error) => {
      console.log(error);
      return { error: error?.message };
    });
};

const getFirebaseUser = async (idToken: string) =>
  admin.auth().getUser(idToken);

const deleteUser = async ({ userId }: { userId: string }) => {
  return await admin.auth().deleteUser(userId);
};

export {
  deleteUser,
  sessionLogin,
  sessionLogout,
  validateSession,
  getUserInfoFromIdToken,
  validateSessionAndRedirectIfInvalid,
  getFirebaseUser,
};
