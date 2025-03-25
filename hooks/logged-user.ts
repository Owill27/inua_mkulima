import { getApiErrorMessage } from "@/utils/client-errors";
import { Merchant } from "@prisma/client";
import { useCallback } from "react";
import useSWR from "swr";

export function useLoggedUser() {
  const { data, error } = useSWR<Merchant>("/api/auth/logged");

  const logOut = useCallback(() => {
    window.location.replace("/api/auth/logout");
  }, []);

  return {
    logged: data,
    isLoading: !data && !error,
    logOut,
    error: !!error ? getApiErrorMessage(error) : null,
  };
}
