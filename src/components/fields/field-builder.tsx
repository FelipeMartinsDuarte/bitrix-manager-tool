
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

const fieldTypes: { value: CrmFieldType, label: string }[] = [
  { value: 'string', label: 'Texto (string)' },
  { value: 'double', label: 'Número (double)' },
  { value: 'datetime', label: 'Data/Hora (datetime)' },
  { value: 'boolean', label: 'Sim/Não (boolean)' },
  { value: 'crm_status', label: 'Lista (crm_status)' },
];

const formSchema = z.object({
  crmIds: z.array(z.string()).min(1, "Selecione pelo menos um CRM de destino."),
  listLabel: z.string().min(3, "O rótulo deve ter pelo menos 3 caracteres."),
  fieldNamePrefix: z.string(),
  type: z.enum(['string', 'double', 'datetime', 'boolean', 'crm_status']),
  isMultiple: z.boolean().default(false),
});

type FieldBuilderProps = {
  crms: CrmEntity[];
}

export function FieldBuilder({ crms }: FieldBuilderProps) {
  const [payload, setPayload] = useState<object[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crmIds: [],
      listLabel: '',
      fieldNamePrefix: '',
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
      setValue('fieldNamePrefix', '');
    }
  }, [watchedListLabel, setValue]);

  const watchedValues = watch();
  useEffect(() => {
    const subscription = watch((value) => {
      const { crmIds = [], ...rest } = value;
      const selectedCrms = crms.filter(c => crmIds.includes(c.id));

      const payloadPreviews = selectedCrms.map(crm => {
        const fieldName = rest.fieldNamePrefix.replace('{ID}', crm.entityTypeId.toString());
        const fieldData = {
          ...rest,
          USER_TYPE_ID: rest.type,
          XML_ID: fieldName,
          EDIT_FORM_LABEL: rest.listLabel,
          LIST_COLUMN_LABEL: rest.listLabel,
          fieldName: fieldName // just for display
        };
        // @ts-ignore
        delete fieldData.type;
        // @ts-ignore
        delete fieldData.crmIds;
        // @ts-ignore
        delete fieldData.fieldNamePrefix;

        return {
          entityTypeId: crm.entityTypeId,
          field: fieldData
        };
      });

      setPayload(payloadPreviews);
    });
    return () => subscription.unsubscribe();
  }, [watch, crms, watchedCrmIds]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Simulando chamada de API para criar campo...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Payloads simulados:", payload);
    toast({
      title: "Campos criados com sucesso! (Simulação)",
      description: `O campo "${values.listLabel}" foi enviado para ${values.crmIds.length} CRMs.`
    })
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
              <div>
                <FormLabel>Pré-visualização do Payload</FormLabel>
                <pre className="mt-2 w-full max-h-60 overflow-y-auto rounded-md bg-secondary p-4 font-code text-sm text-secondary-foreground">
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
