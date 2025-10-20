
"use client";

import { useState } from 'react';
import { MOCK_FIELDS } from '@/lib/mock-data';
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
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import type { CrmEntity } from '@/lib/types';

type FieldsListProps = {
  crms: CrmEntity[];
}

export function FieldsList({ crms }: FieldsListProps) {
  const [selectedCrmId, setSelectedCrmId] = useState<string | null>(null);
  // TODO: Replace MOCK_FIELDS with a real API call
  const fields = selectedCrmId ? MOCK_FIELDS[selectedCrmId] || [] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listar Campos de um CRM</CardTitle>
        <CardDescription>
          Selecione um CRM para ver e gerenciar seus campos personalizados.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full md:w-1/3">
            <Select onValueChange={setSelectedCrmId}>
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

        {selectedCrmId && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rótulo</TableHead>
                  <TableHead>Nome (API)</TableHead>
                  <TableHead>Tipo</TableHead>
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
                      <TableCell className="font-code text-muted-foreground">{field.fieldName}</TableCell>
                      <TableCell>
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
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nenhum campo encontrado para este CRM. (Usando dados mock)
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
