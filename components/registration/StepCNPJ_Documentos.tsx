
import React from 'react';
import { SectionTitle, Divider, Checkbox, FileUpload } from './FormUI';
import { RegistrationFormData } from './types';

interface Props {
  data: RegistrationFormData;
  onChange: (patch: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

const StepCNPJ_Documentos: React.FC<Props> = ({ data, onChange, errors }) => (
  <div className="space-y-6">
    <SectionTitle>Documentos da Empresa</SectionTitle>
    <p className="text-sm text-zinc-500">
      Envie os documentos em formato PDF, JPG ou PNG. Tamanho máximo de 5MB por arquivo.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FileUpload
        label="Cópia Simples do Contrato Social"
        required
        value={data.copiaContratoSocial}
        onChange={file => onChange({ copiaContratoSocial: file })}
        error={errors.copiaContratoSocial}
        hint="Contrato social ou estatuto atualizado"
      />

      <FileUpload
        label="Cartão CNPJ"
        required
        value={data.cartaoCnpj}
        onChange={file => onChange({ cartaoCnpj: file })}
        error={errors.cartaoCnpj}
        hint="Cartão CNPJ atualizado (Receita Federal)"
      />

      <FileUpload
        label="RG do Sócio / Representante"
        required
        value={data.rgSocio}
        onChange={file => onChange({ rgSocio: file })}
        error={errors.rgSocio}
        hint="RG ou CNH do sócio principal"
      />

      <FileUpload
        label="Procuração"
        value={data.procuracao}
        onChange={file => onChange({ procuracao: file })}
        hint="Apenas se houver procuração (opcional)"
      />
    </div>

    <Divider />

    <SectionTitle>Declarações e Ciência</SectionTitle>
    <div className="space-y-4">
      <Checkbox
        label="Declaro que autorizo o armazenamento e uso dos dados da empresa para fins cadastrais e operacionais conforme a LGPD."
        checked={data.aceiteArmazenamentoDados}
        onChange={v => onChange({ aceiteArmazenamentoDados: v })}
        error={errors.aceiteArmazenamentoDados}
      />
      <Checkbox
        label="Estou ciente de que os documentos enviados são de responsabilidade da empresa e devem ser legíveis e autênticos."
        checked={data.cienteEnvioDocumentos}
        onChange={v => onChange({ cienteEnvioDocumentos: v })}
        error={errors.cienteEnvioDocumentos}
      />
      <Checkbox
        label="Estou ciente dos riscos inerentes às operações nos mercados financeiro e de capitais."
        checked={data.cienteRiscosOperacao}
        onChange={v => onChange({ cienteRiscosOperacao: v })}
        error={errors.cienteRiscosOperacao}
      />
      <Checkbox
        label="Estou ciente das políticas de administração e gestão da carteira de investimentos."
        checked={data.cientePoliticasAdministracao}
        onChange={v => onChange({ cientePoliticasAdministracao: v })}
        error={errors.cientePoliticasAdministracao}
      />
      <Checkbox
        label="Confirmo que o perfil de investidor definido no questionário corresponde à real situação financeira e objetivos da empresa."
        checked={data.cientePerfilRisco}
        onChange={v => onChange({ cientePerfilRisco: v })}
        error={errors.cientePerfilRisco}
      />

      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <Checkbox
          label={
            <span className="font-semibold text-red-800">
              Declaro que a empresa não tem vínculos com atividades de lavagem de dinheiro, financiamento ao terrorismo ou qualquer outra atividade ilícita (Lei 9.613/98 e Circular Bacen 3.978/20).
            </span>
          }
          checked={data.cienciaCombateTerrorismo}
          onChange={v => onChange({ cienciaCombateTerrorismo: v })}
          error={errors.cienciaCombateTerrorismo}
        />
      </div>
    </div>
  </div>
);

export default StepCNPJ_Documentos;
