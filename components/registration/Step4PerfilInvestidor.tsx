
import React, { useEffect } from 'react';
import { SectionTitle, Divider, Field, RadioGroup } from './FormUI';
import { RegistrationFormData } from './types';

interface Props {
  data: RegistrationFormData;
  onChange: (patch: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

// ─── Perguntas XP Eleva (Consultoria / corretora XP) ─────────────────────────
const XP_ELEVA_QUESTIONS = [
  {
    key: 'objetivoInvestimentoXP' as keyof RegistrationFormData,
    label: 'Qual é seu principal objetivo de investimento?',
    options: [
      { value: '1', label: 'Preservar meu patrimônio assumindo um menor risco' },
      { value: '2', label: 'Uma combinação entre preservação e valorização do patrimônio' },
      { value: '3', label: 'Maximizar o potencial de ganho assumindo um maior risco' },
    ],
  },
  {
    key: 'tempoInvestimentoXP' as keyof RegistrationFormData,
    label: 'Por quanto tempo pretende manter os investimentos sem resgatar?',
    options: [
      { value: '1', label: 'Até 1 ano' },
      { value: '2', label: 'De 1 a 5 anos' },
      { value: '3', label: 'Mais de 5 anos' },
    ],
  },
  {
    key: 'necessidadeRecursosXP' as keyof RegistrationFormData,
    label: 'Qual é a sua necessidade dos recursos a serem investidos?',
    options: [
      { value: '1', label: 'Preciso deste dinheiro como complemento de renda' },
      { value: '2', label: 'Eventualmente posso precisar utilizar uma parte dele' },
      { value: '3', label: 'Não tenho necessidade imediata deste dinheiro' },
    ],
  },
  {
    key: 'percentualRendaXP' as keyof RegistrationFormData,
    label: 'Qual percentual da sua renda mensal será investido?',
    options: [
      { value: '1', label: 'Até 10%' },
      { value: '2', label: 'De 10% a 20%' },
      { value: '3', label: 'Acima de 20%' },
    ],
  },
  {
    key: 'reacaoPerdaXP' as keyof RegistrationFormData,
    label: 'Se seu investimento cair 20% em curto prazo, o que faria?',
    options: [
      { value: '1', label: 'Não sei o que faria' },
      { value: '2', label: 'Venderia toda a posição' },
      { value: '3', label: 'Manteria a posição' },
      { value: '4', label: 'Aumentaria a posição' },
    ],
  },
  {
    key: 'experienciaInvestimentoXP' as keyof RegistrationFormData,
    label: 'Qual a sua experiência com investimentos?',
    options: [
      { value: '1', label: 'Poupança, Fundos DI, CDB, Fundos RF' },
      { value: '2', label: 'Fundos Multimercado, Títulos Públicos, LCI, LCA' },
      { value: '3', label: 'Ações, Fundos de Ações, FII, Debêntures, Fundos Cambiais' },
      { value: '4', label: 'FIP, Derivativos (Futuros, Opções e Swaps)' },
    ],
  },
  {
    key: 'expectativaRendaXP' as keyof RegistrationFormData,
    label: 'Qual é a sua expectativa de renda futura?',
    options: [
      { value: '1', label: 'Minha renda deve diminuir (aposentadoria, mudança de emprego...)' },
      { value: '2', label: 'Minha renda deve se manter estável' },
      { value: '3', label: 'Minha renda deve aumentar (promoção, novo emprego...)' },
    ],
  },
  {
    key: 'operacoesDerivativosXP' as keyof RegistrationFormData,
    label: 'Já realizou operações com derivativos (opções, futuros, swaps)?',
    options: [
      { value: '1', label: 'Não' },
      { value: '2', label: 'Sim' },
    ],
  },
];

// ─── Perguntas Wealth (Gestora) ───────────────────────────────────────────────
const WEALTH_QUESTIONS = [
  {
    key: 'rendaAnualWealth' as keyof RegistrationFormData,
    label: 'Qual é a sua renda anual aproximada?',
    options: [
      { value: '1', label: 'Até R$ 250 mil' },
      { value: '2', label: 'De R$ 250 mil a R$ 500 mil' },
      { value: '3', label: 'De R$ 500 mil a R$ 1,25 mi' },
      { value: '4', label: 'Acima de R$ 1,25 mi' },
    ],
  },
  {
    key: 'patrimonioLiquidoWealth' as keyof RegistrationFormData,
    label: 'Qual é o seu patrimônio líquido total?',
    options: [
      { value: '1', label: 'Até R$ 500 mil' },
      { value: '2', label: 'De R$ 500 mil a R$ 2,5 mi' },
      { value: '3', label: 'De R$ 2,5 mi a R$ 5 mi' },
      { value: '4', label: 'Acima de R$ 5 mi' },
    ],
  },
  {
    key: 'experienciaInvestimentosWealth' as keyof RegistrationFormData,
    label: 'Como você descreveria sua experiência com investimentos?',
    options: [
      { value: '1', label: 'Nenhuma experiência' },
      { value: '2', label: 'Experiência limitada (poupança, CDB)' },
      { value: '3', label: 'Boa experiência (ações, fundos)' },
      { value: '4', label: 'Experiente (derivativos, FIP)' },
    ],
  },
  {
    key: 'investimentosAnterioresWealth' as keyof RegistrationFormData,
    label: 'Quais produtos você já investiu anteriormente?',
    options: [
      { value: '1', label: 'Apenas produtos conservadores (poupança, CDB)' },
      { value: '2', label: 'Poupança + Renda Fixa (LCI, LCA, Títulos Públicos)' },
      { value: '3', label: 'Inclui Renda Variável (ações, fundos multimercado)' },
      { value: '4', label: 'Inclui todos os tipos, inclusive derivativos' },
    ],
  },
  {
    key: 'objetivoPrincipalWealth' as keyof RegistrationFormData,
    label: 'Qual é o seu objetivo principal de investimento?',
    options: [
      { value: '1', label: 'Preservar capital (não perder dinheiro)' },
      { value: '2', label: 'Gerar renda regular' },
      { value: '3', label: 'Crescimento de patrimônio' },
      { value: '4', label: 'Especulação (maximizar ganhos com alto risco)' },
    ],
  },
  {
    key: 'prazoInvestimentoWealth' as keyof RegistrationFormData,
    label: 'Qual o horizonte de tempo para os seus investimentos?',
    options: [
      { value: '1', label: 'Menos de 1 ano' },
      { value: '2', label: 'De 1 a 3 anos' },
      { value: '3', label: 'De 4 a 6 anos' },
      { value: '4', label: 'Mais de 6 anos' },
    ],
  },
  {
    key: 'reacaoQuedaWealth' as keyof RegistrationFormData,
    label: 'Se sua carteira cair 15% em um mês, o que faria?',
    options: [
      { value: '1', label: 'Venderia tudo imediatamente' },
      { value: '2', label: 'Venderia uma parte para reduzir o risco' },
      { value: '3', label: 'Manteria os investimentos' },
      { value: '4', label: 'Compraria mais, aproveitando o preço baixo' },
    ],
  },
  {
    key: 'percentualPerdaWealth' as keyof RegistrationFormData,
    label: 'Qual percentual máximo de perda você conseguiria tolerar em um ano?',
    options: [
      { value: '1', label: 'Até 5%' },
      { value: '2', label: 'Até 10%' },
      { value: '3', label: 'Até 20%' },
      { value: '4', label: 'Acima de 20%' },
    ],
  },
  {
    key: 'necessidadeLiquidezWealth' as keyof RegistrationFormData,
    label: 'Você precisa que seus investimentos tenham liquidez imediata?',
    options: [
      { value: '1', label: 'Sim, preciso de liquidez' },
      { value: '2', label: 'Não, posso manter o investimento por mais tempo' },
    ],
  },
];

// ─── Perfil calculado Wealth ──────────────────────────────────────────────────
const calcWealthProfile = (data: RegistrationFormData): string => {
  const vals = [
    data.rendaAnualWealth, data.patrimonioLiquidoWealth, data.experienciaInvestimentosWealth,
    data.investimentosAnterioresWealth, data.objetivoPrincipalWealth, data.prazoInvestimentoWealth,
    data.reacaoQuedaWealth, data.percentualPerdaWealth, data.necessidadeLiquidezWealth,
  ].map(v => parseInt(v) || 0);

  if (!vals.some(Boolean)) return '';
  const total = vals.reduce((a, b) => a + b, 0);
  const max = vals.length * 4;
  const pct = total / max;
  if (pct < 0.25) return 'Conservador';
  if (pct < 0.50) return 'Moderado';
  if (pct < 0.75) return 'Arrojado';
  return 'Agressivo';
};

// ─── Perfil calculado XP Eleva ────────────────────────────────────────────────
const calcXpProfile = (data: RegistrationFormData): string => {
  const vals = [
    data.objetivoInvestimentoXP, data.tempoInvestimentoXP, data.necessidadeRecursosXP,
    data.percentualRendaXP, data.reacaoPerdaXP, data.experienciaInvestimentoXP,
    data.expectativaRendaXP, data.operacoesDerivativosXP,
  ].map(v => parseInt(v) || 0);

  if (!vals.some(Boolean)) return '';
  const total = vals.reduce((a, b) => a + b, 0);
  if (total <= 10) return 'Conservador';
  if (total <= 18) return 'Moderado';
  if (total <= 24) return 'Arrojado';
  return 'Agressivo';
};

const PROFILE_COLORS: Record<string, string> = {
  Conservador: 'bg-blue-100 text-blue-800 border-blue-200',
  Moderado: 'bg-green-100 text-green-800 border-green-200',
  Arrojado: 'bg-amber-100 text-amber-800 border-amber-200',
  Agressivo: 'bg-red-100 text-red-800 border-red-200',
};

const Step4PerfilInvestidor: React.FC<Props> = ({ data, onChange, errors }) => {
  const isGestora = data.modeloAtendimento === '1';
  const questions = isGestora ? WEALTH_QUESTIONS : XP_ELEVA_QUESTIONS;

  // Recalcular perfil automaticamente
  useEffect(() => {
    const perfil = isGestora ? calcWealthProfile(data) : calcXpProfile(data);
    if (perfil && perfil !== data.perfilDeInvestidor) {
      onChange({ perfilDeInvestidor: perfil });
    }
  }, [
    data.objetivoInvestimentoXP, data.tempoInvestimentoXP, data.necessidadeRecursosXP,
    data.percentualRendaXP, data.reacaoPerdaXP, data.experienciaInvestimentoXP,
    data.expectativaRendaXP, data.operacoesDerivativosXP,
    data.rendaAnualWealth, data.patrimonioLiquidoWealth, data.experienciaInvestimentosWealth,
    data.investimentosAnterioresWealth, data.objetivoPrincipalWealth, data.prazoInvestimentoWealth,
    data.reacaoQuedaWealth, data.percentualPerdaWealth, data.necessidadeLiquidezWealth,
    isGestora,
  ]);

  const totalAnswered = questions.filter(q => (data[q.key] as string) !== '').length;
  const pct = Math.round((totalAnswered / questions.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle className="mb-0">
          Suitability – {isGestora ? 'Wealth (Gestora)' : 'XP Eleva (Consultoria)'}
        </SectionTitle>
        <span className="text-xs text-zinc-500 font-mono">
          {totalAnswered}/{questions.length} respondidas
        </span>
      </div>

      {/* Barra de progresso do questionário */}
      <div className="w-full bg-zinc-100 rounded-full h-1.5">
        <div
          className="bg-zinc-900 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Perfil calculado */}
      {data.perfilDeInvestidor && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm ${PROFILE_COLORS[data.perfilDeInvestidor] || ''}`}>
          <span>Perfil calculado:</span>
          <span className="text-base font-bold">{data.perfilDeInvestidor}</span>
        </div>
      )}

      {errors.perfilDeInvestidor && (
        <p className="text-xs text-red-500">{errors.perfilDeInvestidor}</p>
      )}

      <Divider />

      {/* Perguntas */}
      <div className="space-y-8">
        {questions.map((q, idx) => (
          <Field
            key={q.key as string}
            label={`${idx + 1}. ${q.label}`}
            required
            error={errors[q.key as string]}
          >
            <div className="mt-2 space-y-2">
              {q.options.map(opt => {
                const isSelected = (data[q.key] as string) === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer
                      transition-all duration-150 text-sm
                      ${isSelected
                        ? 'bg-zinc-900 border-zinc-900 text-white'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50'}
                    `}
                  >
                    <div className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                      ${isSelected ? 'border-white' : 'border-zinc-300'}
                    `}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <input
                      type="radio"
                      name={q.key as string}
                      value={opt.value}
                      checked={isSelected}
                      onChange={() => onChange({ [q.key]: opt.value })}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
          </Field>
        ))}
      </div>
    </div>
  );
};

export default Step4PerfilInvestidor;
