import { getApiSessionOrTerminate } from "@/utils/auth";
import dbClient from "@/utils/db";
import { handleApiError } from "@/utils/errors";
import { Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const transactionsSelect = {
  id: true,
  farmer: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
  totalAmount: true,
  totalDeduction: true,
} satisfies Prisma.TransactionSelect;

type TransactionsAPIItem = Prisma.TransactionGetPayload<{
  select: typeof transactionsSelect;
}>;

export type TransactionsAPIReturn = TransactionsAPIItem[];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransactionsAPIReturn>
) {
  try {
    const { merchant } = await getApiSessionOrTerminate(req);

    const transactions = await dbClient.transaction.findMany({
      where: {
        merchantId: merchant.id,
      },
      select: transactionsSelect,
      orderBy: { createdAt: "desc" },
    });

    res.json(transactions);
  } catch (error) {
    handleApiError(error, res);
  }
}
