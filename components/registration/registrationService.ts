
import { apiRequest } from '../../services/api';
import { RegistrationFormData, mapCarteira, getGestora } from './types';
import { stripMask } from './FormUI';

// ─── Converter arquivo para base64 ───────────────────────────────────────────
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

// ─── Payload para log (sem base64) ────────────────────────────────────────────
const payloadForLog = <T extends Record<string, unknown>>(
  payload: T,
  base64Fields: (keyof T)[]
): T => {
  const copy = { ...payload };
  base64Fields.forEach(field => {
    if (field in copy && typeof copy[field] === 'string' && (copy[field] as string).startsWith('data:')) {
      (copy as Record<string, unknown>)[field as string] = '[BASE64 omitido]';
    }
  });
  return copy;
};

// ─── Mapeamentos Suitability Wealth (Gestora) ────────────────────────────────
const WEALTH_RENDA: Record<string, string> = {
  '1': 'INCOME_LT_250K', '2': 'INCOME_250_500K', '3': 'INCOME_500_1250K', '4': 'INCOME_GT_1250K',
};
const WEALTH_PATRIMONIO: Record<string, string> = {
  '1': 'NW_LT_500K', '2': 'NW_500_2500K', '3': 'NW_2500_5000K', '4': 'NW_GT_5000K',
};
const WEALTH_EXP: Record<string, string> = {
  '1': 'EXP_NONE', '2': 'EXP_LIMITED', '3': 'EXP_GOOD', '4': 'EXP_EXPERT',
};
const WEALTH_PROD: Record<string, string> = {
  '1': 'PROD_SAV', '2': 'PROD_SAV_FIXED', '3': 'PROD_SAV_FIXED_EQUITY', '4': 'PROD_ALL',
};
const WEALTH_GOAL: Record<string, string> = {
  '1': 'GOAL_PRESERVE', '2': 'GOAL_INCOME', '3': 'GOAL_GROWTH', '4': 'GOAL_SPECULATE',
};
const WEALTH_HZN: Record<string, string> = {
  '1': 'HZN_LT_1Y', '2': 'HZN_1_3Y', '3': 'HZN_4_6Y', '4': 'HZN_GT_6Y',
};
const WEALTH_DD: Record<string, string> = {
  '1': 'DD_SELL_ALL', '2': 'DD_SELL_PART', '3': 'DD_HOLD', '4': 'DD_BUY_MORE',
};
const WEALTH_LT: Record<string, string> = {
  '1': 'LT_0_5', '2': 'LT_5_10', '3': 'LT_10_20', '4': 'LT_GT_20',
};
const WEALTH_LIQ: Record<string, string> = {
  '1': 'LIQ_YES', '2': 'LIQ_NO',
};

const buildSuitabilityAwt = (data: RegistrationFormData) => ({
  AWT_Q1_INCOME: WEALTH_RENDA[data.rendaAnualWealth] || '',
  AWT_Q2_NET_WORTH: WEALTH_PATRIMONIO[data.patrimonioLiquidoWealth] || '',
  AWT_Q3_EXPERIENCE: WEALTH_EXP[data.experienciaInvestimentosWealth] || '',
  AWT_Q4_PRODUCTS: WEALTH_PROD[data.investimentosAnterioresWealth] || '',
  AWT_Q5_GOAL: WEALTH_GOAL[data.objetivoPrincipalWealth] || '',
  AWT_Q6_HORIZON: WEALTH_HZN[data.prazoInvestimentoWealth] || '',
  AWT_Q7_DRAWDOWN_20: WEALTH_DD[data.reacaoQuedaWealth] || '',
  AWT_Q8_LOSS_TOL: WEALTH_LT[data.percentualPerdaWealth] || '',
  AWT_Q9_LIQ_NEED: WEALTH_LIQ[data.necessidadeLiquidezWealth] || '',
});

// ─── Mapeamentos XP Eleva (Consultoria) ──────────────────────────────────────
const XP_PERGUNTAS = [
  {
    pergunta: 'Qual é seu principal objetivo de investimento?',
    key: 'objetivoInvestimentoXP' as keyof RegistrationFormData,
    indexMap: { '1': 3, '2': 1, '3': 2 } as Record<string, number>,
    fieldKey: 'pergunta_1_xp_eleva',
  },
  {
    pergunta: 'Por quanto tempo pretende manter os investimentos sem resgatar?',
    key: 'tempoInvestimentoXP' as keyof RegistrationFormData,
    indexMap: { '1': 3, '2': 2, '3': 1 } as Record<string, number>,
    fieldKey: 'pergunta_2_xp_eleva',
  },
  {
    pergunta: 'Qual é a sua necessidade dos recursos a serem investidos?',
    key: 'necessidadeRecursosXP' as keyof RegistrationFormData,
    indexMap: { '1': 3, '2': 1, '3': 2 } as Record<string, number>,
    fieldKey: 'pergunta_3_xp_eleva',
  },
  {
    pergunta: 'Qual percentual da sua renda mensal será investido?',
    key: 'percentualRendaXP' as keyof RegistrationFormData,
    indexMap: { '1': 1, '2': 3, '3': 2 } as Record<string, number>,
    fieldKey: 'pergunta_4_xp_eleva',
  },
  {
    pergunta: 'Se seu investimento cair 20% em curto prazo, o que faria?',
    key: 'reacaoPerdaXP' as keyof RegistrationFormData,
    indexMap: { '1': 3, '2': 4, '3': 1, '4': 2 } as Record<string, number>,
    fieldKey: 'pergunta_5_xp_eleva',
  },
  {
    pergunta: 'Qual a sua experiência com investimentos?',
    key: 'experienciaInvestimentoXP' as keyof RegistrationFormData,
    indexMap: { '1': 1, '2': 4, '3': 2, '4': 3 } as Record<string, number>,
    fieldKey: 'pergunta_6_xp_eleva',
  },
  {
    pergunta: 'Qual é a sua expectativa de renda futura?',
    key: 'expectativaRendaXP' as keyof RegistrationFormData,
    indexMap: { '1': 3, '2': 2, '3': 1 } as Record<string, number>,
    fieldKey: 'pergunta_7_xp_eleva',
  },
  {
    pergunta: 'Já realizou operações com derivativos?',
    key: 'operacoesDerivativosXP' as keyof RegistrationFormData,
    indexMap: { '1': 1, '2': 2 } as Record<string, number>,
    fieldKey: 'pergunta_8_xp_eleva',
  },
];

const buildXpElevaPerguntas = (data: RegistrationFormData) => {
  const result: Record<string, object> = {};
  XP_PERGUNTAS.forEach(q => {
    const val = data[q.key] as string;
    if (val) {
      result[q.fieldKey] = {
        resposta: parseInt(val),
        index_id: q.indexMap[val] || parseInt(val),
        pergunta: q.pergunta,
      };
    }
  });
  return result;
};

// ─── Validar conta existente ─────────────────────────────────────────────────
export const validarContaExistente = async (
  conta: string,
  cpfCnpj: string
): Promise<{ status: string; pode_atualizar?: boolean; mensagem?: string; id_cliente?: number }> => {
  return apiRequest('/link-hub/validar-conta-documento', {
    method: 'POST',
    body: JSON.stringify({
      conta,
      cpf_cnpj: stripMask(cpfCnpj),
    }),
  });
};

// ─── Enviar dados de abertura de conta ───────────────────────────────────────
export const enviarDadosAberturaContaService = async (idCliente: number) => {
  return apiRequest(`/clientes/${idCliente}/enviar_dados_abertura_conta`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
};

// ─── Cadastrar CPF ────────────────────────────────────────────────────────────
export const registerClienteCpf = async (data: RegistrationFormData): Promise<{ id_cliente: number }> => {
  const isGestora = data.modeloAtendimento === '1';
  const isCasado = data.estadoCivil === 'Casado(a)';
  const shouldSendCnpjEmpresa =
    ['CLT', 'Autônomo'].includes(data.categoriaProfissional) && data.checkDeclaracaoSocioProprietario;
  const suitability = isGestora
    ? { suitability_awt: buildSuitabilityAwt(data) }
    : buildXpElevaPerguntas(data);

  const docIdBase64 = data.documentoIdentificacao ? await toBase64(data.documentoIdentificacao) : '';
  const comprovante = data.comprovanteResidencia ? await toBase64(data.comprovanteResidencia) : '';

  const payload = {
    nome_completo: data.nomeCompleto,
    cpf: stripMask(data.cpf),
    data_nascimento: data.dataNascimento,
    rg: data.rg,
    orgao_emissor: data.orgaoEmissor,
    data_expedicao: data.dataExpedicao,
    nacionalidade: data.nacionalidade,
    naturalidade: data.naturalidade,
    sexo: data.sexo,
    escolaridade: data.escolaridade,
    estado_civil: data.estadoCivil,
    nome_conjuge: isCasado ? (data.nomeConjuge || undefined) : null,
    cpf_conjuge: isCasado ? (data.cpfConjuge ? stripMask(data.cpfConjuge) : undefined) : null,
    nome_pai: data.nomePai,
    nome_mae: data.nomeMae,
    cep: stripMask(data.cep),
    endereco: data.endereco,
    numero_endereco: data.numero ? parseInt(data.numero) : undefined,
    complemento_endereco: data.complemento || undefined,
    bairro_endereco: data.bairro,
    cidade_endereco: data.cidade,
    estado_endereco: data.estado,
    pais_endereco: data.pais,
    telefone_residencial: data.telefone ? stripMask(data.telefone) : undefined,
    celular: stripMask(data.celular),
    email: data.email,
    confirme_email: data.confirmaEmail,
    categoria_profissional: data.categoriaProfissional,
    ocupacao_profissional: data.ocupacaoProfissional || undefined,
    check_declaracao_socio_proprietario: data.checkDeclaracaoSocioProprietario,
    cnpj_empresa_ocupacao: shouldSendCnpjEmpresa
      ? (data.cnpjEmpresaOcupacao ? stripMask(data.cnpjEmpresaOcupacao) : undefined)
      : null,
    classificacao_investidor: data.classificacaoInvestidor,
    patrimonio_liquido: parseFloat(data.patrimonioLiquido) || 0,
    rendimento_mensal: parseFloat(data.rendimentoMensal) || 0,
    porcentagem_mensal_investir: parseFloat(data.porcentagemMensalInvestir) || 0,
    patrimonio_liquido_investimentos: parseFloat(data.patrimonioLiquidoInvestimentos) || 0,
    origem_patrimonio: data.origemPatrimonio,
    check_pessoa_publicamente_exposta: data.checkPessoaPublicamenteExposta,
    empresa_ppe: data.empresaPpe || undefined,
    cargo_ppe: data.cargoPpe || undefined,
    data_inicio_ppe: data.dataInicioPpe || null,
    data_fim_ppe: data.dataFimPpe || null,
    corretora: data.escolhaCorretora,
    gestora: getGestora(data.escolhaCorretora),
    perfil_investidor: data.perfilDeInvestidor,
    conta: data.situacaoContaCorretora === 'tenho' ? data.codigoConta : '',
    data_registro: data.dataRegistro,
    upload_cnh_rg: docIdBase64,
    upload_comprovante_residencia: comprovante,
    hub_credenciado: data.hubCredenciada,
    id_hub: parseInt(data.hubCredenciadaId),
    id_vinculacao_assessor: parseInt(data.assessorId),
    ciencia_armazenamento_dados: data.aceiteArmazenamentoDados,
    ciencia_envio_correto_documentos: data.cienteEnvioDocumentos,
    ciencia_riscos_operacao: data.cienteRiscosOperacao,
    ciencia_politicas_administracao: data.cientePoliticasAdministracao,
    ciencia_perfil_risco_investidor: data.cientePerfilRisco,
    modelo_atendimento: parseInt(data.modeloAtendimento),
    taxa_gestao: parseFloat(data.taxaGestao),
    taxa_performance: data.taxaPerformance ? parseFloat(data.taxaPerformance) : undefined,
    indice_performance: data.indicePerformance || undefined,
    carteira: mapCarteira(data.carteira),
    ...suitability,
  };

  console.log('Payload cadastro CPF (documentos omitidos):', payloadForLog(payload, ['upload_cnh_rg', 'upload_comprovante_residencia']));

  return apiRequest('/link-hub/cadastro-cliente', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// ─── Cadastrar CNPJ ───────────────────────────────────────────────────────────
export const registerClienteCnpj = async (data: RegistrationFormData): Promise<{ id_cliente: number }> => {
  const isGestora = data.modeloAtendimento === '1';
  const socioResidenciaFiscalExterior = data.socioResidenciaFiscalExterior === 'sim';
  const experienciaPreviaInvestimentos = data.experienciaPreviaInvestimentos === 'sim';
  const suitability = isGestora
    ? { suitability_awt: buildSuitabilityAwt(data) }
    : buildXpElevaPerguntas(data);

  const contratoBase64 = data.copiaContratoSocial ? await toBase64(data.copiaContratoSocial) : '';
  const cartaoBase64 = data.cartaoCnpj ? await toBase64(data.cartaoCnpj) : '';
  const rgBase64 = data.rgSocio ? await toBase64(data.rgSocio) : '';
  const procBase64 = data.procuracao ? await toBase64(data.procuracao) : undefined;

  const rep = data.representantes[0];
  const additionalReps = data.representantes.slice(1).reduce((acc, r, i) => ({
    ...acc,
    [`representante_legal_cpf_${i + 1}`]: stripMask(r.cpf),
    [`representante_legal_nome_${i + 1}`]: r.nome,
    [`representante_legal_email_${i + 1}`]: r.email,
    [`representante_legal_telefone_${i + 1}`]: stripMask(r.telefone),
    [`representante_tipo_vinculo_${i + 1}`]: r.tipoVinculo,
  }), {});

  const payload = {
    razao_social: data.razaoSocial,
    nome_fantasia: data.nomeFantasia || undefined,
    cnpj: stripMask(data.cnpj),
    data_constituicao: data.dataConstituicao,
    atividade_economica_cnae: data.atividadeEconomica,
    estrutura_legal: data.estruturaLegal,
    cep: stripMask(data.cep),
    endereco: data.endereco,
    numero_endereco: data.numero ? parseInt(data.numero) : undefined,
    complemento_endereco: data.complemento || undefined,
    bairro_endereco: data.bairro,
    cidade_endereco: data.cidade,
    estado_endereco: data.estado,
    pais_endereco: data.pais,
    celular: stripMask(data.celular),
    email: data.email,
    confirme_email: data.confirmaEmail,
    site_empresa: null,
    corretora: data.escolhaCorretora,
    conta: data.situacaoContaCorretora === 'tenho' ? data.codigoConta : '',
    data_registro: data.dataRegistro,
    hub_credenciado: data.hubCredenciada,
    id_hub: parseInt(data.hubCredenciadaId),
    id_vinculacao_assessor: parseInt(data.assessorId),
    gestora: getGestora(data.escolhaCorretora),
    perfil_investidor: data.perfilDeInvestidor,
    patrimonio_liquido: parseFloat(data.faturamentoMedioMensal || '0'),
    rendimento_mensal: parseFloat(data.faturamentoMedioMensal || '0'),
    porcentagem_mensal_investir: 0,
    patrimonio_liquido_investimentos: parseFloat(data.patrimonioAtivosTotais || '0'),
    origem_patrimonio: data.origemRecursosAplicados,
    representante_legal_cpf: stripMask(rep?.cpf || ''),
    representante_legal_nome: rep?.nome || '',
    representante_legal_email: rep?.email || '',
    representante_legal_telefone: stripMask(rep?.telefone || ''),
    representante_tipo_vinculo: rep?.tipoVinculo || '',
    ...additionalReps,
    perfil_acesso_btg: '',
    data_referencia_faturamento: data.dataReferenciaFaturamento || undefined,
    representante_residencia_fiscal_exterior: socioResidenciaFiscalExterior,
    objetivo_investimentos: data.objetivoInvestimentos,
    prazo_investimento: data.prazoInvestimento,
    tolerancia_risco: data.toleranciaRisco,
    exp_previa_investimentos: experienciaPreviaInvestimentos,
    copia_simples_contrato_social: contratoBase64,
    cartao_cnpj: cartaoBase64,
    rg_socio: rgBase64,
    upload_procuracao: procBase64,
    ciencia_armazenamento_dados: data.aceiteArmazenamentoDados,
    ciencia_envio_correto_documentos: data.cienteEnvioDocumentos,
    ciencia_riscos_operacao: data.cienteRiscosOperacao,
    ciencia_politicas_administracao: data.cientePoliticasAdministracao,
    ciencia_perfil_risco_investidor: data.cientePerfilRisco,
    ciencia_combate_terrorismo: data.cienciaCombateTerrorismo,
    modelo_atendimento: parseInt(data.modeloAtendimento),
    taxa_gestao: parseFloat(data.taxaGestao),
    taxa_performance: data.taxaPerformance ? parseFloat(data.taxaPerformance) : undefined,
    indice_performance: data.indicePerformance || undefined,
    carteira: mapCarteira(data.carteira),
    ...suitability,
  };

  console.log('Payload cadastro CNPJ (documentos omitidos):', payloadForLog(payload, ['copia_simples_contrato_social', 'cartao_cnpj', 'rg_socio', 'upload_procuracao']));

  return apiRequest('/link-hub/cadastro-cliente-cnpj', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
