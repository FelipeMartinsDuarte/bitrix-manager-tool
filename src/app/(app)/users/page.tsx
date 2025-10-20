import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pesquisa de Usuários"
        description="Procure usuários do Bitrix24 por nome ou e-mail."
      />
      <Card>
        <CardHeader>
          <CardTitle>Em desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Esta página permitirá a busca de usuários cadastrados no Bitrix24.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
