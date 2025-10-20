
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FieldBuilder } from "@/components/fields/field-builder";
import { FieldsList } from "@/components/fields/fields-list";
import { BitrixService } from "@/lib/bitrix-service";
import type { CrmEntity } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function FieldsPage() {
  const [crms, setCrms] = useState<CrmEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCrms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedCrms = await BitrixService.getSmartProcesses();
        setCrms(fetchedCrms);
      } catch (e: any) {
        setError(e.message || "Falha ao buscar CRMs.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCrms();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center gap-2 pt-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando dados dos CRMs...</span>
        </div>
      );
    }

    if (error) {
      return (
         <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao Carregar CRMs</AlertTitle>
          <AlertDescription>
            Não foi possível buscar a lista de CRMs do Bitrix24. Verifique suas{" "}
            <a href="/settings" className="font-semibold underline">
              configurações de conexão
            </a>
            .
            <p className="mt-2 text-xs">Detalhe: {error}</p>
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
       <>
        <TabsContent value="create">
          <FieldBuilder crms={crms} />
        </TabsContent>
        <TabsContent value="list">
          <FieldsList crms={crms} />
        </TabsContent>
      </>
    );
  }


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
        {renderContent()}
      </Tabs>
    </div>
  );
}
