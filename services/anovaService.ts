
import toast from 'react-hot-toast';
import { apiRequest, apiFormRequest } from './api';

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

export async function getOrdersByClient(clienteId: number) {
  try {
    return await apiRequest('/boletagem/orders/by-cliente', {
      method: 'POST',
      body: JSON.stringify({ cliente_id: clienteId }),
    });
  } catch (error) {
    console.error('Error fetching orders by client:', error);
    return null;
  }
}

export async function getOrderById(ticketId: number, email: string) {
  try {
    return await apiRequest(
      `/boletagem/orders/${ticketId}?email=${encodeURIComponent(email)}`,
    );
  } catch (error) {
    console.error('Error fetching order by id:', error);
    return null;
  }
}

export async function updateOrderStatus(
  ticketId: number,
  email: string,
  body: {
    novo_status: string;
    justificativa: string;
    comprovante_execucao?: File | null;
    tipo?: string;
  },
) {
  try {
    const formData = new FormData();
    formData.append('novo_status', String(body.novo_status));
    formData.append('justificativa', String(body.justificativa));
    formData.append('tipo', body.tipo || 'texto');
    if (body.comprovante_execucao) {
      formData.append('comprovante_execucao', body.comprovante_execucao);
    }

    return await apiFormRequest(
      `/boletagem/orders/${ticketId}/status?email=${encodeURIComponent(email)}`,
      formData,
      { method: 'PUT' },
    );
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function getClientBoletaDetails(nome: string) {
  try {
    return await apiRequest(
      `/boletagem/clientes/detalhes?nome=${encodeURIComponent(nome)}`,
    );
  } catch (error) {
    console.error('Error fetching client boleta details:', error);
    return null;
  }
}

export async function getFixedIncomeOptions(tipo?: string) {
  try {
    const url = tipo
      ? `/boletagem/opcoes-renda-fixa?tipo=${encodeURIComponent(tipo)}`
      : '/boletagem/opcoes-renda-fixa';
    return await apiRequest(url);
  } catch (error) {
    console.error('Error fetching fixed income options:', error);
    return null;
  }
}

export async function createOrder(
  email: string,
  body: {
    conta_cliente: string;
    produto: string;
    ordem_tipo?: string | null;
    primeira_mensagem: string;
    saldo_abertura?: number | null;
    arquivo?: File | null;
  },
) {
  try {
    const formData = new FormData();
    formData.append('conta_cliente', String(body.conta_cliente));
    formData.append('produto', String(body.produto));
    formData.append('primeira_mensagem', String(body.primeira_mensagem));
    if (body.ordem_tipo != null && body.ordem_tipo !== '') {
      formData.append('ordem_tipo', String(body.ordem_tipo));
    }
    if (body.saldo_abertura != null) {
      formData.append('saldo_abertura', String(body.saldo_abertura));
    }
    if (body.arquivo) {
      formData.append('arquivo', body.arquivo);
    }

    return await apiFormRequest(
      `/boletagem/orders?email=${encodeURIComponent(email)}`,
      formData,
    );
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}
