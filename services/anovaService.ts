
import toast from 'react-hot-toast';
import { apiRequest } from './api';

export async function getPortfolioAccounts(clientName: string) {
  try {
    return await apiRequest(`/get_carteiras_contas?nome=${encodeURIComponent(clientName)}`);
  } catch (error) {
    console.error('Error fetching portfolio accounts:', error);
    toast.error('Erro ao carregar contas da carteira');
    return null;
  }
}

export async function getConsolidatedPosition(accountNumber: string) {
  try {
    return await apiRequest('/posicao_consolidada', {
      method: 'POST',
      body: JSON.stringify({ numero_conta: accountNumber })
    });
  } catch (error) {
    console.error('Error fetching consolidated position:', error);
    toast.error('Erro ao carregar posição consolidada');
    return null;
  }
}

export async function getOrderStats(email: string) {
  try {
    return await apiRequest(`/boletagem/orders/stats?email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return null;
  }
}

export async function getOrders(email: string) {
  try {
    return await apiRequest(`/boletagem/orders?email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return null;
  }
}
