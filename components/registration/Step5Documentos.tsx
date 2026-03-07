
import React from 'react';
import { SectionTitle, Divider, Checkbox, FileUpload } from './FormUI';
import { RegistrationFormData } from './types';

interface Props {
  data: RegistrationFormData;
  onChange: (patch: Partial<RegistrationFormData>) => void;
  errors: Record<string, string>;
}

const TERMS = [
  {
    key: 'aceiteArmazenamentoDados' as keyof RegistrationFormData,
    label: 'Declaro que autorizo o armazenamento e uso dos meus dados para fins cadastrais e operacionais conforme a LGPD.',
  },
  {
    key: 'cienteEnvioDocumentos' as keyof RegistrationFormData,
    label: 'Estou ciente de que os documentos enviados são de minha responsabilidade e devem ser legíveis e autênticos.',
  },
  {
    key: 'cienteRiscosOperacao' as keyof RegistrationFormData,
    label: 'Estou ciente dos riscos inerentes às operações nos mercados financeiro e de capitais.',
  },
  {
    key: 'cientePoliticasAdministracao' as keyof RegistrationFormData,
    label: 'Estou ciente das políticas de administração e gestão da carteira de investimentos.',
  },
  {
    key: 'cientePerfilRisco' as keyof RegistrationFormData,
    label: 'Confirmo que o perfil de investidor definido no questionário corresponde à minha real situação financeira e objetivos.',
  },
];

const Step5Documentos: React.FC<Props> = ({ data, onChange, errors }) => (
  <div className="space-y-6">
    <SectionTitle>Upload de Documentos</SectionTitle>
    <p className="text-sm text-zinc-500">
      Envie os documentos em formato PDF, JPG ou PNG. Tamanho máximo de 5MB por arquivo.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FileUpload
        label="Documento de Identificação (RG/CNH)"
        required
        value={data.documentoIdentificacao}
        onChange={file => onChange({ documentoIdentificacao: file })}
        error={errors.documentoIdentificacao}
        hint="RG frente e verso ou CNH"
      />

      <FileUpload
        label="Comprovante de Residência"
        required
        value={data.comprovanteResidencia}
        onChange={file => onChange({ comprovanteResidencia: file })}
        error={errors.comprovanteResidencia}
        hint="Conta de água, luz, gás, telefone ou banco (últimos 90 dias)"
      />
    </div>

    <Divider />

    <SectionTitle>Declarações e Aceites</SectionTitle>
    <div className="space-y-4">
      {TERMS.map(term => (
        <Checkbox
          key={term.key as string}
          label={term.label}
          checked={data[term.key] as boolean}
          onChange={v => onChange({ [term.key]: v })}
          error={errors[term.key as string]}
        />
      ))}

      <div className="pt-2 border-t border-zinc-100">
        <Checkbox
          label={
            <span>
              <span className="font-semibold text-amber-700">Opcional:</span> Me autodeclaro como investidor arrojado e tenho ciência dos riscos adicionais desta classificação.
            </span>
          }
          checked={data.autodeclaroArrojado}
          onChange={v => onChange({ autodeclaroArrojado: v })}
        />
      </div>
    </div>
  </div>
);

export default Step5Documentos;
