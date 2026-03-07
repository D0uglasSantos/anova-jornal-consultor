import React from 'react';
import {
  Field, Input, Select, Checkbox, SectionTitle, Divider, applyCnpjMask, MonetaryInput,
} from './FormUI';
import {
  RegistrationFormData,
  CATEGORIA_PROFISSIONAL_OPTIONS,
  CLASSIFICACAO_INVESTIDOR_OPTIONS,
} from './types';

interface Props {
  data: RegistrationFormData;
  onChange: (patch: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

const Step3Profissional: React.FC<Props> = ({ data, onChange, errors }) => {
  const isCltOuAutonomo = ['CLT', 'Autônomo'].includes(data.categoriaProfissional);
  const isClt = data.categoriaProfissional === 'CLT';
  const showCnpjEmpresa = isCltOuAutonomo && data.checkDeclaracaoSocioProprietario;

  return (
    <div className="space-y-6">
      <SectionTitle>Profissional e Financeiro</SectionTitle>

      {/* 1. Categoria Profissional | 2. Ocupação Profissional (se CLT/Autônomo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Categoria Profissional" required error={errors.categoriaProfissional}>
          <Select
            value={data.categoriaProfissional}
            onChange={e => onChange({ categoriaProfissional: e.target.value })}
            options={CATEGORIA_PROFISSIONAL_OPTIONS.map(c => ({ value: c, label: c }))}
            placeholder="Selecione..."
            error={!!errors.categoriaProfissional}
          />
        </Field>

        {isCltOuAutonomo && (
          <Field label="Ocupação Profissional" error={errors.ocupacaoProfissional}>
            <Input
              placeholder="Ex: Médico, Engenheiro..."
              value={data.ocupacaoProfissional}
              onChange={e => onChange({ ocupacaoProfissional: e.target.value })}
            />
          </Field>
        )}
      </div>

      {/* 3. Empresa onde trabalha (se CLT) | 4. Tempo de Ocupação (se CLT) */}
      {isClt && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Empresa onde trabalha" error={errors.empresaOcupacao}>
            <Input
              placeholder="Nome da empresa"
              value={data.empresaOcupacao}
              onChange={e => onChange({ empresaOcupacao: e.target.value })}
            />
          </Field>
          <Field label="Tempo de Ocupação" error={errors.tempoOcupacao}>
            <Input
              placeholder="Ex.: 5 anos"
              value={data.tempoOcupacao}
              onChange={e => onChange({ tempoOcupacao: e.target.value })}
            />
          </Field>
        </div>
      )}

      {/* 5. Checkbox Declaro ser sócio/proprietário */}
      <div>
        <Checkbox
          label="Declaro ser sócio/proprietário da empresa"
          checked={data.checkDeclaracaoSocioProprietario}
          onChange={v => onChange({ checkDeclaracaoSocioProprietario: v })}
        />
      </div>

      {/* 6. CNPJ da Empresa (se checkbox marcado) */}
      {showCnpjEmpresa && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="CNPJ da Empresa" required error={errors.cnpjEmpresaOcupacao}>
            <Input
              placeholder="00.000.000/0000-00"
              value={data.cnpjEmpresaOcupacao}
              onChange={e => onChange({ cnpjEmpresaOcupacao: applyCnpjMask(e.target.value) })}
              error={!!errors.cnpjEmpresaOcupacao}
            />
          </Field>
        </div>
      )}

      {/* 7. Classificação do Investidor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Classificação do Investidor" required error={errors.classificacaoInvestidor}>
          <Select
            value={data.classificacaoInvestidor}
            onChange={e => onChange({ classificacaoInvestidor: e.target.value })}
            options={CLASSIFICACAO_INVESTIDOR_OPTIONS}
            placeholder="Selecione..."
            error={!!errors.classificacaoInvestidor}
          />
        </Field>
      </div>

      {/* 8. Patrimônio Líquido | 9. Rendimento Mensal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Patrimônio Líquido (R$)" required error={errors.patrimonioLiquido}>
          <MonetaryInput
            value={data.patrimonioLiquido}
            onChange={v => onChange({ patrimonioLiquido: v })}
            placeholder="R$ 0,00"
            error={!!errors.patrimonioLiquido}
          />
        </Field>
        <Field label="Rendimento Mensal (R$)" required error={errors.rendimentoMensal}>
          <MonetaryInput
            value={data.rendimentoMensal}
            onChange={v => onChange({ rendimentoMensal: v })}
            placeholder="R$ 0,00"
            error={!!errors.rendimentoMensal}
          />
        </Field>
      </div>

      {/* 10. Porcentagem Mensal para Investir | 11. Patrimônio Líquido em Investimentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Porcentagem Mensal para Investir (%)" required error={errors.porcentagemMensalInvestir} hint="Entre 0 e 100">
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            placeholder="Ex: 30"
            value={data.porcentagemMensalInvestir}
            onChange={e => onChange({ porcentagemMensalInvestir: e.target.value })}
            error={!!errors.porcentagemMensalInvestir}
          />
        </Field>
        <Field label="Patrimônio Líquido em Investimentos (R$)" required error={errors.patrimonioLiquidoInvestimentos}>
          <MonetaryInput
            value={data.patrimonioLiquidoInvestimentos}
            onChange={v => onChange({ patrimonioLiquidoInvestimentos: v })}
            placeholder="R$ 0,00"
            error={!!errors.patrimonioLiquidoInvestimentos}
          />
        </Field>
      </div>

      {/* 12. Origem do Patrimônio (input text livre) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Origem do Patrimônio" required error={errors.origemPatrimonio}>
          <Input
            placeholder="Ex: Salário, herança, investimentos..."
            value={data.origemPatrimonio}
            onChange={e => onChange({ origemPatrimonio: e.target.value })}
            error={!!errors.origemPatrimonio}
          />
        </Field>
      </div>

      {/* 13. Checkbox Sou pessoa publicamente exposta */}
      <div>
        <Checkbox
          label="Sou pessoa publicamente exposta"
          checked={data.checkPessoaPublicamenteExposta}
          onChange={v => onChange({ checkPessoaPublicamenteExposta: v })}
        />
      </div>

      {/* 14. Campos PPE (se checkbox marcado) - todos opcionais */}
      {data.checkPessoaPublicamenteExposta && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
          <Field label="Empresa (PPE) - Opcional" error={errors.empresaPpe}>
            <Input
              placeholder="Nome da empresa ou órgão"
              value={data.empresaPpe}
              onChange={e => onChange({ empresaPpe: e.target.value })}
            />
          </Field>
          <Field label="Cargo (PPE) - Opcional" error={errors.cargoPpe}>
            <Input
              placeholder="Cargo exercido"
              value={data.cargoPpe}
              onChange={e => onChange({ cargoPpe: e.target.value })}
            />
          </Field>
          <Field label="Data de Início (PPE) - Opcional" error={errors.dataInicioPpe}>
            <Input
              type="date"
              placeholder="dd/mm/aaaa"
              value={data.dataInicioPpe}
              onChange={e => onChange({ dataInicioPpe: e.target.value })}
            />
          </Field>
          <Field label="Data de Fim (PPE) - Opcional" error={errors.dataFimPpe} hint="Deixe vazio se ainda em exercício">
            <Input
              type="date"
              placeholder="dd/mm/aaaa"
              value={data.dataFimPpe}
              onChange={e => onChange({ dataFimPpe: e.target.value })}
            />
          </Field>
        </div>
      )}
    </div>
  );
};

export default Step3Profissional;
