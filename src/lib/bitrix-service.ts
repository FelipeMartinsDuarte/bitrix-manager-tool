
"use client";

import type { BitrixApiConfig, CrmEntity } from './types';

function getBitrixConfig(): BitrixApiConfig | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const configStr = localStorage.getItem('bitrixConfig');
  if (!configStr) {
    console.error("Configurações do Bitrix não encontradas. Por favor, configure-as na página de Configurações.");
    return null;
  }
  return JSON.parse(configStr);
}

async function fetchFromBitrix(method: string, params: Record<string, any> = {}) {
  const config = getBitrixConfig();
  if (!config) {
    throw new Error("Configurações do Bitrix não encontradas.");
  }
  
  const url = `${config.baseUrl}/rest/${config.apiToken}/${method}.json`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Erro na API do Bitrix:", errorData);
    throw new Error(errorData.error_description || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
     throw new Error(`${data.error}: ${data.error_description}`);
  }
  
  return data.result;
}

export const BitrixService = {
  async getSmartProcesses(): Promise<CrmEntity[]> {
    const data = await fetchFromBitrix('crm.type.list');
    return data.types.map((type: any) => ({
      ...type,
      id: type.ID, // Use the real ID from Bitrix
      title: type.NAME, // Use the NAME field for title
      entityTypeId: type.ENTITY_TYPE_ID,
      created: new Date().toISOString(), // Placeholder, as creation date isn't in this endpoint
    }));
  },
};
