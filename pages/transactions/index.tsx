import BaseLayout from "@/components/BaseLayout";
import { FC, ReactNode } from "react";
import useSWR from "swr";
import { TransactionsAPIReturn } from "../api/transactions";
import { Loader2Icon, PlusIcon, RefreshCwIcon } from "lucide-react";
import { getApiErrorMessage } from "@/utils/client-errors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { formatPrice } from "@/utils/format-price";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

const TransactionsPage: FC = () => {
  const router = useRouter();

  const {
    data: transactions,
    isLoading,
    error,
    mutate,
  } = useSWR<TransactionsAPIReturn>("/api/transactions");

  let view: ReactNode = null;

  if (isLoading && !transactions?.length) {
    view = (
      <div className="flex w-full h-[100vh] items-center justify-center">
        <div>
          <Loader2Icon size={40} className="animate-spin" />
        </div>
      </div>
    );
  } else if (error && !transactions?.length) {
    view = (
      <div className="text-center">
        <div>Unable to load transactions</div>
        {getApiErrorMessage(error)}
      </div>
    );
  } else if (!transactions?.length) {
    view = (
      <div className="text-center">
        <div>No transactions yet</div>
      </div>
    );
  } else {
    view = (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Farmer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Total amount</TableHead>
            <TableHead className="text-right">Total deduction</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {transactions.map((tr) => (
            <TableRow key={tr.id}>
              <TableCell>{tr.id}</TableCell>
              <TableCell>{tr.farmer.name}</TableCell>
              <TableCell>
                {format(new Date(tr.createdAt), "d MMM yyyy, h:mma")}
              </TableCell>
              <TableCell className="text-right">
                {formatPrice(tr.totalAmount)}
              </TableCell>
              <TableCell className="text-right">
                {formatPrice(tr.totalDeduction)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <BaseLayout>
      <Card>
        <CardHeader className="flex-col justify-between items-center">
          Transactions
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center mb-5">
            <Button
              variant="default"
              onClick={() => router.push("/transactions/new")}
            >
              <PlusIcon />
              New transaction
            </Button>

            <Button variant="outline" onClick={() => mutate()}>
              <RefreshCwIcon />
              Refresh
            </Button>
          </div>

          {view}
        </CardContent>
      </Card>
    </BaseLayout>
  );
};

export default TransactionsPage;
