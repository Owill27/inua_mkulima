import { LoginForm } from "@/components/login-form";
import { useLoggedUser } from "@/hooks/logged-user";
import { FC, PropsWithChildren } from "react";

const AuthProvider: FC<PropsWithChildren> = (props) => {
  const { logged, isLoading } = useLoggedUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!logged) {
    return <LoginForm />;
  }

  return <>{props.children}</>;
};

export default AuthProvider;
