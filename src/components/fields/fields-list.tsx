
"use client";

import { useState } from 'react';
import { BitrixService } from '@/lib/bitrix-service';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Loader2, AlertTriangle } from 'lucide-react';
import type { CrmEntity, CrmField } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type FieldsListProps = {
  crms: CrmEntity[];
}

export function FieldsList({ crms }: FieldsListProps) {
  const [selectedCrm, setSelectedCrm] = useState<CrmEntity | null>(null);
  const [fields, setFields] = useState<CrmField[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCrmChange = async (crmId: string) => {
    const crm = crms.find(c => c.id === crmId);
    if (!crm) return;
    
    setSelectedCrm(crm);
    setIsLoading(true);
    setError(null);
    setFields([]);

    try {
      // crm.item.fields usa entityTypeId; título vem em meta.title
      const fetchedFields = await BitrixService.getFieldsForCrm(crm.entityTypeId);
      setFields(fetchedFields);
    } catch (e: any) {
      setError(e.message || "Falha ao buscar campos.");
      toast({
        variant: "destructive",
        title: "Erro ao buscar campos",
        description: e.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderContent = () => {
    if (!selectedCrm) {
      return null;
    }

    if (isLoading) {
       return (
        <div className="flex items-center justify-center gap-2 pt-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando campos para "{selectedCrm.title}"...</span>
        </div>
      );
    }
    
    if (error) {
       return (
        <div className="flex items-center justify-center gap-2 pt-10 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <span>Erro: {error}</span>
        </div>
      );
    }

    return (
       <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rótulo</TableHead>
                  <TableHead className="hidden md:table-cell">Nome (API)</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                  <TableHead>
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length > 0 ? (
                  fields.map((field) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{field.listLabel}</TableCell>
                      <TableCell className="font-code text-muted-foreground hidden md:table-cell">{field.fieldName}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="secondary">{field.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nenhum campo personalizado encontrado para este CRM.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listar Campos de um CRM</CardTitle>
        <CardDescription>
          Selecione um CRM para ver e gerenciar seus campos personalizados.
          {selectedCrm && !isLoading && !error ? ` (${fields.length} campos)` : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full md:w-1/3">
            <Select onValueChange={handleCrmChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecione um CRM" />
                </SelectTrigger>
                <SelectContent>
                    {crms.map((crm) => (
                    <SelectItem key={crm.id} value={crm.id}>
                        {crm.title}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
