import BaseLayout from "@/components/BaseLayout";
import { getApiErrorMessage } from "@/utils/client-errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product, Transaction } from "@prisma/client";
import { ReactNode, useCallback, useMemo, useState } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";
import { PurchaseRequest } from "../api/products/purchase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogContent } from "@radix-ui/react-dialog";
import { format } from "date-fns";

const formSchema = z.object({
  products: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
      subsidy: z.number(),
      productId: z.string({ required_error: "Product ID is required" }),
      quantity: z
        .number({ required_error: "Quantity is required" })
        .min(1, "Minimum quantity is 1"),
    })
  ),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const {
    data: products,
    isLoading,
    error,
  } = useSWR<Product[]>("/api/products");

  const formState = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const selection = useFieldArray({
    control: formState.control,
    name: "products",
  });

  const selectedProducts = useWatch({
    control: formState.control,
    name: "products",
    defaultValue: [],
  });

  const selectedIds = useMemo(
    () => selectedProducts.map((i) => i.productId),
    [selectedProducts]
  );

  const totalDeduction = useMemo(() => {
    return selectedProducts.reduce((sum, curr) => {
      const total = curr.price * curr.quantity;
      const deduction = total * (curr.subsidy / 100);
      return sum + deduction;
    }, 0);
  }, [selectedProducts]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [newTransaction, setNewTransaction] = useState<Transaction | null>(
    null
  );

  const onSubmit = useCallback(async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setSubmitErr("");

      const request: PurchaseRequest = {
        farmerId: "sdsdsd",
        products: data.products.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
        })),
      };

      const response = await fetch("/api/products/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const body = await response.json();
      if (!response.ok) {
        throw body;
      }

      setNewTransaction(body as Transaction);
    } catch (error) {
      setSubmitErr(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  let view: ReactNode = null;

  if (isLoading && !products?.length) {
    view = <div>Loading...</div>;
  } else if (error && !products?.length) {
    view = (
      <div className="text-center">
        <div>Unable to load products</div>
        {getApiErrorMessage(error)}
      </div>
    );
  } else if (!products?.length) {
    view = <div className="text-center">No products found</div>;
  } else {
    view = (
      <FormProvider {...formState}>
        <form onSubmit={formState.handleSubmit(onSubmit)}>
          <div>
            <div className="flex flex-col md:flex-row gap-5">
              <Card className="w-full">
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {products.map((p) => {
                        const isSelected = selectedIds.includes(p.id);

                        return (
                          <TableRow key={p.id}>
                            <TableCell>{p.name}</TableCell>
                            <TableCell>{p.price}</TableCell>
                            <TableCell>
                              {!isSelected && (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() =>
                                    selection.append({
                                      name: p.name,
                                      price: p.price,
                                      productId: p.id,
                                      quantity: 1,
                                      subsidy: p.subsidyPercent,
                                    })
                                  }
                                >
                                  <PlusIcon />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>{" "}
              </Card>

              <Card className="w-full">
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Total deduction</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {selection.fields.map((f, idx) => {
                        const total = f.price * f.quantity;
                        const deduction = total * (f.subsidy / 100);

                        return (
                          <TableRow key={f.id}>
                            <TableCell>{f.name}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="icon">
                                  <PlusIcon />
                                </Button>

                                <Input
                                  {...formState.register(
                                    `products.${idx}.quantity`
                                  )}
                                  type="number"
                                />

                                <Button size="icon">
                                  <PlusIcon />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>{f.price}</TableCell>
                            <TableCell>{total}</TableCell>
                            <TableCell>{deduction}</TableCell>
                            <TableCell>
                              <button onClick={() => selection.remove(idx)}>
                                -
                              </button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {!!submitErr && <div className="mt-5 text-center">{submitErr}</div>}

            <div className="flex justify-center align-center mt-5 gap-3">
              <Button type="button" variant="outline">
                Back
              </Button>
              <Button type="submit" variant="default">
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isSubmitting
                  ? "Submitting..."
                  : `Deduct ${totalDeduction} Kes`}
              </Button>
            </div>

            <div className="mt-5 text-center">
              You will receive {totalDeduction} Kes from the subsidy program. If
              this does not cover the total cost of the purchase ensure you get
              the balance from the customer
            </div>
          </div>
        </form>
      </FormProvider>
    );
  }

  return (
    <BaseLayout>
      <div>{view}</div>

      {!!newTransaction && (
        <Dialog onOpenChange={() => setNewTransaction(null)} open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Payment successful</DialogTitle>
              <DialogDescription>
                Ref number: {newTransaction.id}
                Date:{" "}
                {format(new Date(newTransaction.createdAt), "d MMMM yyyy")}
              </DialogDescription>
            </DialogHeader>

            <DialogContent>
              <div>{newTransaction.totalDeduction} Kes</div>
            </DialogContent>

            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Done
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </BaseLayout>
  );
}
