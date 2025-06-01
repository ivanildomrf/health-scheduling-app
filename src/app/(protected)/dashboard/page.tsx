import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { SignOutButton } from "./components/sign-out-button";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic || !session.user.clinic?.id) {
    redirect("/clinic-form");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <h1>{session?.user.name}</h1>
      <h1>{session?.user.email}</h1>
      <Image
        src={(session?.user.image as string) || ""}
        alt="User"
        width={100}
        height={100}
        className="rounded-full"
      />
      <SignOutButton />
    </div>
  );
};

export default DashboardPage;
