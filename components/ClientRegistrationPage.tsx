
import React, { useState, useCallback } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft, Check, Loader2, AlertTriangle, CheckCircle2, X, User, Building2, FileText, Sparkles, Shield } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { RegistrationFormData, initialFormData } from './registration/types';
import { stripMask, validateCpf, validateCnpj } from './registration/FormUI';
import Step1DadosPessoais from './registration/Step1DadosPessoais';
import Step2Endereco from './registration/Step2Endereco';
import Step3Profissional from './registration/Step3Profissional';
import Step4PerfilInvestidor from './registration/Step4PerfilInvestidor';
import Step5Documentos from './registration/Step5Documentos';
import StepCNPJ_Representante from './registration/StepCNPJ_Representante';
import StepCNPJ_Complementar from './registration/StepCNPJ_Complementar';
import StepCNPJ_Documentos from './registration/StepCNPJ_Documentos';
import {
  registerClienteCpf,
  registerClienteCnpj,
  validarContaExistente,
  enviarDadosAberturaContaService,
} from './registration/registrationService';
import { ApiError } from '../services/api';

interface Props {
  userData: any;
  onBack: () => void;
  onSuccess: () => void;
}

// ─── Configuração dos steps ───────────────────────────────────────────────────
const CPF_STEPS = [
  { id: 1, label: 'Dados Pessoais' },
  { id: 2, label: 'Endereço e Contato' },
  { id: 3, label: 'Profissional e Financeiro' },
  { id: 4, label: 'Perfil de Investidor' },
  { id: 5, label: 'Documentos' },
];

const CNPJ_STEPS = [
  { id: 1, label: 'Dados da Empresa' },
  { id: 2, label: 'Endereço e Contato' },
  { id: 3, label: 'Perfil de Investidor' },
  { id: 4, label: 'Representante Legal' },
  { id: 5, label: 'Dados Complementares' },
  { id: 6, label: 'Documentos' },
];

// ─── Validações por step ──────────────────────────────────────────────────────
const validateStep = (
  step: number,
  data: RegistrationFormData
): Record<string, string> => {
  const errs: Record<string, string> = {};
  const isCpf = data.documentType === 'CPF';

  if (step === 1) {
    if (!data.modeloAtendimento) errs.modeloAtendimento = 'Escolha o modelo de atendimento';
    if (!data.taxaGestao) errs.taxaGestao = 'Informe a taxa de gestão';
    if (parseFloat(data.taxaGestao) < 0.2) errs.taxaGestao = 'Taxa mínima é 0,2%';
    if (!data.escolhaCorretora) errs.escolhaCorretora = 'Selecione a corretora';
    if (!data.carteira) errs.carteira = 'Selecione a carteira';
    if (!data.hubCredenciadaId) errs.hubCredenciadaId = 'Hub não identificada. Faça logout e login novamente.';
    if (!data.assessorId) errs.assessorId = 'Assessor não identificado. Faça logout e login novamente.';

    if (isCpf) {
      if (!data.nomeCompleto) errs.nomeCompleto = 'Nome é obrigatório';
      if (!data.cpf) errs.cpf = 'CPF é obrigatório';
      else if (!validateCpf(data.cpf)) errs.cpf = 'CPF inválido';
      if (!data.dataNascimento) errs.dataNascimento = 'Data de nascimento é obrigatória';
      else if (new Date(data.dataNascimento) > new Date()) errs.dataNascimento = 'Data não pode ser futura';
      if (!data.rg) errs.rg = 'RG é obrigatório';
      if (!data.orgaoEmissor) errs.orgaoEmissor = 'Órgão emissor é obrigatório';
      if (!data.dataExpedicao) errs.dataExpedicao = 'Data de expedição é obrigatória';
      else if (new Date(data.dataExpedicao) > new Date()) errs.dataExpedicao = 'Data não pode ser futura';
      if (!data.sexo) errs.sexo = 'Sexo é obrigatório';
      if (!data.nacionalidade) errs.nacionalidade = 'Nacionalidade é obrigatória';
      if (!data.naturalidade) errs.naturalidade = 'Naturalidade é obrigatória';
      if (!data.escolaridade) errs.escolaridade = 'Escolaridade é obrigatória';
      if (!data.estadoCivil) errs.estadoCivil = 'Estado civil é obrigatório';
      if (!data.nomePai) errs.nomePai = 'Nome do pai é obrigatório';
      if (!data.nomeMae) errs.nomeMae = 'Nome da mãe é obrigatório';
      if (data.estadoCivil === 'Casado(a)') {
        if (!data.nomeConjuge) errs.nomeConjuge = 'Nome do cônjuge é obrigatório';
        if (!data.cpfConjuge) errs.cpfConjuge = 'CPF do cônjuge é obrigatório';
        else if (!validateCpf(data.cpfConjuge)) errs.cpfConjuge = 'CPF inválido';
      }
    } else {
      if (!data.razaoSocial) errs.razaoSocial = 'Razão social é obrigatória';
      if (!data.cnpj) errs.cnpj = 'CNPJ é obrigatório';
      else if (!validateCnpj(data.cnpj)) errs.cnpj = 'CNPJ inválido';
      if (!data.dataConstituicao) errs.dataConstituicao = 'Data de constituição é obrigatória';
      if (!data.atividadeEconomica) errs.atividadeEconomica = 'CNAE é obrigatório';
      if (!data.estruturaLegal) errs.estruturaLegal = 'Estrutura legal é obrigatória';
    }
  }

  if (step === 2) {
    if (!data.cep || stripMask(data.cep).length !== 8) errs.cep = 'CEP inválido';
    if (!data.endereco) errs.endereco = 'Endereço é obrigatório';
    if (!data.bairro) errs.bairro = 'Bairro é obrigatório';
    if (!data.cidade) errs.cidade = 'Cidade é obrigatória';
    if (!data.estado) errs.estado = 'Estado é obrigatório';
    if (!data.pais) errs.pais = 'País é obrigatório';
    if (!data.celular || stripMask(data.celular).length < 10) errs.celular = 'Celular inválido';
    if (!data.email || !data.email.includes('@')) errs.email = 'E-mail inválido';
    if (!data.confirmaEmail) errs.confirmaEmail = 'Confirme o e-mail';
    else if (data.email !== data.confirmaEmail) errs.confirmaEmail = 'E-mails não coincidem';
  }

  if (step === 3 && isCpf) {
    if (!data.categoriaProfissional) errs.categoriaProfissional = 'Categoria profissional é obrigatória';
    if (!data.classificacaoInvestidor) errs.classificacaoInvestidor = 'Classificação é obrigatória';
    if (!data.patrimonioLiquido) errs.patrimonioLiquido = 'Patrimônio líquido é obrigatório';
    if (!data.rendimentoMensal) errs.rendimentoMensal = 'Renda mensal é obrigatória';
    if (!data.patrimonioLiquidoInvestimentos) errs.patrimonioLiquidoInvestimentos = 'Campo obrigatório';
    if (!data.origemPatrimonio) errs.origemPatrimonio = 'Origem do patrimônio é obrigatória';
    if (!data.porcentagemMensalInvestir) errs.porcentagemMensalInvestir = 'Campo obrigatório';
    else if (parseFloat(data.porcentagemMensalInvestir) < 0 || parseFloat(data.porcentagemMensalInvestir) > 100) {
      errs.porcentagemMensalInvestir = 'Entre 0 e 100';
    }
    const showCnpj = ['CLT', 'Autônomo'].includes(data.categoriaProfissional) && data.checkDeclaracaoSocioProprietario;
    if (showCnpj && !data.cnpjEmpresaOcupacao) errs.cnpjEmpresaOcupacao = 'CNPJ é obrigatório';
  }

  // Perfil (step 4 no CPF, step 3 no CNPJ)
  const isPerfilStep = (isCpf && step === 4) || (!isCpf && step === 3);
  if (isPerfilStep) {
    if (!data.perfilDeInvestidor) errs.perfilDeInvestidor = 'Responda todas as perguntas para gerar o perfil';
  }

  // Representante Legal CNPJ (step 4)
  if (!isCpf && step === 4) {
    data.representantes.forEach((r, i) => {
      if (!r.nome) errs[`representante_${i}_nome`] = 'Nome é obrigatório';
      if (!r.cpf || !validateCpf(r.cpf)) errs[`representante_${i}_cpf`] = 'CPF inválido';
      if (!r.email || !r.email.includes('@')) errs[`representante_${i}_email`] = 'E-mail inválido';
      if (!r.telefone || stripMask(r.telefone).length < 10) errs[`representante_${i}_telefone`] = 'Telefone inválido';
      if (!r.tipoVinculo) errs[`representante_${i}_tipoVinculo`] = 'Tipo de vínculo obrigatório';
    });
  }

  // Dados complementares CNPJ (step 5)
  if (!isCpf && step === 5) {
    if (!data.faturamentoMedioMensal) errs.faturamentoMedioMensal = 'Faturamento médio mensal é obrigatório';
    if (!data.patrimonioAtivosTotais) errs.patrimonioAtivosTotais = 'Patrimônio / ativos totais é obrigatório';
    if (!data.origemRecursosAplicados) errs.origemRecursosAplicados = 'Origem dos recursos é obrigatória';
    if (!data.socioResidenciaFiscalExterior) errs.socioResidenciaFiscalExterior = 'Selecione Sim ou Não';
    if (!data.objetivoInvestimentos) errs.objetivoInvestimentos = 'Objetivo dos investimentos é obrigatório';
    if (!data.prazoInvestimento) errs.prazoInvestimento = 'Prazo de investimento é obrigatório';
    if (!data.toleranciaRisco) errs.toleranciaRisco = 'Tolerância ao risco é obrigatória';
    if (!data.experienciaPreviaInvestimentos) errs.experienciaPreviaInvestimentos = 'Selecione Sim ou Não';
  }

  // Documentos CPF (step 5)
  if (isCpf && step === 5) {
    if (!data.documentoIdentificacao) errs.documentoIdentificacao = 'Documento de identificação é obrigatório';
    if (!data.comprovanteResidencia) errs.comprovanteResidencia = 'Comprovante de residência é obrigatório';
    if (!data.aceiteArmazenamentoDados) errs.aceiteArmazenamentoDados = 'Aceite obrigatório';
    if (!data.cienteEnvioDocumentos) errs.cienteEnvioDocumentos = 'Aceite obrigatório';
    if (!data.cienteRiscosOperacao) errs.cienteRiscosOperacao = 'Aceite obrigatório';
    if (!data.cientePoliticasAdministracao) errs.cientePoliticasAdministracao = 'Aceite obrigatório';
    if (!data.cientePerfilRisco) errs.cientePerfilRisco = 'Aceite obrigatório';
  }

  // Documentos CNPJ (step 6)
  if (!isCpf && step === 6) {
    if (!data.copiaContratoSocial) errs.copiaContratoSocial = 'Contrato social é obrigatório';
    if (!data.cartaoCnpj) errs.cartaoCnpj = 'Cartão CNPJ é obrigatório';
    if (!data.rgSocio) errs.rgSocio = 'RG do sócio é obrigatório';
    if (!data.aceiteArmazenamentoDados) errs.aceiteArmazenamentoDados = 'Aceite obrigatório';
    if (!data.cienteEnvioDocumentos) errs.cienteEnvioDocumentos = 'Aceite obrigatório';
    if (!data.cienteRiscosOperacao) errs.cienteRiscosOperacao = 'Aceite obrigatório';
    if (!data.cientePoliticasAdministracao) errs.cientePoliticasAdministracao = 'Aceite obrigatório';
    if (!data.cientePerfilRisco) errs.cientePerfilRisco = 'Aceite obrigatório';
    if (!data.cienciaCombateTerrorismo) errs.cienciaCombateTerrorismo = 'Aceite obrigatório';
  }

  return errs;
};

const API_FIELD_LABELS: Record<string, string> = {
  nome_completo: 'Nome Completo',
  data_nascimento: 'Data de Nascimento',
  orgao_emissor: 'Órgão Emissor',
  data_expedicao: 'Data de Expedição',
  estado_civil: 'Estado Civil',
  nome_conjuge: 'Nome do Cônjuge',
  cpf_conjuge: 'CPF do Cônjuge',
  nome_pai: 'Nome do Pai',
  nome_mae: 'Nome da Mãe',
  numero_endereco: 'Número do Endereço',
  complemento_endereco: 'Complemento',
  bairro_endereco: 'Bairro',
  cidade_endereco: 'Cidade',
  estado_endereco: 'Estado',
  pais_endereco: 'País',
  telefone_residencial: 'Telefone',
  confirme_email: 'Confirmação de E-mail',
  categoria_profissional: 'Categoria Profissional',
  ocupacao_profissional: 'Ocupação Profissional',
  check_declaracao_socio_proprietario: 'Declaração de Sócio/Proprietário',
  cnpj_empresa_ocupacao: 'CNPJ da Empresa',
  classificacao_investidor: 'Classificação do Investidor',
  patrimonio_liquido: 'Patrimônio Líquido',
  rendimento_mensal: 'Rendimento Mensal',
  porcentagem_mensal_investir: 'Porcentagem para Investir (%)',
  patrimonio_liquido_investimentos: 'Patrimônio em Investimentos',
  origem_patrimonio: 'Origem do Patrimônio',
  check_pessoa_publicamente_exposta: 'Pessoa Publicamente Exposta (PPE)',
  empresa_ppe: 'Empresa (PPE)',
  cargo_ppe: 'Cargo (PPE)',
  data_inicio_ppe: 'Data de Início (PPE)',
  data_fim_ppe: 'Data de Fim (PPE)',
  perfil_investidor: 'Perfil de Investidor',
  data_registro: 'Data de Registro',
  upload_cnh_rg: 'Documento de Identificação (CNH/RG)',
  upload_comprovante_residencia: 'Comprovante de Residência',
  hub_credenciado: 'Hub Credenciada',
  id_hub: 'Hub Credenciada',
  id_vinculacao_assessor: 'Assessor',
  ciencia_armazenamento_dados: 'Aceite de Armazenamento de Dados',
  ciencia_envio_correto_documentos: 'Aceite de Envio de Documentos',
  ciencia_riscos_operacao: 'Aceite de Riscos da Operação',
  ciencia_politicas_administracao: 'Aceite das Políticas de Administração',
  ciencia_perfil_risco_investidor: 'Aceite do Perfil de Risco do Investidor',
  representante_residencia_fiscal_exterior: 'Sócio com Residência Fiscal no Exterior',
  exp_previa_investimentos: 'Experiência Prévia com Investimentos',
  perfil_acesso_btg: 'Perfil de Acesso BTG',
  site_empresa: 'Site da Empresa',
};

const API_FIELD_TO_FORM_FIELD: Record<string, keyof RegistrationFormData | string> = {
  nome_completo: 'nomeCompleto',
  data_nascimento: 'dataNascimento',
  orgao_emissor: 'orgaoEmissor',
  data_expedicao: 'dataExpedicao',
  estado_civil: 'estadoCivil',
  nome_conjuge: 'nomeConjuge',
  cpf_conjuge: 'cpfConjuge',
  nome_pai: 'nomePai',
  nome_mae: 'nomeMae',
  numero_endereco: 'numero',
  complemento_endereco: 'complemento',
  bairro_endereco: 'bairro',
  cidade_endereco: 'cidade',
  estado_endereco: 'estado',
  pais_endereco: 'pais',
  telefone_residencial: 'telefone',
  confirme_email: 'confirmaEmail',
  categoria_profissional: 'categoriaProfissional',
  ocupacao_profissional: 'ocupacaoProfissional',
  check_declaracao_socio_proprietario: 'checkDeclaracaoSocioProprietario',
  cnpj_empresa_ocupacao: 'cnpjEmpresaOcupacao',
  classificacao_investidor: 'classificacaoInvestidor',
  patrimonio_liquido: 'patrimonioLiquido',
  rendimento_mensal: 'rendimentoMensal',
  porcentagem_mensal_investir: 'porcentagemMensalInvestir',
  patrimonio_liquido_investimentos: 'patrimonioLiquidoInvestimentos',
  origem_patrimonio: 'origemPatrimonio',
  check_pessoa_publicamente_exposta: 'checkPessoaPublicamenteExposta',
  empresa_ppe: 'empresaPpe',
  cargo_ppe: 'cargoPpe',
  data_inicio_ppe: 'dataInicioPpe',
  data_fim_ppe: 'dataFimPpe',
  perfil_investidor: 'perfilDeInvestidor',
  data_registro: 'dataRegistro',
  upload_cnh_rg: 'documentoIdentificacao',
  upload_comprovante_residencia: 'comprovanteResidencia',
  hub_credenciado: 'hubCredenciada',
  id_hub: 'hubCredenciadaId',
  id_vinculacao_assessor: 'assessorId',
  ciencia_armazenamento_dados: 'aceiteArmazenamentoDados',
  ciencia_envio_correto_documentos: 'cienteEnvioDocumentos',
  ciencia_riscos_operacao: 'cienteRiscosOperacao',
  ciencia_politicas_administracao: 'cientePoliticasAdministracao',
  ciencia_perfil_risco_investidor: 'cientePerfilRisco',
  representante_residencia_fiscal_exterior: 'socioResidenciaFiscalExterior',
  exp_previa_investimentos: 'experienciaPreviaInvestimentos',
};

const FIELD_TO_STEP_CPF: Record<string, number> = {
  documentoIdentificacao: 5,
  comprovanteResidencia: 5,
  aceiteArmazenamentoDados: 5,
  cienteEnvioDocumentos: 5,
  cienteRiscosOperacao: 5,
  cientePoliticasAdministracao: 5,
  cientePerfilRisco: 5,
  categoriaProfissional: 3,
  ocupacaoProfissional: 3,
  cnpjEmpresaOcupacao: 3,
  classificacaoInvestidor: 3,
  patrimonioLiquido: 3,
  rendimentoMensal: 3,
  porcentagemMensalInvestir: 3,
  patrimonioLiquidoInvestimentos: 3,
  origemPatrimonio: 3,
  empresaPpe: 3,
  cargoPpe: 3,
  dataInicioPpe: 3,
  dataFimPpe: 3,
  perfilDeInvestidor: 4,
  cep: 2,
  endereco: 2,
  bairro: 2,
  cidade: 2,
  estado: 2,
  pais: 2,
  celular: 2,
  email: 2,
  confirmaEmail: 2,
};

const shouldIgnore422FieldError = (apiField: string, data: RegistrationFormData): boolean => {
  if (apiField === 'nome_conjuge' || apiField === 'cpf_conjuge') {
    return data.estadoCivil !== 'Casado(a)';
  }

  if (apiField === 'cnpj_empresa_ocupacao') {
    const shouldRequireCnpjEmpresa =
      data.documentType === 'CPF' &&
      ['CLT', 'Autônomo'].includes(data.categoriaProfissional) &&
      data.checkDeclaracaoSocioProprietario;
    return !shouldRequireCnpjEmpresa;
  }

  return false;
};

const normalizeApiFieldMessage = (msg: string): string => {
  if (msg === 'Field required') return 'Campo obrigatório';
  return msg;
};

const extract422FieldErrors = (err: unknown, data: RegistrationFormData): {
  fieldErrors: Record<string, string>;
  missingMessages: string[];
} => {
  const fieldErrors: Record<string, string> = {};
  const missingMessages: string[] = [];
  if (!(err instanceof ApiError) || err.status !== 422) {
    return { fieldErrors, missingMessages };
  }

  const details = Array.isArray(err.details?.detail) ? err.details.detail : [];
  details.forEach((item: any) => {
    const loc = Array.isArray(item?.loc) ? item.loc : [];
    const apiField = typeof loc[loc.length - 1] === 'string' ? loc[loc.length - 1] : '';
    const rawMsg = item?.msg || 'Campo inválido';
    const msg = normalizeApiFieldMessage(rawMsg);
    if (apiField && shouldIgnore422FieldError(apiField, data)) return;

    const formField = apiField ? API_FIELD_TO_FORM_FIELD[apiField] || apiField : '';

    const label = apiField ? (API_FIELD_LABELS[apiField] || apiField) : '';
    if (formField) fieldErrors[String(formField)] = msg;
    if (label) missingMessages.push(label);
  });

  return { fieldErrors, missingMessages: Array.from(new Set(missingMessages)) };
};

// ─── Modal de conta existente ─────────────────────────────────────────────────
interface ExistingAccountModalProps {
  message: string;
  onUpdate: () => void;
  onCancel: () => void;
}
const ExistingAccountModal: React.FC<ExistingAccountModalProps> = ({ message, onUpdate, onCancel }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-amber-600" />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 mb-2">Conta já cadastrada</h3>
      <p className="text-sm text-zinc-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          Cancelar
        </button>
        <button
          onClick={onUpdate}
          className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800"
        >
          Atualizar cadastro
        </button>
      </div>
    </div>
  </div>
);

// ─── Modal de sucesso ─────────────────────────────────────────────────────────
const SuccessModal: React.FC<{ name: string; onClose: () => void }> = ({ name, onClose }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
    <div className="relative bg-white rounded-2xl p-10 max-w-sm w-full shadow-2xl text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>
      <h3 className="text-xl font-bold text-zinc-900 mb-2">Cadastro realizado!</h3>
      <p className="text-sm text-zinc-500 mb-6">
        <span className="font-semibold text-zinc-800">{name}</span> foi cadastrado(a) com sucesso.
      </p>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-zinc-800"
      >
        Voltar ao Jornal
      </button>
    </div>
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export const ClientRegistrationPage: React.FC<Props> = ({ userData, onBack, onSuccess }) => {
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExistingModal, setShowExistingModal] = useState(false);
  const [existingModalMsg, setExistingModalMsg] = useState('');
  const [existingClientId, setExistingClientId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [api422Errors, setApi422Errors] = useState<string[]>([]);

  const isCpf = formData.documentType === 'CPF';
  const steps = isCpf ? CPF_STEPS : CNPJ_STEPS;
  const totalSteps = steps.length;

  const updateFormData = useCallback((patch: Partial<RegistrationFormData>) => {
    setFormData(prev => {
      const next = { ...prev, ...patch };
      // Reset ao mudar tipo de documento
      if (patch.documentType && patch.documentType !== prev.documentType) {
        return {
          ...initialFormData,
          documentType: patch.documentType,
          hubCredenciada: prev.hubCredenciada,
          hubCredenciadaId: prev.hubCredenciadaId,
          assessor: prev.assessor,
          assessorId: prev.assessorId,
        };
      }
      return next;
    });
    // Limpar erros dos campos alterados
    if (Object.keys(patch).length > 0) {
      setErrors(prev => {
        const next = { ...prev };
        Object.keys(patch).forEach(k => delete next[k]);
        return next;
      });
    }
  }, []);

  // ─── Avançar step ─────────────────────────────────────────────────────────
  const handleNext = async () => {
    const stepErrs = validateStep(currentStep, formData);
    if (Object.keys(stepErrs).length > 0) {
      setErrors(stepErrs);
      // Scroll to first error
      setTimeout(() => {
        const firstErr = document.querySelector('[data-error]');
        firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      toast.error('Corrija os erros antes de continuar');
      return;
    }
    setErrors({});

    // Validar conta existente ao sair do step 1 com "tenho conta"
    if (currentStep === 1 && formData.situacaoContaCorretora === 'tenho' && formData.codigoConta) {
      try {
        const docNum = isCpf ? formData.cpf : formData.cnpj;
        const res = await validarContaExistente(formData.codigoConta, docNum);
        if (res.status === 'conta_cadastrada_mesmo_documento' && res.pode_atualizar) {
          setExistingModalMsg(res.mensagem || 'Conta já cadastrada para este documento. Deseja atualizar?');
          setExistingClientId(res.id_cliente || null);
          setShowExistingModal(true);
          return;
        }
        if (res.status === 'conta_cadastrada_outro_documento') {
          toast.error('Esta conta já está vinculada a outro documento. Não é possível prosseguir.');
          return;
        }
      } catch {
        // Não bloquear o fluxo em caso de erro na validação
      }
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setCurrentStep(s => s + 1);
    setApi422Errors([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Voltar step ──────────────────────────────────────────────────────────
  const handlePrev = () => {
    setErrors({});
    setApi422Errors([]);
    setCurrentStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Submit final ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const stepErrs = validateStep(currentStep, formData);
    if (Object.keys(stepErrs).length > 0) {
      setErrors(stepErrs);
      toast.error('Corrija os erros antes de enviar');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isCpf
        ? await registerClienteCpf(formData)
        : await registerClienteCnpj(formData);

      // Enviar dados de abertura se "vou abrir"
      if (formData.situacaoContaCorretora === 'vou_abrir' && result.id_cliente) {
        try {
          await enviarDadosAberturaContaService(result.id_cliente);
        } catch {
          // Não bloquear o sucesso principal
        }
      }

      setApi422Errors([]);
      setShowSuccess(true);
    } catch (err: any) {
      const { fieldErrors, missingMessages } = extract422FieldErrors(err, formData);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...fieldErrors }));
        setApi422Errors(missingMessages.length > 0 ? missingMessages : ['Campos obrigatórios não preenchidos']);

        // Se possível, leva o usuário para o step do primeiro campo inválido
        const firstField = Object.keys(fieldErrors)[0];
        const targetStep = isCpf ? FIELD_TO_STEP_CPF[firstField] : undefined;
        if (targetStep && targetStep !== currentStep) {
          setCurrentStep(targetStep);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        toast.error('Há campos obrigatórios pendentes. Verifique os detalhes abaixo.');
        return;
      }
      setApi422Errors([]);
      toast.error(err?.message || 'Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Renderizar step atual ────────────────────────────────────────────────
  const renderStep = () => {
    const props = { data: formData, onChange: updateFormData, errors };

    if (isCpf) {
      switch (currentStep) {
        case 1: return <Step1DadosPessoais {...props} userData={userData} />;
        case 2: return <Step2Endereco {...props} />;
        case 3: return <Step3Profissional {...props} />;
        case 4: return <Step4PerfilInvestidor {...props} />;
        case 5: return <Step5Documentos {...props} />;
      }
    } else {
      switch (currentStep) {
        case 1: return <Step1DadosPessoais {...props} userData={userData} />;
        case 2: return <Step2Endereco {...props} />;
        case 3: return <Step4PerfilInvestidor {...props} />;
        case 4: return <StepCNPJ_Representante {...props} />;
        case 5: return <StepCNPJ_Complementar {...props} />;
        case 6: return <StepCNPJ_Documentos {...props} />;
      }
    }
    return null;
  };

  const isLastStep = currentStep === totalSteps;
  const progressPct = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-50 flex">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fafafa',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '500',
            border: '1px solid #3f3f46',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#18181b' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#18181b' } },
        }}
      />

      {/* ── Sidebar Esquerda (Desktop) ──────────────────────────── */}
      <aside className="hidden lg:flex lg:w-[420px] xl:w-[480px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 flex-col justify-between relative overflow-hidden">
        {/* Pattern de fundo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative z-10">
          {/* Logo/Voltar */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors mb-12 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Voltar ao Jornal</span>
          </button>

          {/* Título */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-3">
              Cadastro de Cliente
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Preencha os dados para criar um novo cadastro completo de cliente.
              Todas as informações são criptografadas e protegidas.
            </p>
          </div>

          {/* Logo da empresa */}
          <div className="mb-8">
            <img src="/assets/logo-white.svg" alt="Anova" className="h-12 w-auto" />
          </div>

          {/* Steps visuais */}
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isActive = step.id === currentStep;
              const isCompleted = completedSteps.has(step.id);
              const isPast = step.id < currentStep;
              
              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 transition-all duration-300 ${
                    isActive ? 'opacity-100' : isPast ? 'opacity-60' : 'opacity-30'
                  }`}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all
                    ${isCompleted ? 'bg-emerald-500' : isActive ? 'bg-white' : 'bg-zinc-700 border border-zinc-600'}
                  `}>
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <span className={`text-xs font-bold ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`}>
                        {step.id}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info footer */}
        <div className="relative z-10 flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 backdrop-blur-sm">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs text-zinc-300">
            Seus dados estão protegidos com criptografia de ponta a ponta
          </p>
        </div>
      </aside>

      {/* ── Conteúdo Principal (Formulário) ─────────────────────── */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Header Mobile */}
        <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-zinc-200 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <div className="text-center">
              <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                Cadastro
              </p>
              <p className="text-xs text-zinc-700 font-semibold flex items-center gap-1.5 justify-center">
                {formData.documentType === 'CPF' ? (
                  <><User className="w-3 h-3" /> Pessoa Física</>
                ) : (
                  <><Building2 className="w-3 h-3" /> Pessoa Jurídica</>
                )}
              </p>
            </div>
            <div className="w-16" />
          </div>

          {/* Barra de progresso */}
          <div className="h-1 bg-zinc-100">
            <div
              className="h-1 bg-zinc-900 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </header>

        {/* Progress bar - Desktop (fixed no topo) */}
        <div className="hidden lg:block sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200">
          <div className="max-w-4xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">{steps[currentStep - 1]?.label}</h2>
                <p className="text-xs text-zinc-500">Etapa {currentStep} de {totalSteps}</p>
              </div>
              <div className="flex items-center gap-2">
                {formData.documentType === 'CPF' ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                    <User className="w-3.5 h-3.5" />
                    Pessoa Física
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold">
                    <Building2 className="w-3.5 h-3.5" />
                    Pessoa Jurídica
                  </div>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-1.5 bg-gradient-to-r from-zinc-900 to-zinc-700 transition-all duration-500 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 lg:p-8">
            {/* Conteúdo do step */}
            {renderStep()}
          </div>

          {/* ── Alerta de campos pendentes (erro 422) ─────────────── */}
          {api422Errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-700 mb-2">
                    Campos obrigatórios pendentes — revise e corrija antes de finalizar:
                  </p>
                  <ul className="space-y-1">
                    {api422Errors.map((field, i) => (
                      <li key={i} className="text-sm text-red-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => setApi422Errors([])}
                  className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Navegação ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between mt-6 pb-10">
            <button
              type="button"
              onClick={currentStep === 1 ? onBack : handlePrev}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              {currentStep === 1 ? 'Cancelar' : 'Voltar'}
            </button>

            {isLastStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-700 text-white text-sm font-semibold hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Finalizar Cadastro
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-700 text-white text-sm font-semibold hover:shadow-lg transition-all"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* ── Modal conta existente ──────────────────────────────── */}
      {showExistingModal && (
        <ExistingAccountModal
          message={existingModalMsg}
          onCancel={() => setShowExistingModal(false)}
          onUpdate={async () => {
            setShowExistingModal(false);
            setCompletedSteps(prev => new Set([...prev, currentStep]));
            setCurrentStep(s => s + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* ── Modal de sucesso ───────────────────────────────────── */}
      {showSuccess && (
        <SuccessModal
          name={isCpf ? formData.nomeCompleto : formData.razaoSocial}
          onClose={onSuccess}
        />
      )}
    </div>
  );
};
