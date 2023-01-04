import type { NextApiRequest, NextApiResponse, GetServerSidePropsContext } from "next";
import { unstable_getServerSession } from "next-auth";

import { requestWrapper } from "../../pages/api/auth/[...nextauth]";

/**
 * Wrapper for unstable_getServerSession https://next-auth.js.org/configuration/nextjs
 * See example usage in trpc createContext or the restricted API route
 */

export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  // request wrapper might modify the cookies on the response
  const [a, b, options] = requestWrapper(ctx.req as NextApiRequest, ctx.res as NextApiResponse);
  return await unstable_getServerSession(a, b, options);
};
