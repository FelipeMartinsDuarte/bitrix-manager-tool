import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Visualizador de Logs"
        description="Visualize logs de ações filtrados por entidade, usuário e data."
      />
      <Card>
        <CardHeader>
          <CardTitle>Em desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Esta página irá exibir os logs de atividades do Bitrix24.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
