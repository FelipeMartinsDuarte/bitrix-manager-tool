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

/** Labels da API: string ou mapa ({ br, pt, en, ... }). */
function pickLabel(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim()) return value;
  if (value && typeof value === 'object') {
    const map = value as Record<string, string | null | undefined>;
    for (const key of ['br', 'pt', 'pt_BR', 'ru', 'en', 'de', 'la']) {
      const v = map[key];
      if (typeof v === 'string' && v.trim()) return v;
    }
    const first = Object.values(map).find((v) => typeof v === 'string' && v.trim());
    if (first) return first;
  }
  return fallback;
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

/** typeId = types[].id (CRM_{id}). Busca todas as páginas (Bitrix: 50/página) e devolve numa lista. */
async getFieldsForCrm(typeId: string | number): Promise<CrmField[]> {
  const entityId = `CRM_${typeId}`;
  const allFields: any[] = [];
  let start = 0;

  while (true) {
    const data = await fetchFromBitrix('userfieldconfig.list', {
      moduleId: 'crm',
      // sem language: traz mapa completo de labels (br/pt/en/…)
      select: ['*'],
      filter: { entityId },
      start,
    });

    if (!data.result || !Array.isArray(data.result.fields)) {
      console.error("A resposta da API para userfieldconfig.list não contém 'result.fields' como um array.", data);
      break;
    }

    allFields.push(...data.result.fields);

    // Bitrix às vezes devolve next como string ("50")
    const next = data.next != null && data.next !== '' ? Number(data.next) : NaN;
    if (!Number.isFinite(next) || next <= start) break;
    start = next;
  }

  return allFields
    .filter((f) => f.entityId === entityId)
    .map((field) => ({
      id: Number(field.id),
      fieldName: field.fieldName,
      listLabel: pickLabel(
        field.editFormLabel,
        pickLabel(field.listColumnLabel, pickLabel(field.listFilterLabel, field.fieldName))
      ),
      type: field.userTypeId,
      isMultiple: field.multiple === 'Y',
      isPublic: true,
    }));
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
