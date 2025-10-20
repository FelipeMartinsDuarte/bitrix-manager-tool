
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, AlertTriangle } from "lucide-react";
import CrmsTable from "@/components/crms/crms-table";
import { CreateCrmDialog } from "@/components/crms/create-crm-dialog";
import type { CrmEntity } from "@/lib/types";
import { BitrixService } from "@/lib/bitrix-service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CrmsPage() {
  const [crms, setCrms] = useState<CrmEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCrms = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCrms = await BitrixService.getSmartProcesses();
      setCrms(fetchedCrms);
    } catch (e: any) {
      setError(e.message || "Falha ao buscar CRMs. Verifique as configurações.");
      toast({
        variant: "destructive",
        title: "Erro ao buscar CRMs",
        description: e.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrms();
  }, []);

  const handleCreateCrm = (newCrm: CrmEntity) => {
    // Re-fetch to get the most up-to-date list
    fetchCrms();
  };

  const handleUpdateCrm = (updatedCrm: CrmEntity) => {
     setCrms((prevCrms) =>
      prevCrms.map((crm) => (crm.id === updatedCrm.id ? updatedCrm : crm))
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando CRMs...</span>
        </div>
      );
    }

    if (error) {
       return (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle /> Erro de Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Não foi possível conectar à API do Bitrix24. Verifique se a{" "}
              <a href="/settings" className="underline font-semibold">URL base e o Token</a>{" "}
              estão corretos na página de configurações.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Detalhe do erro: {error}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <CrmsTable
        data={crms}
        onUpdate={handleUpdateCrm}
      />
    );
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
      {renderContent()}
    </div>
  );
}
