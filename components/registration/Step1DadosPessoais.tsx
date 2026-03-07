
import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, User, Building2 } from 'lucide-react';
import {
  Field, Input, Select, RadioGroup, SectionTitle, Divider,
  applyCpfMask, applyCnpjMask, applyPhoneMask, stripMask, validateCpf, validateCnpj,
} from './FormUI';
import {
  RegistrationFormData, DocumentType,
  CORRETORAS_GESTORA, CORRETORAS_CONSULTORIA, getCarteiraOptions,
  INDICES_PERFORMANCE, SEXO_OPTIONS, ESCOLARIDADE_OPTIONS,
  ESTADO_CIVIL_OPTIONS, ESTADOS_BR, ESTRUTURA_LEGAL_OPTIONS,
  NACIONALIDADE_OPTIONS,
} from './types';
import { apiRequest } from '../../services/api';

interface Props {
  data: RegistrationFormData;
  onChange: (patch: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
  userData: any;
}

const Step1DadosPessoais: React.FC<Props> = ({ data, onChange, errors, userData }) => {
  const isCpf = data.documentType === 'CPF';

  const [loadingHubNome, setLoadingHubNome] = useState(false);
  const [validatingDoc, setValidatingDoc] = useState(false);
  const [docWarning, setDocWarning] = useState<string | null>(null);

  const corretoras = data.modeloAtendimento === '1' ? CORRETORAS_GESTORA : CORRETORAS_CONSULTORIA;
  const carteiraOptions = data.escolhaCorretora ? getCarteiraOptions(data.escolhaCorretora) : [];

  // Preencher hub e assessor automaticamente a partir do login (id_partner = hub, id_registro = assessor)
  // O nome exibido em ambos (hubCredenciada e assessor) vem da API nome-hub-by-id
  useEffect(() => {
    if (!userData?.id_partner || !userData?.id_registro) return;
    const hubId = String(userData.id_partner);
    const assessorId = String(userData.id_registro);
    onChange({
      hubCredenciadaId: hubId,
      assessorId,
    });
  }, [userData?.id_partner, userData?.id_registro]);

  // Buscar nome da hub via API nome-hub-by-id (id_partner = id_hub)
  useEffect(() => {
    if (!userData?.id_partner) return;
    const fetchNomeHub = async () => {
      setLoadingHubNome(true);
      try {
        const res = await apiRequest(`/link-hub/nome-hub-by-id/${userData.id_partner}`);
        const nomeHub = res?.nome_hub ?? res?.nome ?? '';
        if (nomeHub) {
          onChange({ hubCredenciada: nomeHub, assessor: nomeHub });
        }
      } catch {
        // Fallback: manter vazio ou usar id
      } finally {
        setLoadingHubNome(false);
      }
    };
    fetchNomeHub();
  }, [userData?.id_partner]);

  // Quando corretora muda: resetar carteira e atualizar gestora
  const handleCorretoraChange = (value: string) => {
    const options = getCarteiraOptions(value);
    onChange({
      escolhaCorretora: value,
      carteira: options.length === 1 ? options[0] : '',
    });
  };

  // Troca CPF / CNPJ
  const handleDocTypeChange = (type: DocumentType) => {
    onChange({ documentType: type });
  };

  return (
    <div className="space-y-6">
      {/* ── Tipo de cadastro ─────────────────────────────────────── */}
      <div>
        <SectionTitle>Tipo de Cadastro</SectionTitle>
        <div className="flex gap-3">
          {(['CPF', 'CNPJ'] as DocumentType[]).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => handleDocTypeChange(type)}
              className={`
                flex-1 py-4 px-4 rounded-xl border-2 font-semibold text-sm transition-all
                flex items-center justify-center gap-2.5
                ${data.documentType === type
                  ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-900/20'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50'}
              `}
            >
              {type === 'CPF' ? (
                <>
                  <User className="w-5 h-5" />
                  Pessoa Física (CPF)
                </>
              ) : (
                <>
                  <Building2 className="w-5 h-5" />
                  Pessoa Jurídica (CNPJ)
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      <Divider />

      {/* ── Modelo de Atendimento ────────────────────────────────── */}
      <SectionTitle>Modelo de Atendimento e Configuração</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Modelo de Atendimento" required error={errors.modeloAtendimento}>
          <RadioGroup
            name="modeloAtendimento"
            value={data.modeloAtendimento}
            onChange={v => onChange({ modeloAtendimento: v, escolhaCorretora: '', carteira: '' })}
            options={[
              { value: '1', label: 'Gestora' },
              { value: '2', label: 'Consultoria' },
            ]}
          />
        </Field>

        <Field label="Taxa de Gestão (%)" required error={errors.taxaGestao}>
          <Input
            type="number"
            min="0.2"
            step="0.01"
            placeholder="Ex: 1.5"
            value={data.taxaGestao}
            onChange={e => onChange({ taxaGestao: e.target.value })}
            error={!!errors.taxaGestao}
          />
        </Field>

        {data.modeloAtendimento === '1' && (
          <>
            <Field label="Taxa de Performance (%)" error={errors.taxaPerformance}>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 20"
                value={data.taxaPerformance}
                onChange={e => onChange({ taxaPerformance: e.target.value })}
              />
            </Field>
            <Field label="Índice de Performance" error={errors.indicePerformance}>
              <Select
                value={data.indicePerformance}
                onChange={e => onChange({ indicePerformance: e.target.value })}
                options={INDICES_PERFORMANCE.map(i => ({ value: i, label: i }))}
                placeholder="Selecione..."
              />
            </Field>
          </>
        )}
      </div>

      {/* ── Corretora ────────────────────────────────────────────── */}
      <Divider />
      <SectionTitle>Corretora e Situação da Conta</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Situação da Conta" required>
          <RadioGroup
            name="situacaoContaCorretora"
            value={data.situacaoContaCorretora}
            onChange={v => onChange({ situacaoContaCorretora: v as 'vou_abrir' | 'tenho' })}
            options={[
              { value: 'vou_abrir', label: 'Vou abrir conta' },
              { value: 'tenho', label: 'Já tenho conta' },
            ]}
          />
        </Field>

        <Field label="Corretora" required error={errors.escolhaCorretora}>
          <Select
            value={data.escolhaCorretora}
            onChange={e => handleCorretoraChange(e.target.value)}
            options={corretoras.map(c => ({ value: c, label: c }))}
            placeholder={data.modeloAtendimento ? 'Selecione...' : 'Primeiro escolha o modelo'}
            disabled={!data.modeloAtendimento}
            error={!!errors.escolhaCorretora}
          />
        </Field>

        {data.situacaoContaCorretora === 'tenho' && (
          <Field label="Código da Conta" error={errors.codigoConta} hint="Código na corretora (opcional)">
            <Input
              maxLength={20}
              placeholder="Ex: 12345-6"
              value={data.codigoConta}
              onChange={e => onChange({ codigoConta: e.target.value })}
            />
          </Field>
        )}

        <Field label="Carteira" required error={errors.carteira}>
          <Select
            value={data.carteira}
            onChange={e => onChange({ carteira: e.target.value })}
            options={carteiraOptions.map(c => ({ value: c, label: c }))}
            placeholder={data.escolhaCorretora ? 'Selecione...' : 'Primeiro escolha a corretora'}
            disabled={!data.escolhaCorretora}
            error={!!errors.carteira}
          />
        </Field>
      </div>

      {/* ── Hub e Assessor (preenchidos automaticamente pelo login: id_partner e id_registro) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Hub Credenciada" required error={errors.hubCredenciadaId}>
          {loadingHubNome ? (
            <div className="flex items-center gap-2 text-sm text-zinc-500 py-2.5">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando...
            </div>
          ) : (
            <Input
              value={data.hubCredenciada || (data.hubCredenciadaId ? `Hub #${data.hubCredenciadaId}` : '')}
              readOnly
              disabled
              className="bg-zinc-50 cursor-not-allowed"
            />
          )}
        </Field>

        <Field label="Assessor" required error={errors.assessorId}>
          <Input
            value={data.assessor || (data.assessorId ? `Assessor #${data.assessorId}` : '')}
            readOnly
            disabled
            className="bg-zinc-50 cursor-not-allowed"
          />
        </Field>
      </div>

      <Divider />

      {/* ── Dados Pessoais ───────────────────────────────────────── */}
      {isCpf ? (
        <PessoaFisicaFields data={data} onChange={onChange} errors={errors} />
      ) : (
        <PessoaJuridicaFields data={data} onChange={onChange} errors={errors} />
      )}

      {docWarning && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
          {docWarning}
        </div>
      )}
    </div>
  );
};

// ─── Pessoa Física ────────────────────────────────────────────────────────────
const PessoaFisicaFields: React.FC<{
  data: RegistrationFormData;
  onChange: (p: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}> = ({ data, onChange, errors }) => {
  const isCasado = data.estadoCivil === 'Casado(a)';

  return (
    <>
      <SectionTitle>Dados Pessoais</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nome Completo" required error={errors.nomeCompleto} className="md:col-span-2">
          <Input
            placeholder="Digite o nome completo"
            value={data.nomeCompleto}
            onChange={e => onChange({ nomeCompleto: e.target.value })}
            error={!!errors.nomeCompleto}
          />
        </Field>

        <Field label="CPF" required error={errors.cpf}>
          <Input
            placeholder="000.000.000-00"
            value={data.cpf}
            onChange={e => onChange({ cpf: applyCpfMask(e.target.value) })}
            error={!!errors.cpf}
          />
        </Field>

        <Field label="Data de Nascimento" required error={errors.dataNascimento}>
          <Input
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={data.dataNascimento}
            onChange={e => onChange({ dataNascimento: e.target.value })}
            error={!!errors.dataNascimento}
          />
        </Field>

        <Field label="RG" required error={errors.rg}>
          <Input
            placeholder="Número do RG"
            value={data.rg}
            onChange={e => onChange({ rg: e.target.value })}
            error={!!errors.rg}
          />
        </Field>

        <Field label="Órgão Emissor" required error={errors.orgaoEmissor}>
          <Input
            placeholder="Ex: SSP/SP"
            maxLength={10}
            value={data.orgaoEmissor}
            onChange={e => onChange({ orgaoEmissor: e.target.value })}
            error={!!errors.orgaoEmissor}
          />
        </Field>

        <Field label="Data de Expedição" required error={errors.dataExpedicao}>
          <Input
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={data.dataExpedicao}
            onChange={e => onChange({ dataExpedicao: e.target.value })}
            error={!!errors.dataExpedicao}
          />
        </Field>

        <Field label="Sexo" required error={errors.sexo}>
          <Select
            value={data.sexo}
            onChange={e => onChange({ sexo: e.target.value })}
            options={SEXO_OPTIONS.map(s => ({ value: s, label: s }))}
            placeholder="Selecione..."
            error={!!errors.sexo}
          />
        </Field>

        <Field label="Nacionalidade" required error={errors.nacionalidade}>
          <Select
            value={data.nacionalidade}
            onChange={e => onChange({ nacionalidade: e.target.value })}
            options={NACIONALIDADE_OPTIONS.map(n => ({ value: n, label: n }))}
            placeholder="Selecione..."
            error={!!errors.nacionalidade}
          />
        </Field>

        <Field label="Naturalidade" required error={errors.naturalidade}>
          <Input
            placeholder="Cidade de nascimento"
            value={data.naturalidade}
            onChange={e => onChange({ naturalidade: e.target.value })}
            error={!!errors.naturalidade}
          />
        </Field>

        <Field label="Escolaridade" required error={errors.escolaridade}>
          <Select
            value={data.escolaridade}
            onChange={e => onChange({ escolaridade: e.target.value })}
            options={ESCOLARIDADE_OPTIONS.map(e => ({ value: e, label: e }))}
            placeholder="Selecione..."
            error={!!errors.escolaridade}
          />
        </Field>

        <Field label="Estado Civil" required error={errors.estadoCivil}>
          <Select
            value={data.estadoCivil}
            onChange={e => onChange({ estadoCivil: e.target.value })}
            options={ESTADO_CIVIL_OPTIONS.map(e => ({ value: e, label: e }))}
            placeholder="Selecione..."
            error={!!errors.estadoCivil}
          />
        </Field>

        {isCasado && (
          <>
            <Field label="Nome do Cônjuge" required error={errors.nomeConjuge}>
              <Input
                placeholder="Nome completo do cônjuge"
                value={data.nomeConjuge}
                onChange={e => onChange({ nomeConjuge: e.target.value })}
                error={!!errors.nomeConjuge}
              />
            </Field>
            <Field label="CPF do Cônjuge" required error={errors.cpfConjuge}>
              <Input
                placeholder="000.000.000-00"
                value={data.cpfConjuge}
                onChange={e => onChange({ cpfConjuge: applyCpfMask(e.target.value) })}
                error={!!errors.cpfConjuge}
              />
            </Field>
          </>
        )}

        <Field label="Nome do Pai" required error={errors.nomePai}>
          <Input
            placeholder="Nome completo do pai"
            value={data.nomePai}
            onChange={e => onChange({ nomePai: e.target.value })}
            error={!!errors.nomePai}
          />
        </Field>

        <Field label="Nome da Mãe" required error={errors.nomeMae}>
          <Input
            placeholder="Nome completo da mãe"
            value={data.nomeMae}
            onChange={e => onChange({ nomeMae: e.target.value })}
            error={!!errors.nomeMae}
          />
        </Field>
      </div>
    </>
  );
};

// ─── Pessoa Jurídica ──────────────────────────────────────────────────────────
const PessoaJuridicaFields: React.FC<{
  data: RegistrationFormData;
  onChange: (p: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}> = ({ data, onChange, errors }) => (
  <>
    <SectionTitle>Dados da Empresa</SectionTitle>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Razão Social" required error={errors.razaoSocial} className="md:col-span-2">
        <Input
          placeholder="Razão social da empresa"
          value={data.razaoSocial}
          onChange={e => onChange({ razaoSocial: e.target.value })}
          error={!!errors.razaoSocial}
        />
      </Field>

      <Field label="Nome Fantasia" error={errors.nomeFantasia}>
        <Input
          placeholder="Nome fantasia (opcional)"
          value={data.nomeFantasia}
          onChange={e => onChange({ nomeFantasia: e.target.value })}
        />
      </Field>

      <Field label="CNPJ" required error={errors.cnpj}>
        <Input
          placeholder="00.000.000/0000-00"
          value={data.cnpj}
          onChange={e => onChange({ cnpj: applyCnpjMask(e.target.value) })}
          error={!!errors.cnpj}
        />
      </Field>

      <Field label="Data de Constituição" required error={errors.dataConstituicao}>
        <Input
          type="date"
          max={new Date().toISOString().split('T')[0]}
          value={data.dataConstituicao}
          onChange={e => onChange({ dataConstituicao: e.target.value })}
          error={!!errors.dataConstituicao}
        />
      </Field>

      <Field label="Atividade Econômica (CNAE)" required error={errors.atividadeEconomica}>
        <Input
          placeholder="Ex: 6499-3/99"
          value={data.atividadeEconomica}
          onChange={e => onChange({ atividadeEconomica: e.target.value })}
          error={!!errors.atividadeEconomica}
        />
      </Field>

      <Field label="Estrutura Legal" required error={errors.estruturaLegal}>
        <Select
          value={data.estruturaLegal}
          onChange={e => onChange({ estruturaLegal: e.target.value })}
          options={ESTRUTURA_LEGAL_OPTIONS.map(e => ({ value: e, label: e }))}
          placeholder="Selecione..."
          error={!!errors.estruturaLegal}
        />
      </Field>
    </div>
  </>
);

export default Step1DadosPessoais;
