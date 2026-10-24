/**
 * Opsi jawaban kuesioner berbentuk kartu yang bisa diketuk penuh (DESIGN.md §7).
 * Memakai input radio/checkbox asli yang disembunyikan, sehingga keyboard (Tab, panah, Spasi)
 * dan pembaca layar bekerja seperti biasa.
 *
 * `RadioCardGroup` props:
 * - `name` (wajib), `value` (terkontrol) atau `defaultValue`, `onValueChange(value: string)`.
 * - `disabled`, `required`, `invalid` (border merah pada opsi), `className` (default `grid gap-2`;
 *   mis. `grid-cols-5` untuk skala 1–5), plus `aria-labelledby` / `aria-label` / `aria-describedby`.
 *
 * `RadioCard` props:
 * - `value` (wajib), `children` (label opsi), `description` (teks kecil), `disabled`,
 *   `hideIndicator` (tanpa bulatan, mis. tombol skala), `className`.
 *
 * `CheckboxCard` props (berdiri sendiri, untuk pilihan ganda):
 * - `checked` / `defaultChecked`, `onCheckedChange(checked: boolean)`, `onChange`, `name`, `value`,
 *   `children`, `description`, `disabled`, `invalid`, `hideIndicator`, `className`.
 */
import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const RadioCardGroupContext = React.createContext(null)

const optionCardClasses =
  "relative flex min-h-12 w-full cursor-pointer select-none items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left text-base text-foreground transition-colors duration-150 ease-out hover:border-muted-foreground/40 has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:ring-1 has-[:checked]:ring-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"

function OptionContent({ children, description, descriptionId }) {
  return (
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="font-medium leading-6">{children}</span>
      {description && (
        <span id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </span>
      )}
    </span>
  )
}

const RadioCardGroup = React.forwardRef(
  (
    {
      className,
      name,
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      required = false,
      invalid = false,
      children,
      ...props
    },
    ref
  ) => {
    const contextValue = React.useMemo(
      () => ({
        name,
        value: value === undefined || value === null ? value : String(value),
        defaultValue: defaultValue === undefined ? undefined : String(defaultValue),
        onValueChange,
        disabled,
        required,
        invalid,
      }),
      [name, value, defaultValue, onValueChange, disabled, required, invalid]
    )

    return (
      <RadioCardGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="radiogroup"
          aria-required={required || undefined}
          aria-invalid={invalid || undefined}
          className={cn("grid gap-2", className)}
          {...props}
        >
          {children}
        </div>
      </RadioCardGroupContext.Provider>
    )
  }
)
RadioCardGroup.displayName = "RadioCardGroup"

const RadioCard = React.forwardRef(
  ({ className, value, children, description, disabled = false, hideIndicator = false, id, ...props }, ref) => {
    const group = React.useContext(RadioCardGroupContext)
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const descriptionId = description ? `${inputId}-description` : undefined
    const optionValue = String(value)
    const isControlled = group?.value !== undefined

    return (
      <label
        htmlFor={inputId}
        className={cn(
          optionCardClasses,
          "group/option",
          group?.invalid && "border-danger",
          hideIndicator && "items-center justify-center text-center",
          className
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="sr-only"
          name={group?.name}
          value={optionValue}
          required={group?.required}
          disabled={disabled || group?.disabled}
          aria-describedby={descriptionId}
          {...(isControlled
            ? { checked: group.value === optionValue }
            : { defaultChecked: group?.defaultValue === optionValue })}
          onChange={(event) => {
            if (event.target.checked) {
              group?.onValueChange?.(optionValue)
            }
          }}
          {...props}
        />
        {!hideIndicator && (
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-input bg-card transition-colors group-has-[:checked]/option:border-primary"
          >
            <span className="size-2.5 scale-0 rounded-full bg-primary transition-transform duration-150 group-has-[:checked]/option:scale-100" />
          </span>
        )}
        {hideIndicator ? (
          <span className="font-medium">{children}</span>
        ) : (
          <OptionContent description={description} descriptionId={descriptionId}>
            {children}
          </OptionContent>
        )}
      </label>
    )
  }
)
RadioCard.displayName = "RadioCard"

const CheckboxCard = React.forwardRef(
  (
    {
      className,
      children,
      description,
      invalid = false,
      hideIndicator = false,
      onChange,
      onCheckedChange,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const descriptionId = description ? `${inputId}-description` : undefined

    return (
      <label
        htmlFor={inputId}
        className={cn(
          optionCardClasses,
          "group/option",
          invalid && "border-danger",
          hideIndicator && "items-center justify-center text-center",
          className
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="sr-only"
          aria-describedby={descriptionId}
          aria-invalid={invalid || undefined}
          onChange={(event) => {
            onChange?.(event)
            onCheckedChange?.(event.target.checked)
          }}
          {...props}
        />
        {!hideIndicator && (
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[5px] border-2 border-input bg-card text-primary-foreground transition-colors group-has-[:checked]/option:border-primary group-has-[:checked]/option:bg-primary"
          >
            <Check className="size-3.5 scale-0 transition-transform duration-150 group-has-[:checked]/option:scale-100" strokeWidth={3} />
          </span>
        )}
        {hideIndicator ? (
          <span className="font-medium">{children}</span>
        ) : (
          <OptionContent description={description} descriptionId={descriptionId}>
            {children}
          </OptionContent>
        )}
      </label>
    )
  }
)
CheckboxCard.displayName = "CheckboxCard"

export { RadioCardGroup, RadioCard, CheckboxCard }
