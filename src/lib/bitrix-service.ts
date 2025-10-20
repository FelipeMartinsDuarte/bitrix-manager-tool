
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
  
  const url = `${config.baseUrl}/rest/${config.userId}/${config.apiToken}/${method}`;

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

export const BitrixService = {
  async getSmartProcesses(): Promise<CrmEntity[]> {
    const data = await fetchFromBitrix('crm.type.list');

    if (!data.result || !Array.isArray(data.result.types)) {
        console.error("A resposta da API para crm.type.list não contém 'result.types' como um array.");
        return [];
    };
    
    console.log('crm.type.list raw types:', data.result.types);
    
    const mappedTypes = data.result.types.map((type: any) => ({
      id: type.id.toString(),
      title: type.title,
      entityTypeId: type.entityTypeId,
      created: type.createdTime || new Date().toISOString(), 
    }));
    
    console.log("[Bitrix Service] Mapped CRM Entities:", mappedTypes);
    return mappedTypes;
  },

  async getFieldsForCrm(entityTypeId: number): Promise<CrmField[]> {
    const data = await fetchFromBitrix('userfieldconfig.list', {
      moduleId: 'crm', 
      entityId: `CRM_${entityTypeId}`
    });

    if (!data.result || !Array.isArray(data.result.fields)) {
       console.error("A resposta da API para userfieldconfig.list não contém 'result.fields' como um array.", data);
       return [];
    }
    
    const resultList = data.result.fields || [];
    
    const mappedFields: CrmField[] = resultList.map((field: any) => ({
      id: field.id,
      fieldName: field.fieldName,
      listLabel: field.listLabel || field.editFormLabel || field.fieldName,
      type: field.userTypeId,
      isMultiple: field.multiple === 'Y',
      isPublic: true, 
    }));

    return mappedFields;
  },
  
  async createField(entityTypeId: number, field: any): Promise<any> {
     const payload = {
      entityId: `CRM_${entityTypeId}`, 
      field: field,
    };
    console.log(`[Bitrix POST Payload] ➡️ crm.userfield.add for entityTypeId ${entityTypeId}:`, payload);
    const data = await fetchFromBitrix('crm.userfield.add', payload);
    console.log(`[Bitrix POST Return] ⬅️ crm.userfield.add for entityTypeId ${entityTypeId}:`, data);
    return data.result;
  }
};
