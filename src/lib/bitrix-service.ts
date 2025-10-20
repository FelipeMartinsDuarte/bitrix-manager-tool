
"use client";

import type { BitrixApiConfig, CrmEntity } from './types';

function getBitrixConfig(): BitrixApiConfig | null {
  if (typeof window === 'undefined') {
    return null;
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
  if (!config) {
    // This can happen during server-side rendering, return an empty structure
    return { result: { types: [] } };
  }
  
  const url = `${config.baseUrl}/rest/${config.userId}/${config.apiToken}/${method}.json`;

  console.log(`[Bitrix API Call] ➡️ ${method}`);
  console.log('URL:', url);
  console.log('Params:', params);
  
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
  
  return data;
}

export const BitrixService = {
  async getSmartProcesses(): Promise<CrmEntity[]> {
    const data = await fetchFromBitrix('crm.type.list');
    
    // Log the raw Bitrix return
    console.log('Raw Bitrix response for crm.type.list:', data);

    if (!data.result || !data.result.types) {
        console.error("A resposta da API não contém 'result.types'.");
        return [];
    };
    
    const mappedTypes = data.result.types.map((type: any) => ({
      id: `${type.entityTypeId}-${type.id}`, 
      title: type.name,
      entityTypeId: type.entityTypeId,
      created: new Date().toISOString(), 
    }));
    
    return [];
  },
};
