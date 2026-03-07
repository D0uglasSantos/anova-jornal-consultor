
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Field, Input, Select, SectionTitle } from './FormUI';
import { RegistrationFormData, Representative, TIPO_VINCULO_OPTIONS } from './types';
import { applyCpfMask, applyPhoneMask } from './FormUI';

interface Props {
  data: RegistrationFormData;
  onChange: (patch: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

const StepCNPJ_Representante: React.FC<Props> = ({ data, onChange, errors }) => {
  const representantes = data.representantes;

  const updateRep = (idx: number, patch: Partial<Representative>) => {
    const updated = representantes.map((r, i) =>
      i === idx ? { ...r, ...patch } : r
    );
    onChange({ representantes: updated });
  };

  const addRep = () => {
    onChange({
      representantes: [
        ...representantes,
        { cpf: '', nome: '', email: '', telefone: '', tipoVinculo: '' },
      ],
    });
  };

  const removeRep = (idx: number) => {
    if (representantes.length === 1) return;
    onChange({ representantes: representantes.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle className="mb-0">Representantes Legais</SectionTitle>
        <button
          type="button"
          onClick={addRep}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-lg border border-zinc-200 hover:border-zinc-400"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar representante
        </button>
      </div>

      <p className="text-sm text-zinc-500">
        Informe os dados de todos os representantes legais da empresa que terão vínculo com a conta.
      </p>

      <div className="space-y-6">
        {representantes.map((rep, idx) => (
          <div key={idx} className="p-5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-900">
                Representante {idx + 1}
              </h4>
              {representantes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRep(idx)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Nome Completo"
                required
                error={errors[`representante_${idx}_nome`]}
                className="md:col-span-2"
              >
                <Input
                  placeholder="Nome completo do representante"
                  value={rep.nome}
                  onChange={e => updateRep(idx, { nome: e.target.value })}
                  error={!!errors[`representante_${idx}_nome`]}
                />
              </Field>

              <Field label="CPF" required error={errors[`representante_${idx}_cpf`]}>
                <Input
                  placeholder="000.000.000-00"
                  value={rep.cpf}
                  onChange={e => updateRep(idx, { cpf: applyCpfMask(e.target.value) })}
                  error={!!errors[`representante_${idx}_cpf`]}
                />
              </Field>

              <Field label="Tipo de Vínculo" required error={errors[`representante_${idx}_tipoVinculo`]}>
                <Select
                  value={rep.tipoVinculo}
                  onChange={e => updateRep(idx, { tipoVinculo: e.target.value })}
                  options={TIPO_VINCULO_OPTIONS.map(t => ({ value: t, label: t }))}
                  placeholder="Selecione..."
                  error={!!errors[`representante_${idx}_tipoVinculo`]}
                />
              </Field>

              <Field label="E-mail" required error={errors[`representante_${idx}_email`]}>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={rep.email}
                  onChange={e => updateRep(idx, { email: e.target.value })}
                  error={!!errors[`representante_${idx}_email`]}
                />
              </Field>

              <Field label="Telefone" required error={errors[`representante_${idx}_telefone`]}>
                <Input
                  placeholder="(00) 00000-0000"
                  value={rep.telefone}
                  onChange={e => updateRep(idx, { telefone: applyPhoneMask(e.target.value) })}
                  error={!!errors[`representante_${idx}_telefone`]}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepCNPJ_Representante;
