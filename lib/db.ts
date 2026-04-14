import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
export async function checkDbConn(): Promise<boolean> {
  try {
    await prisma.$queryRaw`select 1`;
    return true;
  } catch (error) {
    console.error(`Database connection failed : ${error}`);
    return false;
}
}
