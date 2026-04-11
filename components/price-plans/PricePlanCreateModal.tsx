'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useCreatePricePlan } from '@/lib/queries/usePricePlans'
import type { CreatePricePlanBody } from '@/types/price-plan.types'

// ---------------------------------------------------------------------------
// Schema (inputs are text/number strings coming from the form)
// ---------------------------------------------------------------------------
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  markup_retail: z.number().min(0, 'Must be ≥ 0').max(1000, 'Must be ≤ 1000'),
  markup_vds: z.number().min(0, 'Must be ≥ 0').max(1000, 'Must be ≤ 1000'),
  markup_wholesale: z.number().min(0, 'Must be ≥ 0').max(1000, 'Must be ≤ 1000'),
})

type FormValues = z.infer<typeof schema>

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface Props {
  open: boolean
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function PricePlanCreateModal({ open, onClose }: Props) {
  const { mutateAsync, isPending } = useCreatePricePlan()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      markup_retail: 0,
      markup_vds: 0,
      markup_wholesale: 0,
    },
  })

  // Reset form whenever modal is opened
  useEffect(() => {
    if (open) reset()
  }, [open, reset])

  async function onSubmit(values: FormValues) {
    const body: CreatePricePlanBody = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
      aoa_markup_pct_retail: values.markup_retail / 100,
      aoa_markup_pct_vds: values.markup_vds / 100,
      aoa_markup_pct_wholesale: values.markup_wholesale / 100,
    }

    try {
      await mutateAsync(body)
      toast.success(`Price plan "${body.name}" created.`)
      onClose()
    } catch (err: unknown) {
      const msg =
        (err as { status?: number })?.status === 409
          ? 'A plan with this name already exists.'
          : 'Failed to create price plan. Please try again.'
      if ((err as { status?: number })?.status === 409) {
        setError('name', { message: 'A plan with this name already exists.' })
      }
      toast.error(msg)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Create Price Plan
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="e.g. Standard"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Optional description"
              className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>

          {/* Markups */}
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { key: 'markup_retail', label: 'Retail %' },
                { key: 'markup_vds', label: 'VDS %' },
                { key: 'markup_wholesale', label: 'Wholesale %' },
              ] as const
            ).map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  {label}
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register(key, { valueAsNumber: true })}
                  className="w-full rounded-lg border border-neutral-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                />
                {errors[key] && (
                  <p className="mt-0.5 text-xs text-red-500">{errors[key]?.message}</p>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Creating…' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
