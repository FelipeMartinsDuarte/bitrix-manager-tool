"use client";

import type { BitrixApiConfig, CrmEntity, CrmField } from './types';

function getBitrixConfig(): BitrixApiConfig {
  if (typeof window === 'undefined') {
    return { baseUrl: '', userId: '', apiToken: '' };
  }
  const configStr = localStorage.getItem('bitrixConfig');
  if (!configStr) {
     throw new Error("Configurações do Bitrix não encontradas. Por favor, configure-as na página de Configurações.");
  }
  const config: BitrixApiConfig = JSON.parse(configStr);
   if (!config.baseUrl || !config.userId || !config.apiToken) {
    throw new Error("A URL base, o ID de usuário e o Token da API são obrigatórios. Por favor, configure-os na página de Configurações.");
  }
  return config;
}

async function fetchFromBitrix(method: string, params: Record<string, any> = {}) {
  const config = getBitrixConfig();
  if (!config.baseUrl) {
    throw new Error("Configurações do Bitrix não encontradas.");
  }
  
  // Bitrix aceita com ou sem .json; .json é o formato clássico do webhook
  const url = `${config.baseUrl}/rest/${config.userId}/${config.apiToken}/${method}.json`;

  console.log(`[Bitrix API Call] ➡️ ${method}`, { url, params });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  console.log(`[Bitrix Raw Response] ⬅️ ${method}:`, data);

  if (!response.ok || data.error) {
    const errorDescription = data?.error_description || `HTTP error! status: ${response.status}`;
    console.error("Erro na API do Bitrix:", errorDescription, data);
    throw new Error(errorDescription);
  }
  
  return data;
}

function toLangMap(label: string | Record<string, string>): Record<string, string> {
  if (typeof label === 'string') {
    return { br: label, pt: label, en: label };
  }
  return label;
}

export const BitrixService = {
  async getSmartProcesses(): Promise<CrmEntity[]> {
    const data = await fetchFromBitrix('crm.type.list');

    if (!data.result || !Array.isArray(data.result.types)) {
        console.error("A resposta da API para crm.type.list não contém 'result.types' como um array.");
        return [];
    };
    
    console.log('crm.type.list raw types:', data.result.types);
    
  // id = ordinal do SPA (CRM_{id}); entityTypeId = tipo dinâmico
  const mappedTypes = data.result.types.map((type: any) => ({
    id: type.id.toString(),
    title: type.title,
    entityTypeId: type.entityTypeId,
    created: type.createdTime || new Date().toISOString(), 
  }));
  
  console.log("[Bitrix Service] Mapped CRM Entities:", mappedTypes);
  return mappedTypes;
},

/** entityTypeId do SPA (crm.type.list). Usa crm.item.fields → title + UF_CRM_*. */
async getFieldsForCrm(entityTypeId: string | number): Promise<CrmField[]> {
  const data = await fetchFromBitrix('crm.item.fields', {
    entityTypeId: Number(entityTypeId),
    useOriginalUfNames: 'Y',
  });

  const fieldsMap = data.result?.fields;
  if (!fieldsMap || typeof fieldsMap !== 'object') {
    console.error("A resposta de crm.item.fields não contém result.fields.", data);
    return [];
  }

  const mapped: CrmField[] = [];
  let index = 0;

  for (const [key, meta] of Object.entries(fieldsMap) as [string, any][]) {
    if (!meta || meta.isDynamic !== true) continue;

    const fieldName = String(meta.upperName || key);
    if (!/^UF_/i.test(fieldName)) continue;

    const title = typeof meta.title === 'string' ? meta.title.trim() : '';
    mapped.push({
      id: ++index,
      fieldName,
      listLabel: title || fieldName,
      type: meta.type,
      isMultiple: Boolean(meta.isMultiple),
      isPublic: true,
    });
  }

  return mapped;
},

/** Cria campo via userfieldconfig.add; typeId = types[].id */
async createField(typeId: string | number, field: {
  fieldName: string;
  userTypeId: string;
  multiple: 'Y' | 'N';
  editFormLabel: string | Record<string, string>;
  listColumnLabel?: string | Record<string, string>;
}): Promise<any> {
    const entityId = `CRM_${typeId}`;
    const payload = {
      moduleId: 'crm',
      field: {
        entityId,
        fieldName: field.fieldName,
        userTypeId: field.userTypeId,
        multiple: field.multiple,
        editFormLabel: toLangMap(field.editFormLabel),
        listColumnLabel: toLangMap(field.listColumnLabel ?? field.editFormLabel),
      },
    };
    console.log(`[Bitrix POST Payload] ➡️ userfieldconfig.add for ${entityId}:`, payload);
    const data = await fetchFromBitrix('userfieldconfig.add', payload);
    console.log(`[Bitrix POST Return] ⬅️ userfieldconfig.add for ${entityId}:`, data);
    return data.result;
  }
};
