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
import {
  Loader2,
  Loader2Icon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { formatPrice } from "@/utils/format-price";
import { useLoggedUser } from "@/hooks/logged-user";
import { useRouter } from "next/router";

const formSchema = z.object({
  products: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
      subsidy: z.number(),
      productId: z.string({ required_error: "Product ID is required" }),
      quantity: z.preprocess(
        (val) => (typeof val === "string" ? Number(val) : val),
        z
          .number({ required_error: "Quantity is required" })
          .min(1, "Minimum quantity is 1")
      ),
    })
  ),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const router = useRouter();
  const { logged: loggedUser } = useLoggedUser();
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

  const incrementQty = useCallback(
    (idx: number) => {
      const currValues = formState.getValues("products");
      const currItem = currValues[idx];

      if (currItem) {
        const newArr = [...currValues];
        newArr[idx] = {
          ...currItem,
          quantity: Number(currItem.quantity) + 1,
        };
        formState.setValue("products", newArr);
      }
    },
    [formState]
  );

  const decrementQty = useCallback(
    (idx: number) => {
      const currValues = formState.getValues("products");
      const currItem = currValues[idx];

      if (currItem && currItem.quantity > 1) {
        const newArr = [...currValues];
        newArr[idx] = {
          ...currItem,
          quantity: Number(currItem.quantity) - 1,
        };
        formState.setValue("products", newArr);
      }
    },
    [formState]
  );

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
    view = <div className="text-center">No products found</div>;
  } else {
    view = (
      <FormProvider {...formState}>
        <form onSubmit={formState.handleSubmit(onSubmit)}>
          <div>
            <div className="flex flex-col md:flex-row gap-5">
              <Card className="w-full">
                <CardContent>
                  <div className="font-semibold mb-5">Products</div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {products.map((p) => {
                        const isSelected = selectedIds.includes(p.id);

                        return (
                          <TableRow key={p.id}>
                            <TableCell>{p.name}</TableCell>
                            <TableCell className="text-right">
                              {formatPrice(p.price)}
                            </TableCell>
                            <TableCell className="text-right">
                              {!isSelected && (
                                <Button
                                  size="icon"
                                  variant="outline"
                                  type="button"
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
                  <div className="font-semibold mb-5">Selected Products</div>

                  {selectedProducts.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">
                            Deduction
                          </TableHead>
                          <TableHead className="text-right"></TableHead>
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
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    type="button"
                                    onClick={() => decrementQty(idx)}
                                  >
                                    <MinusIcon />
                                  </Button>

                                  <Input
                                    {...formState.register(
                                      `products.${idx}.quantity`
                                    )}
                                    type="number"
                                    className="w-full min-w-[100px]"
                                  />

                                  <Button
                                    size="icon"
                                    variant="outline"
                                    type="button"
                                    onClick={() => incrementQty(idx)}
                                  >
                                    <PlusIcon />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {formatPrice(f.price, "")}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatPrice(total, "")}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatPrice(deduction, "")}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => selection.remove(idx)}
                                >
                                  <TrashIcon />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center">No products selected</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {!!submitErr && <div className="mt-5 text-center">{submitErr}</div>}

            <div className="flex justify-center align-center mt-5 gap-3 max-w-[600px] mx-auto">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/transactions")}
              >
                Back
              </Button>
              <Button type="submit" variant="default" className="flex-1">
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isSubmitting
                  ? "Submitting..."
                  : `Deduct ${formatPrice(totalDeduction)}`}
              </Button>
            </div>

            <div
              className="mt-5 text-center mx-auto max-w-[600px]"
              style={{ color: "var(--color-app-red)" }}
            >
              You will receive Kes {formatPrice(totalDeduction, "")} from the
              subsidy program. If this does not cover the total cost of the
              purchase ensure you get the balance from the customer
            </div>
          </div>
        </form>
      </FormProvider>
    );
  }

  return (
    <BaseLayout>
      <div>
        <div className="mb-5">
          <div className="font-bold">New purchase</div>
          <div>
            Inua Mkulima balance: {formatPrice(loggedUser?.balance || 0)}
          </div>
        </div>

        {view}
      </div>

      {!!newTransaction && (
        <Dialog
          onOpenChange={() => {
            setNewTransaction(null);
            router.push("/transactions");
          }}
          open
          modal
        >
          <DialogContent className="text-center">
            <DialogHeader>
              <DialogTitle className="text-center">
                Payment successful
              </DialogTitle>
              <DialogDescription className="text-center">
                Ref number: {newTransaction.id}
                <br />
                Date:{" "}
                {format(new Date(newTransaction.createdAt), "d MMMM yyyy")}
              </DialogDescription>
            </DialogHeader>

            <div>{formatPrice(newTransaction.totalDeduction)}</div>

            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="default" className="w-full">
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
