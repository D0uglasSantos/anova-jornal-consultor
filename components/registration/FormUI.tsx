
import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

// ─── Field ────────────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}
export const Field: React.FC<FieldProps> = ({ label, error, required, hint, children, className }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {hint && !error && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
    {error && (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`
        w-full px-3.5 py-2.5 rounded-lg border text-sm text-zinc-900 bg-white
        placeholder:text-zinc-400 transition-all duration-150 outline-none
        ${error
          ? 'border-red-400 ring-1 ring-red-400 focus:ring-red-500 focus:border-red-500'
          : 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900'
        }
        disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  )
);
Input.displayName = 'Input';

// ─── MonetaryInput (R$ 0,00 - formato BRL) ────────────────────────────────────
interface MonetaryInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
}
const formatMonetary = (val: string): string => {
  const num = parseFloat(val.replace(/\D/g, '')) / 100;
  if (isNaN(num)) return '';
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const parseMonetary = (val: string): string => {
  const cleaned = val.replace(/\D/g, '');
  if (!cleaned) return '';
  const num = parseInt(cleaned, 10) / 100;
  return num.toFixed(2);
};
export const MonetaryInput: React.FC<MonetaryInputProps> = ({
  value, onChange, placeholder = 'R$ 0,00', error, className = '',
}) => {
  const display = value ? formatMonetary(parseFloat(value || '0').toFixed(2)) : '';
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-400 pointer-events-none">
        R$
      </span>
      <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={display}
        onChange={e => onChange(parseMonetary(e.target.value))}
        className={`
          w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-zinc-900 bg-white
          placeholder:text-zinc-400 transition-all duration-150 outline-none
          ${error
            ? 'border-red-400 ring-1 ring-red-400 focus:ring-red-500 focus:border-red-500'
            : 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900'}
          ${className}
        `}
      />
    </div>
  );
};

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, options, placeholder, className = '', ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={`
          w-full px-3.5 py-2.5 rounded-lg border text-sm text-zinc-900 bg-white appearance-none
          transition-all duration-150 outline-none pr-9
          ${error
            ? 'border-red-400 ring-1 ring-red-400 focus:ring-red-500 focus:border-red-500'
            : 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900'
          }
          disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
    </div>
  )
);
Select.displayName = 'Select';

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      rows={3}
      className={`
        w-full px-3.5 py-2.5 rounded-lg border text-sm text-zinc-900 bg-white resize-none
        placeholder:text-zinc-400 transition-all duration-150 outline-none
        ${error
          ? 'border-red-400 ring-1 ring-red-400'
          : 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900'
        }
        ${className}
      `}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

// ─── Checkbox ─────────────────────────────────────────────────────────────────
interface CheckboxProps {
  label: string | React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}
export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, error }) => (
  <div>
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        className={`
          relative mt-0.5 w-4.5 h-4.5 rounded flex-shrink-0 border-2 transition-all duration-150
          ${checked
            ? 'bg-zinc-900 border-zinc-900'
            : 'bg-white border-zinc-300 group-hover:border-zinc-500'
          }
        `}
        style={{ width: 18, height: 18 }}
        onClick={() => onChange(!checked)}
      >
        {checked && (
          <svg className="absolute inset-0 w-full h-full p-0.5" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only"
        />
      </div>
      <span className="text-sm text-zinc-700 leading-snug">{label}</span>
    </label>
    {error && (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1 ml-7">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// ─── Radio Group ──────────────────────────────────────────────────────────────
interface RadioGroupProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  className?: string;
}
export const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onChange, name, className }) => (
  <div className={`flex flex-wrap gap-2 ${className || ''}`}>
    {options.map(opt => (
      <label
        key={opt.value}
        className={`
          flex items-center gap-2 px-3.5 py-2 rounded-lg border cursor-pointer transition-all duration-150 text-sm
          ${value === opt.value
            ? 'bg-zinc-900 border-zinc-900 text-white font-semibold'
            : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400'
          }
        `}
      >
        <input
          type="radio"
          name={name}
          value={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          className="sr-only"
        />
        {opt.label}
      </label>
    ))}
  </div>
);

// ─── Section Title ────────────────────────────────────────────────────────────
export const SectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={`text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 mt-2 ${className || ''}`}>
    {children}
  </h3>
);

// ─── Divider ─────────────────────────────────────────────────────────────────
export const Divider = () => <div className="border-t border-zinc-100 my-6" />;

// ─── Apply CPF mask ───────────────────────────────────────────────────────────
export const applyCpfMask = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// ─── Apply CNPJ mask ─────────────────────────────────────────────────────────
export const applyCnpjMask = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

// ─── Apply CEP mask ───────────────────────────────────────────────────────────
export const applyCepMask = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
};

// ─── Apply Phone mask ─────────────────────────────────────────────────────────
export const applyPhoneMask = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
};

// ─── Strip mask ───────────────────────────────────────────────────────────────
export const stripMask = (value: string) => value.replace(/\D/g, '');

// ─── Validate CPF ─────────────────────────────────────────────────────────────
export const validateCpf = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  const calc = (n: number) => {
    let sum = 0;
    for (let i = 0; i < n - 1; i++) sum += parseInt(digits[i]) * (n - i);
    const rem = (sum * 10) % 11;
    return rem === 10 || rem === 11 ? 0 : rem;
  };
  return calc(10) === parseInt(digits[9]) && calc(11) === parseInt(digits[10]);
};

// ─── Validate CNPJ ────────────────────────────────────────────────────────────
export const validateCnpj = (cnpj: string): boolean => {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;
  const calc = (n: number) => {
    let sum = 0, pos = n - 7;
    for (let i = 0; i < n; i++) {
      sum += parseInt(digits[i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };
  return calc(12) === parseInt(digits[12]) && calc(13) === parseInt(digits[13]);
};

// ─── File Upload ──────────────────────────────────────────────────────────────
interface FileUploadProps {
  label: string;
  required?: boolean;
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  hint?: string;
}
export const FileUpload: React.FC<FileUploadProps> = ({
  label, required, accept = '.pdf,.jpg,.jpeg,.png', value, onChange, error, hint
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Field label={label} required={required} error={error} hint={hint}>
      <div
        onClick={() => inputRef.current?.click()}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer
          transition-all duration-150
          ${error ? 'border-red-300 bg-red-50' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-white'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={e => onChange(e.target.files?.[0] || null)}
        />
        <div className="flex-1 min-w-0">
          {value ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-zinc-900 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-900 truncate">{value.name}</p>
                <p className="text-xs text-zinc-400">{(value.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onChange(null); }}
                className="ml-auto p-1 rounded hover:bg-zinc-200 text-zinc-500"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-zinc-200 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-600">Clique para enviar</p>
                <p className="text-xs text-zinc-400">PDF, JPG ou PNG (máx 5MB)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Field>
  );
};
