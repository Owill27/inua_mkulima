import BaseLayout from "@/components/BaseLayout";
import Link from "next/link";

export default function Home() {
  return (
    <BaseLayout>
      <div>
        <Link href="/transactions/new">New transaction</Link>
      </div>
    </BaseLayout>
  );
}
