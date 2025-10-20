import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações de integração e permissões."
      />
      <Card>
        <CardHeader>
          <CardTitle>Em desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Esta página permitirá gerenciar o token e URL base do Bitrix24, além de papéis e permissões de usuários.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
