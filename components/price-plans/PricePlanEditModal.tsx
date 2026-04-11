'use client'

import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUpdatePricePlan } from '@/lib/queries/usePricePlans'
import type { PricePlan } from '@/types/price-plan.types'

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  markup_retail: z.number().min(0, 'Must be ≥ 0').max(1000, 'Must be ≤ 1000'),
  markup_vds: z.number().min(0, 'Must be ≥ 0').max(1000, 'Must be ≤ 1000'),
  markup_wholesale: z.number().min(0, 'Must be ≥ 0').max(1000, 'Must be ≤ 1000'),
  active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

/** Decimal → display % (0.35 → 35) */
const toDisplay = (v: number) => Math.round(v * 100 * 100) / 100

/** Display % → decimal (35 → 0.35) */
const toDecimal = (v: number) => v / 100

// ── Props ─────────────────────────────────────────────────────────────────────
interface PricePlanEditModalProps {
  plan: PricePlan | null
  onClose: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PricePlanEditModal({ plan, onClose }: PricePlanEditModalProps) {
  const isOpen = plan !== null
  const { mutateAsync, isPending: isMutating } = useUpdatePricePlan()
  const [isPending, startTransition] = useTransition()
  const saving = isPending || isMutating

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      markup_retail: 0,
      markup_vds: 0,
      markup_wholesale: 0,
      active: true,
    },
  })

  // Reset form values whenever the selected plan changes
  useEffect(() => {
    if (plan) {
      form.reset({
        name: plan.name,
        description: plan.description ?? '',
        markup_retail: toDisplay(plan.aoa_markup_pct_retail),
        markup_vds: toDisplay(plan.aoa_markup_pct_vds),
        markup_wholesale: toDisplay(plan.aoa_markup_pct_wholesale),
        active: plan.active,
      })
    }
  }, [plan, form])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  function onSubmit(values: FormValues) {
    if (!plan) return
    startTransition(async () => {
      try {
        await mutateAsync({
          id: plan.id,
          body: {
            name: values.name.trim(),
            description: values.description?.trim() || null,
            aoa_markup_pct_retail: toDecimal(values.markup_retail),
            aoa_markup_pct_vds: toDecimal(values.markup_vds),
            aoa_markup_pct_wholesale: toDecimal(values.markup_wholesale),
            active: values.active,
          },
        })
        toast.success(`"${values.name}" updated`)
        onClose()
      } catch (err: unknown) {
        const is409 = (err as { status?: number })?.status === 409
        if (is409) {
          form.setError('name', { message: 'A plan with this name already exists.' })
        }
        toast.error(is409 ? 'Name already taken.' : (err instanceof Error ? err.message : 'Failed to save'))
      }
    })
  }

  if (!isOpen) return null

  const activeValue = form.watch('active')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label={`Edit price plan: ${plan?.name}`}
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold leading-tight">Edit Price Plan</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{plan?.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label htmlFor="edit-name" className="block text-sm font-medium leading-none">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="edit-name"
              type="text"
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 aria-invalid:border-destructive"
              aria-invalid={!!form.formState.errors.name}
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="edit-description" className="block text-sm font-medium leading-none">
              Description
            </label>
            <textarea
              id="edit-description"
              rows={2}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              {...form.register('description')}
            />
          </div>

          {/* Markups */}
          <MarkupField label="AOA Markup Retail %" id="markup_retail" name="markup_retail" form={form} error={form.formState.errors.markup_retail?.message} />
          <MarkupField label="AOA Markup VDS %" id="markup_vds" name="markup_vds" form={form} error={form.formState.errors.markup_vds?.message} />
          <MarkupField label="AOA Markup Wholesale %" id="markup_wholesale" name="markup_wholesale" form={form} error={form.formState.errors.markup_wholesale?.message} />

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Inactive plans cannot be assigned to new stores.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={activeValue}
              onClick={() => form.setValue('active', !activeValue)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                activeValue ? 'bg-primary' : 'bg-input'
              }`}
            >
              <span
                className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                  activeValue ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Field helper ──────────────────────────────────────────────────────────────
interface MarkupFieldProps {
  label: string
  id: string
  name: 'markup_retail' | 'markup_vds' | 'markup_wholesale'
  form: ReturnType<typeof useForm<FormValues>>
  error?: string
}

function MarkupField({ label, id, name, form, error }: MarkupFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium leading-none">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          step="0.01"
          min={0}
          max={1000}
          className="w-full rounded-md border border-input bg-background px-3 py-1.5 pr-8 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 aria-invalid:border-destructive"
          aria-invalid={!!error}
          {...form.register(name, { valueAsNumber: true })}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
          %
        </span>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
