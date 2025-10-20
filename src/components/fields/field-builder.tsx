
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { CrmFieldType, type CrmEntity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';
import { MultiSelect } from '../ui/multi-select';
import { BitrixService } from '@/lib/bitrix-service';

const fieldTypes: { value: CrmFieldType, label: string }[] = [
  { value: 'string', label: 'Texto (string)' },
  { value: 'double', label: 'Número (double)' },
  { value: 'datetime', label: 'Data/Hora (datetime)' },
  { value: 'boolean', label: 'Sim/Não (boolean)' },
  { value: 'crm_status', label: 'Lista (crm_status)' },
  { value: 'enumeration', label: 'Lista (enumeration)'},
  { value: 'user', label: 'Usuário (user)'},
  { value: 'file', label: 'Arquivo (file)'}
];

type PayloadPreview = {
  entityTypeId: number,
  field: {
    USER_TYPE_ID: CrmFieldType;
    FIELD_NAME: string;
    EDIT_FORM_LABEL: string;
    LIST_COLUMN_LABEL: string;
    MULTIPLE: 'Y' | 'N';
  }
}

const formSchema = z.object({
  crmIds: z.array(z.string()).min(1, "Selecione pelo menos um CRM de destino."),
  listLabel: z.string().min(3, "O rótulo deve ter pelo menos 3 caracteres."),
  fieldNamePrefix: z.string(),
  type: z.enum(['string', 'double', 'datetime', 'boolean', 'crm_status', 'enumeration', 'user', 'file']),
  isMultiple: z.boolean().default(false),
});

type FieldBuilderProps = {
  crms: CrmEntity[];
}

export function FieldBuilder({ crms }: FieldBuilderProps) {
  const [payloads, setPayloads] = useState<PayloadPreview[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crmIds: [],
      listLabel: '',
      fieldNamePrefix: 'UF_CRM_{ID}_',
      type: 'string',
      isMultiple: false,
    },
  });

  const { watch, setValue, formState: { isSubmitting } } = form;
  const watchedListLabel = watch('listLabel');
  const watchedCrmIds = watch('crmIds');

  useEffect(() => {
    if (watchedListLabel) {
      const formattedName = watchedListLabel
        .trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_')
        .toUpperCase();
      setValue('fieldNamePrefix', `UF_CRM_{ID}_${formattedName}`);
    } else {
       setValue('fieldNamePrefix', 'UF_CRM_{ID}_');
    }
  }, [watchedListLabel, setValue]);

  useEffect(() => {
    const subscription = watch((value) => {
      const { crmIds = [], listLabel, fieldNamePrefix, isMultiple, type } = value;
      const selectedCrms = crms.filter(c => crmIds.includes(c.id));

      if (!listLabel || !fieldNamePrefix || !type || selectedCrms.length === 0) {
        setPayloads([]);
        return;
      }

      const payloadPreviews = selectedCrms.map(crm => {
        const crmSpecificFieldName = fieldNamePrefix?.replace('{ID}', crm.entityTypeId.toString()) || '';
        
        return {
          entityTypeId: crm.entityTypeId,
          field: {
            FIELD_NAME: crmSpecificFieldName,
            EDIT_FORM_LABEL: listLabel,
            LIST_COLUMN_LABEL: listLabel,
            USER_TYPE_ID: type,
            MULTIPLE: isMultiple ? 'Y' : 'N',
          }
        };
      });
      // @ts-ignore
      setPayloads(payloadPreviews);
    });
    return () => subscription.unsubscribe();
  }, [watch, crms]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
      if (payloads.length === 0) {
        toast({
            variant: "destructive",
            title: "Nenhuma ação a ser executada",
            description: "Preencha o formulário e selecione os CRMs de destino.",
        });
        return;
    }

    const results = await Promise.allSettled(
        payloads.map(p => BitrixService.createField(p.entityTypeId, p.field))
    );

    const successes = results.filter(r => r.status === 'fulfilled').length;
    const failures = results.filter(r => r.status === 'rejected').length;

    if (successes > 0) {
        toast({
            title: "Operação Concluída!",
            description: `${successes} campo(s) criado(s) com sucesso.`,
        });
    }

    if (failures > 0) {
         const failedCrms = results
            .map((r, index) => (r.status === 'rejected' ? crms.find(c=> c.id === payloads[index].entityTypeId.toString())?.title : null))
            .filter(Boolean)
            .join(', ');

        toast({
            variant: "destructive",
            title: `Falha ao criar ${failures} campo(s)`,
            description: `Erro nos CRMs: ${failedCrms}. Verifique o console para detalhes.`,
        });
        
         results.forEach(r => {
            if (r.status === 'rejected') {
                console.error("Falha ao criar campo:", r.reason);
            }
        })
    }

     form.reset();
     setPayloads([]);
  }
  
  const crmOptions = useMemo(() => crms.map(crm => ({ value: crm.id, label: crm.title })), [crms]);

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Novo Campo Personalizado</CardTitle>
            <CardDescription>
              Crie um novo campo para ser usado em um ou mais Smart Processes.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="crmIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CRMs de Destino</FormLabel>
                     <MultiSelect
                      options={crmOptions}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Selecione um ou mais CRMs"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="listLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rótulo do Campo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Orçamento Aprovado" {...field} />
                    </FormControl>
                    <FormDescription>Este é o nome que aparecerá para o usuário.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fieldNamePrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Campo (API)</FormLabel>
                    <FormControl>
                      <Input disabled {...field} className="font-code" />
                    </FormControl>
                    <FormDescription>Gerado automaticamente. O &#123;ID&#125; será substituído para cada CRM.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid gap-6'>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Campo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fieldTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isMultiple"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Múltiplo
                      </FormLabel>
                      <FormDescription>
                        Permitir que este campo tenha múltiplos valores.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
                {payloads.length > 0 && (
                <div>
                  <FormLabel>Pré-visualização do Payload</FormLabel>
                  <pre className="mt-2 w-full max-h-60 overflow-y-auto rounded-md bg-secondary p-4 font-code text-sm text-secondary-foreground">
                    <code>
                      {JSON.stringify(payloads, null, 2)}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSubmitting || payloads.length === 0}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Criar Campo(s)
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

    