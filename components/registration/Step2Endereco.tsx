
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Field, Input, Select, SectionTitle, Divider, applyCepMask, applyPhoneMask, stripMask } from './FormUI';
import { RegistrationFormData, ESTADOS_BR } from './types';

interface Props {
  data: RegistrationFormData;
  onChange: (patch: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

const Step2Endereco: React.FC<Props> = ({ data, onChange, errors }) => {
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');

  const fetchCep = async (cep: string) => {
    const digits = stripMask(cep);
    if (digits.length !== 8) return;
    setLoadingCep(true);
    setCepError('');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const json = await res.json();
      if (json.erro) {
        setCepError('CEP não encontrado.');
        return;
      }
      onChange({
        endereco: json.logradouro || '',
        bairro: json.bairro || '',
        cidade: json.localidade || '',
        estado: json.uf || '',
      });
    } catch {
      setCepError('Erro ao buscar CEP.');
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle>Endereço</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* CEP */}
        <Field label="CEP" required error={errors.cep || cepError}>
          <div className="relative">
            <Input
              placeholder="00000-000"
              value={data.cep}
              onChange={e => {
                const masked = applyCepMask(e.target.value);
                onChange({ cep: masked });
                if (stripMask(masked).length === 8) fetchCep(masked);
              }}
              error={!!errors.cep || !!cepError}
            />
            {loadingCep && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-zinc-400" />
            )}
          </div>
        </Field>

        {/* País */}
        <Field label="País" required error={errors.pais}>
          <Input
            placeholder="Brasil"
            value={data.pais}
            onChange={e => onChange({ pais: e.target.value })}
            error={!!errors.pais}
          />
        </Field>

        {/* Endereço */}
        <Field label="Logradouro" required error={errors.endereco} className="md:col-span-2">
          <Input
            placeholder="Rua, Avenida, etc."
            value={data.endereco}
            onChange={e => onChange({ endereco: e.target.value })}
            error={!!errors.endereco}
          />
        </Field>

        {/* Número */}
        <Field label="Número" error={errors.numero} hint="Deixe em branco se não houver">
          <Input
            placeholder="Ex: 123"
            value={data.numero}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '');
              onChange({ numero: val });
            }}
          />
        </Field>

        {/* Complemento */}
        <Field label="Complemento" error={errors.complemento}>
          <Input
            placeholder="Apto, sala, bloco... (opcional)"
            value={data.complemento}
            onChange={e => onChange({ complemento: e.target.value })}
          />
        </Field>

        {/* Bairro */}
        <Field label="Bairro" required error={errors.bairro}>
          <Input
            placeholder="Bairro"
            value={data.bairro}
            onChange={e => onChange({ bairro: e.target.value })}
            error={!!errors.bairro}
          />
        </Field>

        {/* Cidade */}
        <Field label="Cidade" required error={errors.cidade}>
          <Input
            placeholder="Cidade"
            value={data.cidade}
            onChange={e => onChange({ cidade: e.target.value })}
            error={!!errors.cidade}
          />
        </Field>

        {/* Estado */}
        <Field label="Estado" required error={errors.estado}>
          <Select
            value={data.estado}
            onChange={e => onChange({ estado: e.target.value })}
            options={ESTADOS_BR.map(uf => ({ value: uf, label: uf }))}
            placeholder="UF"
            error={!!errors.estado}
          />
        </Field>
      </div>

      <Divider />

      {/* Contato */}
      <SectionTitle>Contato</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Celular" required error={errors.celular}>
          <Input
            placeholder="(00) 00000-0000"
            value={data.celular}
            onChange={e => onChange({ celular: applyPhoneMask(e.target.value) })}
            error={!!errors.celular}
          />
        </Field>

        <Field label="Telefone" error={errors.telefone} hint="Opcional">
          <Input
            placeholder="(00) 0000-0000"
            value={data.telefone}
            onChange={e => onChange({ telefone: applyPhoneMask(e.target.value) })}
          />
        </Field>

        <Field label="E-mail" required error={errors.email}>
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={data.email}
            onChange={e => onChange({ email: e.target.value })}
            error={!!errors.email}
          />
        </Field>

        <Field label="Confirmar E-mail" required error={errors.confirmaEmail}>
          <Input
            type="email"
            placeholder="Repita o e-mail"
            value={data.confirmaEmail}
            onChange={e => onChange({ confirmaEmail: e.target.value })}
            error={!!errors.confirmaEmail}
          />
        </Field>
      </div>
    </div>
  );
};

export default Step2Endereco;
