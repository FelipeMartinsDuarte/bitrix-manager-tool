
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import type { CrmEntity } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { EditCrmDialog } from "./edit-crm-dialog";
import { DeleteCrmAlert } from "./delete-crm-alert";

type CrmsTableProps = {
  data: CrmEntity[];
  onUpdate: (crm: CrmEntity) => void;
  onDelete: (crmId: string) => void;
};

function FormattedDate({ dateString }: { dateString: string }) {
  const [formattedDate, setFormattedDate] = React.useState("");

  React.useEffect(() => {
    // Ensure this runs only on the client
    setFormattedDate(
      new Date(dateString).toLocaleDateString(navigator.language, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    );
  }, [dateString]);

  return <>{formattedDate}</>;
}

export default function CrmsTable({ data, onUpdate, onDelete }: CrmsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CRMs Ativos</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead className="hidden md:table-cell">
                ID da Entidade
              </TableHead>
              <TableHead className="hidden md:table-cell">Criado em</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((crm, index) => (
              <TableRow key={`${crm.id}-${index}`}>
                <TableCell className="font-medium">{crm.title}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline">{crm.entityTypeId}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <FormattedDate dateString={crm.created} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <EditCrmDialog crm={crm} onUpdate={onUpdate}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      </EditCrmDialog>
                      <DeleteCrmAlert
                        crmId={crm.id}
                        crmTitle={crm.title}
                        onDelete={onDelete}
                      >
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      </DeleteCrmAlert>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
