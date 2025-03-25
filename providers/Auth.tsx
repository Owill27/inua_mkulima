import { LoginForm } from "@/components/login-form";
import { useLoggedUser } from "@/hooks/logged-user";
import { Loader2Icon } from "lucide-react";
import { FC, PropsWithChildren } from "react";

const AuthProvider: FC<PropsWithChildren> = (props) => {
  const { logged, isLoading } = useLoggedUser();

  if (isLoading) {
    return (
      <div className="flex w-[100vw] h-[100vh] items-center justify-center">
        <div>
          <Loader2Icon size={40} className="animate-spin" />
        </div>
      </div>
    );
  }

  if (!logged) {
    return <LoginForm />;
  }

  return <>{props.children}</>;
};

export default AuthProvider;
