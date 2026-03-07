
export type DocumentType = 'CPF' | 'CNPJ';

export interface Representative {
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  tipoVinculo: string;
}

export interface RegistrationFormData {
  // ─── Tipo de cadastro ───────────────────────────────────────────
  documentType: DocumentType;

  // ─── Step 1 – Dados do contrato (comuns) ────────────────────────
  modeloAtendimento: string; // '1' = Gestora, '2' = Consultoria
  taxaGestao: string;
  taxaPerformance: string;
  indicePerformance: string;
  carteira: string;
  situacaoContaCorretora: 'vou_abrir' | 'tenho';
  escolhaCorretora: string;
  codigoConta: string;
  dataRegistro: string;
  hubCredenciada: string;
  hubCredenciadaId: string;
  assessor: string;
  assessorId: string;

  // ─── Step 1 – Dados Pessoais CPF ────────────────────────────────
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  rg: string;
  orgaoEmissor: string;
  dataExpedicao: string;
  nacionalidade: string;
  naturalidade: string;
  sexo: string;
  escolaridade: string;
  estadoCivil: string;
  nomeConjuge: string;
  cpfConjuge: string;
  nomePai: string;
  nomeMae: string;

  // ─── Step 1 – Dados Pessoais CNPJ ───────────────────────────────
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  dataConstituicao: string;
  atividadeEconomica: string;
  estruturaLegal: string;

  // ─── Step 2 – Endereço e Contato ────────────────────────────────
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  telefone: string;
  celular: string;
  email: string;
  confirmaEmail: string;

  // ─── Step 3 – Profissional e Financeiro (CPF) ───────────────────
  categoriaProfissional: string;
  ocupacaoProfissional: string;
  empresaOcupacao: string;
  tempoOcupacao: string;
  checkDeclaracaoSocioProprietario: boolean;
  cnpjEmpresaOcupacao: string;
  classificacaoInvestidor: string;
  patrimonioLiquido: string;
  rendimentoMensal: string;
  patrimonioLiquidoInvestimentos: string;
  origemPatrimonio: string;
  porcentagemMensalInvestir: string;
  checkPessoaPublicamenteExposta: boolean;
  empresaPpe: string;
  cargoPpe: string;
  dataInicioPpe: string;
  dataFimPpe: string;

  // ─── Step 4 – Perfil de Investidor ──────────────────────────────
  // XP Eleva (Consultoria)
  objetivoInvestimentoXP: string;
  tempoInvestimentoXP: string;
  necessidadeRecursosXP: string;
  percentualRendaXP: string;
  reacaoPerdaXP: string;
  experienciaInvestimentoXP: string;
  expectativaRendaXP: string;
  operacoesDerivativosXP: string;

  // Wealth (Gestora)
  rendaAnualWealth: string;
  patrimonioLiquidoWealth: string;
  experienciaInvestimentosWealth: string;
  investimentosAnterioresWealth: string;
  objetivoPrincipalWealth: string;
  prazoInvestimentoWealth: string;
  reacaoQuedaWealth: string;
  percentualPerdaWealth: string;
  necessidadeLiquidezWealth: string;

  perfilDeInvestidor: string;

  // ─── Step 5 (CPF) – Documentos ──────────────────────────────────
  comprovanteResidencia: File | null;
  documentoIdentificacao: File | null;
  aceiteArmazenamentoDados: boolean;
  cienteEnvioDocumentos: boolean;
  cienteRiscosOperacao: boolean;
  cientePoliticasAdministracao: boolean;
  cientePerfilRisco: boolean;
  autodeclaroArrojado: boolean;

  // ─── CNPJ Steps ─────────────────────────────────────────────────
  // Representante Legal
  representantes: Representative[];

  // Dados Complementares
  faturamentoMedioMensal: string;
  dataReferenciaFaturamento: string;
  patrimonioAtivosTotais: string;
  origemRecursosAplicados: string;
  socioResidenciaFiscalExterior: string;
  objetivoInvestimentos: string;
  prazoInvestimento: string;
  toleranciaRisco: string;
  experienciaPreviaInvestimentos: string;

  // Documentos CNPJ
  copiaContratoSocial: File | null;
  cartaoCnpj: File | null;
  rgSocio: File | null;
  procuracao: File | null;
  cienciaCombateTerrorismo: boolean;
}

export const initialFormData: RegistrationFormData = {
  documentType: 'CPF',
  modeloAtendimento: '',
  taxaGestao: '',
  taxaPerformance: '',
  indicePerformance: '',
  carteira: '',
  situacaoContaCorretora: 'vou_abrir',
  escolhaCorretora: '',
  codigoConta: '',
  dataRegistro: new Date().toISOString().split('T')[0],
  hubCredenciada: '',
  hubCredenciadaId: '',
  assessor: '',
  assessorId: '',
  nomeCompleto: '',
  cpf: '',
  dataNascimento: '',
  rg: '',
  orgaoEmissor: '',
  dataExpedicao: '',
  nacionalidade: 'Brasileira',
  naturalidade: '',
  sexo: '',
  escolaridade: '',
  estadoCivil: '',
  nomeConjuge: '',
  cpfConjuge: '',
  nomePai: '',
  nomeMae: '',
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  dataConstituicao: '',
  atividadeEconomica: '',
  estruturaLegal: '',
  cep: '',
  endereco: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  pais: 'Brasil',
  telefone: '',
  celular: '',
  email: '',
  confirmaEmail: '',
  categoriaProfissional: '',
  ocupacaoProfissional: '',
  empresaOcupacao: '',
  tempoOcupacao: '',
  checkDeclaracaoSocioProprietario: false,
  cnpjEmpresaOcupacao: '',
  classificacaoInvestidor: '',
  patrimonioLiquido: '',
  rendimentoMensal: '',
  patrimonioLiquidoInvestimentos: '',
  origemPatrimonio: '',
  porcentagemMensalInvestir: '',
  checkPessoaPublicamenteExposta: false,
  empresaPpe: '',
  cargoPpe: '',
  dataInicioPpe: '',
  dataFimPpe: '',
  objetivoInvestimentoXP: '',
  tempoInvestimentoXP: '',
  necessidadeRecursosXP: '',
  percentualRendaXP: '',
  reacaoPerdaXP: '',
  experienciaInvestimentoXP: '',
  expectativaRendaXP: '',
  operacoesDerivativosXP: '',
  rendaAnualWealth: '',
  patrimonioLiquidoWealth: '',
  experienciaInvestimentosWealth: '',
  investimentosAnterioresWealth: '',
  objetivoPrincipalWealth: '',
  prazoInvestimentoWealth: '',
  reacaoQuedaWealth: '',
  percentualPerdaWealth: '',
  necessidadeLiquidezWealth: '',
  perfilDeInvestidor: '',
  comprovanteResidencia: null,
  documentoIdentificacao: null,
  aceiteArmazenamentoDados: false,
  cienteEnvioDocumentos: false,
  cienteRiscosOperacao: false,
  cientePoliticasAdministracao: false,
  cientePerfilRisco: false,
  autodeclaroArrojado: false,
  representantes: [{ cpf: '', nome: '', email: '', telefone: '', tipoVinculo: '' }],
  faturamentoMedioMensal: '',
  dataReferenciaFaturamento: '',
  patrimonioAtivosTotais: '',
  origemRecursosAplicados: '',
  socioResidenciaFiscalExterior: '',
  objetivoInvestimentos: '',
  prazoInvestimento: '',
  toleranciaRisco: '',
  experienciaPreviaInvestimentos: '',
  copiaContratoSocial: null,
  cartaoCnpj: null,
  rgSocio: null,
  procuracao: null,
  cienciaCombateTerrorismo: false,
};

// Opções de corretoras por modelo
export const CORRETORAS_GESTORA = ['XP', 'BTG', 'Avenue', 'BTG Global', 'XP Internacional', 'Safra'];
export const CORRETORAS_CONSULTORIA = ['XP', 'BTG', 'Avenue'];

// Opções de carteira por corretora
export const getCarteiraOptions = (corretora: string): string[] => {
  if (['Avenue', 'BTG Global', 'XP Internacional'].includes(corretora)) {
    return ['ANR Prev Pro USA'];
  }
  return ['ANR Strategy', 'ANR Start', 'Carteira Personalizada'];
};

// Mapeamento de corretora para gestora
export const getGestora = (corretora: string): number => {
  if (['XP', 'XP Internacional'].includes(corretora)) return 3; // Eleva
  if (['BTG', 'BTG Global'].includes(corretora)) return 1; // Rocha
  return 1;
};

// Mapeamento carteira para API
export const mapCarteira = (carteira: string): string => {
  const map: Record<string, string> = {
    'ANR Strategy': 'Strategy',
    'ANR Start': 'Start',
    'ANR Prev Pro USA': 'Prev Pro USA',
    'Carteira Personalizada': 'Carteira Personalizada',
  };
  return map[carteira] || carteira;
};

export const INDICES_PERFORMANCE = ['IBOV', 'CDI', 'CDI-103%', 'S&P'];

export const SEXO_OPTIONS = ['Masculino', 'Feminino', 'Outro'];
export const ESCOLARIDADE_OPTIONS = [
  'Ensino Fundamental',
  'Ensino Médio',
  'Graduação',
  'Pós-Graduação',
  'Mestrado',
  'Doutorado',
];
export const ESTADO_CIVIL_OPTIONS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'];
export const NACIONALIDADE_OPTIONS = ['Brasileira', 'Estrangeira'];
export const PAISES_COMUNS = [
  'Brasil', 'Estados Unidos', 'Portugal', 'Espanha', 'Argentina', 'Chile', 
  'Uruguai', 'Paraguai', 'Alemanha', 'França', 'Itália', 'Inglaterra', 'China', 'Japão', 'Outro'
];
export const ESTADOS_BR = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
];
export const CATEGORIA_PROFISSIONAL_OPTIONS = [
  'CLT',
  'Autônomo',
  'Desempregado',
  'Aposentado',
];
export const CLASSIFICACAO_INVESTIDOR_OPTIONS: { value: string; label: string }[] = [
  { value: 'Qualificado', label: 'Qualificado' },
  { value: 'Profissional', label: 'Profissional' },
  { value: 'Varejo', label: 'Senão souber, marcar este' },
];
export const ESTRUTURA_LEGAL_OPTIONS = [
  'LTDA',
  'S.A.',
  'MEI',
  'EIRELI',
  'S.S.',
  'Outro',
];
export const TIPO_VINCULO_OPTIONS = [
  'Sócio',
  'Administrador',
  'Procurador',
  'Representante Legal',
];
export const OBJETIVO_INVESTIMENTOS_OPTIONS = [
  'Preservação de capital',
  'Renda',
  'Crescimento',
  'Especulação',
];
export const PRAZO_INVESTIMENTO_OPTIONS = [
  'Até 1 ano',
  'De 1 a 3 anos',
  'De 3 a 5 anos',
  'Acima de 5 anos',
];
export const TOLERANCIA_RISCO_OPTIONS = ['Baixa', 'Média', 'Alta'];
export const EXPERIENCIA_INVESTIMENTOS_OPTIONS = [
  'Nenhuma',
  'Básica',
  'Intermediária',
  'Avançada',
];
