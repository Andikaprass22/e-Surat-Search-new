import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import { getUserById } from "@/lib/data/pengguna";
import { ResetPasswordForm } from "@/app/(dashboard)/admin/pengguna/reset-password/reset-password-form";

function Loading() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 px-6">
      Memuat data pengguna...
    </div>
  );
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; name?: string }>;
}) {
  const params = await searchParams;
  const userId = params.userId ?? "";
  const name = params.name ?? "Pengguna";

  return (
    <Card className="border-2">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <CardTitle>Atur Ulang Kata Sandi</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Suspense fallback={<Loading />}>
          <ResetPasswordFormLoader userId={userId} name={name} />
        </Suspense>
      </CardContent>
    </Card>
  );
}

async function ResetPasswordFormLoader({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const user = userId ? await getUserById(userId) : null;
  const displayName = user?.name ?? name;
  return <ResetPasswordForm userId={userId} name={displayName} />;
}
