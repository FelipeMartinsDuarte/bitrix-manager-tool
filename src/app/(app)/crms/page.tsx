import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { MOCK_CRMS } from "@/lib/mock-data";
import CrmsTable from "@/components/crms/crms-table";
import { CreateCrmDialog } from "@/components/crms/create-crm-dialog";

export default function CrmsPage() {
  const crms = MOCK_CRMS;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Gerenciamento de CRMs"
        description="Liste, crie e gerencie seus Smart Processes (CRMs) do Bitrix24."
      >
        <CreateCrmDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar CRM
          </Button>
        </CreateCrmDialog>
      </PageHeader>
      <CrmsTable data={crms} />
    </div>
  );
}
