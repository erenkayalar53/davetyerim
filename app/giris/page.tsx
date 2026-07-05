import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSessionProfile } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mekan Sahibi Girişi",
  robots: { index: false },
};

export default async function LoginPage() {
  const session = await getSessionProfile();
  if (session) redirect("/panel");

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-4 py-32">
      <AuthForm mode="giris" />
    </div>
  );
}
