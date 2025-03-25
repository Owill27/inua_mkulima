import { useLoggedUser } from "@/hooks/logged-user";
import { PropsWithChildren, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "./ui/dialog";
import { isPathActive } from "@/utils/is-path-active";
import { useRouter } from "next/router";

const sidebarContents = [
  { label: "Dashboard", path: "/" },
  { label: "Transactions", path: "/transactions" },
  { label: "Reports", path: "/reports" },
];

export default function BaseLayout(props: PropsWithChildren) {
  const { pathname: currentPath, push } = useRouter();
  const { logged, logOut } = useLoggedUser();
  const [confirmLogOut, setConfirmLogOut] = useState(false);

  return (
    <div>
      <div
        className="flex justify-between items-center p-5 sticky top-0 z-index-[1000] border-bottom z-50"
        style={{
          backgroundImage: "url(/images/header.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
        }}
      >
        <div className="font-bold">Inua Mkulima Subsidy Program</div>

        <div className="flex justify-end items-center gap-3">
          <div>Logged in as {logged?.name || ""}</div>
          <Button onClick={() => setConfirmLogOut(true)}>Log out</Button>
        </div>
      </div>

      <main className="flex">
        <div className="w-[250px] p-5">
          <aside className="flex flex-col gap-2  sticky top-[100px]">
            {sidebarContents.map((c) => {
              const isActive = isPathActive(
                c.path,
                currentPath,
                c.path === "/"
              );

              return (
                <button
                  key={c.label}
                  className="justify-start text-start border-l  p-3 mx-[-20px]"
                  style={{
                    borderLeft: isActive
                      ? "5px solid var(--color-app-yellow)"
                      : "5px solid transparent",
                  }}
                  onClick={() => push(c.path)}
                >
                  {c.label}
                </button>
              );
            })}
          </aside>
        </div>

        <div className="w-full p-5 h-[200vh] bg-[#f7f7f7]">
          {props.children}
        </div>
      </main>

      <Dialog open={confirmLogOut} onOpenChange={setConfirmLogOut} modal>
        <DialogContent className="text-center">
          <DialogHeader>Log out?</DialogHeader>
          <DialogDescription>
            Are you sure you want to log out
          </DialogDescription>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setConfirmLogOut(false)}>
              Back
            </Button>
            <Button onClick={logOut}>Yes, log out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
