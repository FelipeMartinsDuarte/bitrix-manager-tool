
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { MOCK_CRMS } from "@/lib/mock-data";
import CrmsTable from "@/components/crms/crms-table";
import { CreateCrmDialog } from "@/components/crms/create-crm-dialog";
import type { CrmEntity } from "@/lib/types";

export default function CrmsPage() {
  const [crms, setCrms] = useState<CrmEntity[]>(MOCK_CRMS);

  const handleCreateCrm = (newCrm: CrmEntity) => {
    setCrms((prevCrms) => [...prevCrms, newCrm]);
  };

  const handleUpdateCrm = (updatedCrm: CrmEntity) => {
    setCrms((prevCrms) =>
      prevCrms.map((crm) => (crm.id === updatedCrm.id ? updatedCrm : crm))
    );
  };

  const handleDeleteCrm = (crmId: string) => {
    setCrms((prevCrms) => prevCrms.filter((crm) => crm.id !== crmId));
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Gerenciamento de CRMs"
        description="Liste, crie e gerencie seus Smart Processes (CRMs) do Bitrix24."
      >
        <CreateCrmDialog onCreate={handleCreateCrm}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar CRM
          </Button>
        </CreateCrmDialog>
      </PageHeader>
      <CrmsTable
        data={crms}
        onUpdate={handleUpdateCrm}
        onDelete={handleDeleteCrm}
      />
    </div>
  );
}
