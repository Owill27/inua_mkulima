import { getApiErrorMessage } from "@/utils/client-errors";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorMessage } from "@hookform/error-message";

const formSchema = z.object({
  username: z.string({ required_error: "Username is required" }),
  password: z.string({ required_error: "Password is required" }),
});

type FormData = z.infer<typeof formSchema>;

const LoginPage: FC = () => {
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

      window.location.reload();
    } catch (error) {
      setSubmitErr(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return (
    <FormProvider {...formState}>
      <form onSubmit={formState.handleSubmit(login)}>
        <div>
          <div>Username</div>
          <input {...formState.register("username")} />
          <ErrorMessage name="username" />
        </div>

        <div>
          <div>Password</div>
          <input
            {...formState.register("password")}
            type={showPassword ? "text" : "password"}
          />
          <button
            onClick={() => setShowPassword((show) => !show)}
            type="button"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
          <ErrorMessage name="password" />
        </div>

        {!!submitErr && <div>{submitErr}</div>}

        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </FormProvider>
  );
};

export default LoginPage;
