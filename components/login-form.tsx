import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/utils/client-errors";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeClosedIcon, EyeIcon, Loader2Icon } from "lucide-react";
import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { mutate } from "swr";
import { z } from "zod";

const formSchema = z.object({
  username: z.string({ required_error: "Username is required" }),
  password: z.string({ required_error: "Password is required" }),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const formState = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  const login = useCallback(async (data: FormData) => {
    try {
      setIsSubmitting(true);
      setSubmitErr("");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const body = await response.json();

      if (!response.ok) {
        throw body;
      }

      await mutate("/api/auth/logged");
    } catch (error) {
      setSubmitErr(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <FormProvider {...formState}>
      <form
        className="flex flex-col justify-center h-[100vh] gap-6 mx-auto max-w-[800px]"
        onSubmit={formState.handleSubmit(login)}
      >
        <Card className="overflow-hidden">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <p className="text-balance text-muted-foreground">
                    Welcome to
                  </p>
                  <h1 className="text-2xl font-bold">
                    Inua Mkulima Subsidy Program
                  </h1>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Username</Label>
                  <Input
                    {...formState.register("username")}
                    placeholder="Enter your username"
                    required
                  />
                  <ErrorMessage name="username" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      {...formState.register("password")}
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                    />
                    <Button
                      onClick={() => setShowPassword((show) => !show)}
                      type="button"
                      size="icon"
                    >
                      {showPassword ? <EyeClosedIcon /> : <EyeIcon />}
                    </Button>
                  </div>
                  <ErrorMessage name="password" />
                </div>

                {!!submitErr && (
                  <div className="text-center py-5">{submitErr}</div>
                )}

                <Button type="submit" className="w-full">
                  {isSubmitting && (
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isSubmitting ? "Please wait..." : "Log in"}
                </Button>
              </div>
            </div>
            <div className="relative hidden bg-muted md:block">
              <img
                src="/images/bg.png"
                alt="Image"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
