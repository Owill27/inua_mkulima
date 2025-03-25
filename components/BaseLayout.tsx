import { useLoggedUser } from "@/hooks/logged-user";
import { PropsWithChildren } from "react";

const sidebarContents = [
  { label: "Dashboard", path: "/" },
  { label: "Transactions", path: "/transactions" },
  { label: "Reports", path: "/reports" },
];

export default function BaseLayout(props: PropsWithChildren) {
  const { logged, logOut } = useLoggedUser();

  return (
    <div>
      <div className="flex justify-between align-center p-5 sticky top-0 z-index-[1000] border-bottom">
        <div>Inua Mkulima Subsidy Program</div>

        <div className="flex justify-end align-center gap-3">
          <div>Logged in as {logged?.name || ""}</div>
          <button onClick={logOut}>Log out</button>
        </div>
      </div>

      <main className="px-5 flex">
        <aside className="flex flex-col gap-2 ">
          {sidebarContents.map((c) => (
            <button key={c.label} className="justify-start text-start">
              {c.label}
            </button>
          ))}
        </aside>

        <div className="w-full px-5">{props.children}</div>
      </main>
    </div>
  );
}
