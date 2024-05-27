// import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
// // SQLiteUserTable,
// // DrizzlePostgreSQLAdapter ,
// import { db } from "~/db/index.server";
// import { TB_sessions, TB_users } from "~/db/schema.server";
// import { Google } from "arctic";
// import { Lucia } from "lucia";
// import { env } from "~/api";
//
// const adapter = new DrizzleSQLiteAdapter(db, TB_sessions, TB_users);
//
// export const google = new Google(
//   env.GOOGLE_CLIENT_ID,
//   env.GOOGLE_CLIENT_SECRET,
//   `${env.PUBLIC_URL}auth/signed-in-with-google`,
// );
//
// export const lucia = new Lucia(adapter, {
//   sessionCookie: {
//     attributes: {
//       secure: import.meta.env.PROD,
//     },
//   },
//   getUserAttributes: (attributes) => {
//     return {
//       email: attributes.email,
//       password: attributes.password,
//     };
//   },
// });
//
// declare module "lucia" {
//   interface Register {
//     Lucia: typeof lucia;
//     DatabaseUserAttributes: DatabaseUserAttributes;
//   }
// }
//
// interface DatabaseUserAttributes {
//   email: string;
//   password: string;
// }
