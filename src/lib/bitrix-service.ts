
"use client";

import type { BitrixApiConfig, CrmEntity, CrmField } from './types';

function getBitrixConfig(): BitrixApiConfig {
  if (typeof window === 'undefined') {
    // This is a safeguard for SSR, though we expect this to run client-side.
    // An empty config will cause controlled errors downstream.
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
    // If config is empty (e.g. from SSR safeguard), throw error before fetching.
    throw new Error("Configurações do Bitrix não encontradas.");
  }
  
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

export const BitrixService = {
  async getSmartProcesses(): Promise<CrmEntity[]> {
    const data = await fetchFromBitrix('crm.type.list');

    if (!data.result || !Array.isArray(data.result.types)) {
        console.error("A resposta da API para crm.type.list não contém 'result.types' como um array.");
        return [];
    };
    
    const mappedTypes = data.result.types.map((type: any) => ({
      id: `T${type.entityTypeId}_${type.id}`, // Create a more unique ID
      title: type.title,
      entityTypeId: type.entityTypeId,
      created: type.createdTime || new Date().toISOString(), 
    }));

    return mappedTypes;
  },

  async getFieldsForCrm(entityTypeId: number): Promise<CrmField[]> {
    const entityId = `CRM_${entityTypeId}`;
    console.log(`Mandando para a API o entityId: ${entityId}`);
    
    const data = await fetchFromBitrix('userfieldconfig.list', {
      entityId: entityId
    });

     if (!data.result || !Array.isArray(data.result)) {
        console.error("A resposta da API para userfieldconfig.list não contém 'result' como um array.");
        return [];
    };
    
    const mappedFields: CrmField[] = data.result.map((field: any) => ({
      id: field.id,
      fieldName: field.fieldName,
      listLabel: field.listLabel || field.editFormLabel, // Fallback
      type: field.userTypeId,
      isMultiple: field.multiple === 'Y',
      isPublic: true, // Assuming public, API doesn't seem to provide this
    }));

    return mappedFields;
  }
};
