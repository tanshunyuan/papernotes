import { useEffect } from "react";
import { api } from "~/trpc/react";

let didInit = false;
export const useSeedNewUser = () => {
  const userRegistrationMutation = api.user.register.useMutation();

  useEffect(() => {
    if (didInit) return;

    userRegistrationMutation.mutate(undefined, {
      onSuccess: () => {
        console.info("register success");
      },
      onError: (err) => {
        console.error("register error ==> ", err);
      },
    });

    didInit = true;
  }, [userRegistrationMutation]);

  return null;
};
