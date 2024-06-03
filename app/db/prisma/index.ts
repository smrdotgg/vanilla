// import {PrismaClient} from "@prisma/client";
import { PrismaClient } from "@prisma/client";
// import { PrismaLibSQL } from "@prisma/adapter-libsql";
// import { createClient } from "@libsql/client";
// import { env } from "~/api";
//
// console.log("TEST");
// export const libsql = createClient({
//   url: env.SQLITE_URL,
//   authToken: env.SQLITE_AUTHKEY ?? undefined,
// });
// console.log("TEST2");
//
// const adapter = new PrismaLibSQL(libsql);
// console.log("TEST3");
// export const prisma = new PrismaClient({ adapter });
// export const prisma = new PrismaClient();



export const prisma = new PrismaClient()
