"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { MOCK_CRMS } from '@/lib/mock-data';
import { CrmFieldType } from '@/lib/types';
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

const fieldTypes: { value: CrmFieldType, label: string }[] = [
  { value: 'string', label: 'Texto (string)' },
  { value: 'double', label: 'Número (double)' },
  { value: 'datetime', label: 'Data/Hora (datetime)' },
  { value: 'boolean', label: 'Sim/Não (boolean)' },
  { value: 'crm_status', label: 'Lista (crm_status)' },
];

const formSchema = z.object({
  crmId: z.string().min(1, "Selecione um CRM de destino."),
  listLabel: z.string().min(3, "O rótulo deve ter pelo menos 3 caracteres."),
  fieldName: z.string(),
  type: z.enum(['string', 'double', 'datetime', 'boolean', 'crm_status']),
  isMultiple: z.boolean().default(false),
});

export function FieldBuilder() {
  const [payload, setPayload] = useState({});
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crmId: '',
      listLabel: '',
      fieldName: '',
      type: 'string',
      isMultiple: false,
    },
  });

  const { watch, setValue, formState: { isSubmitting } } = form;
  const watchedCrmId = watch('crmId');
  const watchedListLabel = watch('listLabel');

  useEffect(() => {
    const crm = MOCK_CRMS.find(c => c.id === watchedCrmId);
    if (crm && watchedListLabel) {
      const formattedName = watchedListLabel
        .trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_')
        .toUpperCase();
      setValue('fieldName', `UF_CRM_${crm.entityTypeId}_${formattedName}`);
    } else {
        setValue('fieldName', '');
    }
  }, [watchedCrmId, watchedListLabel, setValue]);
  
  const watchedValues = watch();
  useEffect(() => {
      const subscription = watch((value) => {
        const { crmId, ...rest } = value;
        const crm = MOCK_CRMS.find(c => c.id === crmId);
        const payloadPreview = {
          entityTypeId: crm?.entityTypeId,
          field: {
            ...rest,
            USER_TYPE_ID: rest.type,
            XML_ID: rest.fieldName,
            EDIT_FORM_LABEL: rest.listLabel,
            LIST_COLUMN_LABEL: rest.listLabel
          }
        };
        // @ts-ignore
        delete payloadPreview.field.type;
        setPayload(payloadPreview);
      });
      return () => subscription.unsubscribe();
  }, [watch]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(payload);
    toast({
        title: "Campo criado com sucesso!",
        description: `O campo "${values.listLabel}" foi enviado para o Bitrix.`
    })
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Novo Campo Personalizado</CardTitle>
            <CardDescription>
              Crie um novo campo para ser usado em um Smart Process.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-6">
                <FormField
                control={form.control}
                name="crmId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>CRM de Destino</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione um CRM" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {MOCK_CRMS.map((crm) => (
                            <SelectItem key={crm.id} value={crm.id}>
                            {crm.title}
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
                name="fieldName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Campo (API)</FormLabel>
                    <FormControl>
                      <Input disabled {...field} className="font-code" />
                    </FormControl>
                    <FormDescription>Gerado automaticamente. Padrão: UF_CRM_&#123;num&#125;_&#123;NOME&#125;</FormDescription>
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
              <div>
                <FormLabel>Pré-visualização do Payload</FormLabel>
                <pre className="mt-2 w-full rounded-md bg-secondary p-4 font-code text-sm text-secondary-foreground overflow-x-auto">
                    <code>
                        {JSON.stringify(payload, null, 2)}
                    </code>
                </pre>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Criar Campo
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
