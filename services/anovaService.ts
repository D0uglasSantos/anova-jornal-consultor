
import toast from 'react-hot-toast';

const API_BASE_URL = 'https://api.anovainvestimentos.com.br/api';
const AUTH_TOKEN = 'dec97f43fdd1eb11b29338d2b68c2d09f9bec4a401b07958b3ff95878e32d540';

export async function getPortfolioAccounts(clientName: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/get_carteiras_contas?nome=${encodeURIComponent(clientName)}`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    if (!response.ok) throw new Error('Falha ao buscar contas');
    return await response.json();
  } catch (error) {
    console.error('Error fetching portfolio accounts:', error);
    toast.error('Erro ao carregar contas da carteira');
    return null;
  }
}

export async function getConsolidatedPosition(accountNumber: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/posicao_consolidada`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ numero_conta: accountNumber })
    });
    if (!response.ok) throw new Error('Falha ao buscar posição consolidada');
    return await response.json();
  } catch (error) {
    console.error('Error fetching consolidated position:', error);
    toast.error('Erro ao carregar posição consolidada');
    return null;
  }
}

export async function getOrderStats(email: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/boletagem/orders/stats?email=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    if (!response.ok) throw new Error('Falha ao buscar estatísticas de ordens');
    return await response.json();
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return null;
  }
}

export async function getOrders(email: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/boletagem/orders?email=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    if (!response.ok) throw new Error('Falha ao buscar ordens');
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return null;
  }
}
