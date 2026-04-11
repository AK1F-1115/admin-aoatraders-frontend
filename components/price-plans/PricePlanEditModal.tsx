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
// Fields are in display-% format (0–1000). Converted to decimal on submit.

const schema = z.object({
  markup_retail: z.number().min(0, 'Must be ≥ 0').max(1000, 'Must be ≤ 1000'),
  markup_vds: z.number().min(0, 'Must be ≥ 0').max(1000, 'Must be ≤ 1000'),
  markup_wholesale: z.number().min(0, 'Must be ≥ 0').max(1000, 'Must be ≤ 1000'),
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
  const { mutateAsync } = useUpdatePricePlan()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      markup_retail: 0,
      markup_vds: 0,
      markup_wholesale: 0,
    },
  })

  // Reset form values whenever the selected plan changes
  useEffect(() => {
    if (plan) {
      form.reset({
        markup_retail: toDisplay(plan.aoa_markup_pct_retail),
        markup_vds: toDisplay(plan.aoa_markup_pct_vds),
        markup_wholesale: toDisplay(plan.aoa_markup_pct_wholesale),
      })
    }
  }, [plan, form])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
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
            aoa_markup_pct_retail: toDecimal(values.markup_retail),
            aoa_markup_pct_vds: toDecimal(values.markup_vds),
            aoa_markup_pct_wholesale: toDecimal(values.markup_wholesale),
          },
        })
        toast.success(`"${plan.name}" markups updated`)
        onClose()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save')
      }
    })
  }

  if (!isOpen) return null

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label={`Edit price plan: ${plan?.name}`}
    >
      {/* Panel — stop click propagation so clicks inside don't close */}
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
          <MarkupField
            label="AOA Markup Retail %"
            id="markup_retail"
            name="markup_retail"
            form={form}
            error={form.formState.errors.markup_retail?.message}
          />
          <MarkupField
            label="AOA Markup VDS %"
            id="markup_vds"
            name="markup_vds"
            form={form}
            error={form.formState.errors.markup_vds?.message}
          />
          <MarkupField
            label="AOA Markup Wholesale %"
            id="markup_wholesale"
            name="markup_wholesale"
            form={form}
            error={form.formState.errors.markup_wholesale?.message}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save changes'}
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
  name: keyof FormValues
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
