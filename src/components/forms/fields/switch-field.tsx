'use client';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel
} from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { useFieldContext, useFieldInvalid, type BaseFieldProps } from '@/lib/form-context';

export function SwitchField({
  label,
  description,
  required,
  compact = false
}: BaseFieldProps & { compact?: boolean }) {
  const field = useFieldContext<boolean>();
  const isInvalid = useFieldInvalid();
  const control = (
    <Switch
      id={field.name}
      name={field.name}
      checked={field.state.value}
      onCheckedChange={field.handleChange}
      aria-invalid={isInvalid}
      aria-describedby={isInvalid ? `${field.name}-error` : undefined}
    />
  );
  const fieldLabel = (
    <FieldLabel htmlFor={field.name}>
      {label}
      {required && ' *'}
    </FieldLabel>
  );

  return (
    <Field orientation={compact ? 'vertical' : 'horizontal'} data-invalid={isInvalid}>
      {compact ? (
        <>
          <div className='flex items-center gap-3'>
            {fieldLabel}
            {control}
          </div>
          {description && <FieldDescription>{description}</FieldDescription>}
          {isInvalid && <FieldError id={`${field.name}-error`} errors={field.state.meta.errors} />}
        </>
      ) : (
        <>
          <FieldContent>
            {fieldLabel}
            {description && <FieldDescription>{description}</FieldDescription>}
            {isInvalid && (
              <FieldError id={`${field.name}-error`} errors={field.state.meta.errors} />
            )}
          </FieldContent>
          {control}
        </>
      )}
    </Field>
  );
}
