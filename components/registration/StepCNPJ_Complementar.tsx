
import React from 'react';
import { Field, Input, Select, SectionTitle, RadioGroup } from './FormUI';
import {
  RegistrationFormData,
  OBJETIVO_INVESTIMENTOS_OPTIONS,
  PRAZO_INVESTIMENTO_OPTIONS,
  TOLERANCIA_RISCO_OPTIONS,
} from './types';

interface Props {
  data: RegistrationFormData;
  onChange: (patch: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

const StepCNPJ_Complementar: React.FC<Props> = ({ data, onChange, errors }) => (
  <div className="space-y-6">
    <SectionTitle>Dados Financeiros da Empresa</SectionTitle>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Faturamento Médio Mensal (R$)" error={errors.faturamentoMedioMensal}>
        <Input
          type="number"
          min="0"
          placeholder="Ex: 100000"
          value={data.faturamentoMedioMensal}
          onChange={e => onChange({ faturamentoMedioMensal: e.target.value })}
          error={!!errors.faturamentoMedioMensal}
        />
      </Field>

      <Field label="Data de Referência do Faturamento" error={errors.dataReferenciaFaturamento}>
        <Input
          type="date"
          value={data.dataReferenciaFaturamento}
          onChange={e => onChange({ dataReferenciaFaturamento: e.target.value })}
        />
      </Field>

      <Field label="Patrimônio / Ativos Totais (R$)" error={errors.patrimonioAtivosTotais}>
        <Input
          type="number"
          min="0"
          placeholder="Ex: 500000"
          value={data.patrimonioAtivosTotais}
          onChange={e => onChange({ patrimonioAtivosTotais: e.target.value })}
        />
      </Field>

      <Field label="Origem dos Recursos a Aplicar" error={errors.origemRecursosAplicados}>
        <Input
          placeholder="Ex: Lucros operacionais"
          value={data.origemRecursosAplicados}
          onChange={e => onChange({ origemRecursosAplicados: e.target.value })}
        />
      </Field>

      <Field
        label="Sócio com Residência Fiscal no Exterior?"
        error={errors.socioResidenciaFiscalExterior}
      >
        <RadioGroup
          name="socioResidenciaFiscalExterior"
          value={data.socioResidenciaFiscalExterior}
          onChange={value => onChange({ socioResidenciaFiscalExterior: value })}
          options={[
            { value: 'nao', label: 'Não' },
            { value: 'sim', label: 'Sim' },
          ]}
        />
      </Field>
    </div>

    <SectionTitle>Perfil de Investimento</SectionTitle>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Objetivo dos Investimentos" error={errors.objetivoInvestimentos}>
        <Select
          value={data.objetivoInvestimentos}
          onChange={e => onChange({ objetivoInvestimentos: e.target.value })}
          options={OBJETIVO_INVESTIMENTOS_OPTIONS.map(o => ({ value: o, label: o }))}
          placeholder="Selecione..."
        />
      </Field>

      <Field label="Prazo de Investimento" error={errors.prazoInvestimento}>
        <Select
          value={data.prazoInvestimento}
          onChange={e => onChange({ prazoInvestimento: e.target.value })}
          options={PRAZO_INVESTIMENTO_OPTIONS.map(p => ({ value: p, label: p }))}
          placeholder="Selecione..."
        />
      </Field>

      <Field label="Tolerância ao Risco" error={errors.toleranciaRisco}>
        <Select
          value={data.toleranciaRisco}
          onChange={e => onChange({ toleranciaRisco: e.target.value })}
          options={TOLERANCIA_RISCO_OPTIONS.map(t => ({ value: t, label: t }))}
          placeholder="Selecione..."
        />
      </Field>

      <Field label="Experiência Prévia com Investimentos" error={errors.experienciaPreviaInvestimentos}>
        <RadioGroup
          name="experienciaPreviaInvestimentos"
          value={data.experienciaPreviaInvestimentos}
          onChange={value => onChange({ experienciaPreviaInvestimentos: value })}
          options={[
            { value: 'nao', label: 'Não' },
            { value: 'sim', label: 'Sim' },
          ]}
        />
      </Field>
    </div>
  </div>
);

export default StepCNPJ_Complementar;
