
"use client";

import type { BitrixApiConfig, CrmEntity } from './types';

function getBitrixConfig(): BitrixApiConfig {
  if (typeof window === 'undefined') {
    // Return a dummy config on the server to avoid errors during SSR
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
  // Don't try to fetch on the server if config is dummy
  if (typeof window === 'undefined' && !config.baseUrl) {
    return { result: [] }; // or some other sensible default for SSR
  }
  
  const url = `${config.baseUrl}/rest/${config.userId}/${config.apiToken}/${method}.json`;

  console.groupCollapsed(`[Bitrix API Call] ➡️ ${method}`);
  console.log('URL:', url);
  console.log('Params:', params);
  console.groupEnd();
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(`Erro de rede ou resposta inválida da API. Status: ${response.status}`);
    }
    console.error("Erro na API do Bitrix:", errorData);
    throw new Error(errorData?.error_description || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
     throw new Error(`[${data.error}] ${data.error_description}`);
  }
  
  return data.result;
}

export const BitrixService = {
  async getSmartProcesses(): Promise<CrmEntity[]> {
    const data = await fetchFromBitrix('crm.type.list');
    if (!data.types) return [];
    
    // Map the API response (e.g., 'ID', 'NAME') to our CrmEntity type ('id', 'title')
    return data.types.map((type: any) => ({
      id: type.ID,
      title: type.NAME,
      entityTypeId: type.ENTITY_TYPE_ID,
      created: new Date().toISOString(), // Placeholder, as API doesn't provide this
    }));
  },
};
