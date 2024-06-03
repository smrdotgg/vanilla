// import {PrismaClient} from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { env } from "~/api";

const libsql = createClient({
  url: env.SQLITE_URL,
  authToken: env.SQLITE_AUTHKEY ?? undefined,
});

const adapter = new PrismaLibSQL(libsql);
export const prisma = new PrismaClient({ adapter });
// export const prisma = new PrismaClient();


