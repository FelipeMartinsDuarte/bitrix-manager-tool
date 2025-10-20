import { PageHeader } from "@/components/page-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FieldBuilder } from "@/components/fields/field-builder";
import { FieldsList } from "@/components/fields/fields-list";

export default function FieldsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Construtor de Campos"
        description="Crie e gerencie campos personalizados para seus CRMs."
      />

      <Tabs defaultValue="create">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="create">Criar Campo</TabsTrigger>
          <TabsTrigger value="list">Listar Campos</TabsTrigger>
        </TabsList>
        <TabsContent value="create">
          <FieldBuilder />
        </TabsContent>
        <TabsContent value="list">
          <FieldsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
