import BaseLayout from "@/components/BaseLayout";
import { FC, ReactNode } from "react";
import useSWR from "swr";
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
import { ProductsAPIReturn } from "./api/products";

const HomePage: FC = () => {
  const router = useRouter();

  const {
    data: products,
    isLoading,
    error,
    mutate,
  } = useSWR<ProductsAPIReturn>("/api/products");

  let view: ReactNode = null;

  if (isLoading && !products?.length) {
    view = (
      <div className="flex w-full h-[100vh] items-center justify-center">
        <div>
          <Loader2Icon size={40} className="animate-spin" />
        </div>
      </div>
    );
  } else if (error && !products?.length) {
    view = (
      <div className="text-center">
        <div>Unable to load products</div>
        {getApiErrorMessage(error)}
      </div>
    );
  } else if (!products?.length) {
    view = (
      <div className="text-center">
        <div>No products yet</div>
      </div>
    );
  } else {
    view = (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Subsidy</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((prod) => (
            <TableRow key={prod.id}>
              <TableCell>{prod.id}</TableCell>
              <TableCell>{prod.name}</TableCell>
              <TableCell>
                {format(new Date(prod.createdAt), "d MMM yyyy, h:mma")}
              </TableCell>
              <TableCell className="text-right">
                {formatPrice(prod.price)}
              </TableCell>
              <TableCell className="text-right">
                {prod.subsidyPercent}%
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
          All products
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center mb-5">
            <Button
              variant="default"
              onClick={() => router.push("/transactions/new")}
            >
              <PlusIcon />
              Start a transaction
            </Button>

            <Button variant="outline" onClick={() => mutate()}>
              <RefreshCwIcon />
              Refresh products
            </Button>
          </div>

          {view}
        </CardContent>
      </Card>
    </BaseLayout>
  );
};

export default HomePage;
