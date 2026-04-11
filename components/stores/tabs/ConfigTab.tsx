'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import type { Store } from '@/types/store.types'
import type { BillingPlan } from '@/types/billing.types'
import { updateStore, assignPlan, assignPricePlan } from '@/lib/actions/store'
import { useActivePricePlans } from '@/lib/queries/usePricePlans'
import ConfirmModal from '@/components/common/ConfirmModal'

// ── Zod schema ──────────────────────────────────────────────────────────────

const configSchema = z.object({
  merchant_markup_pct_retail: z.number().min(0).max(1000),
  merchant_markup_pct_vds: z.number().min(0).max(1000),
  merchant_markup_pct_wholesale: z.number().min(0).max(1000),
  push_retail: z.boolean(),
  push_vds: z.boolean(),
  use_auto_pricing: z.boolean(),
  auto_shipping_profiles: z.boolean(),
  max_retail: z.number().int().min(0).nullable(),
  max_vds: z.number().int().min(0).nullable(),
  min_brand_products: z.number().int().min(0),
  retail_categories: z.string(),
  excluded_categories: z.string(),
  retail_brands: z.string(),
  excluded_brands: z.string(),
})

type ConfigFormValues = z.infer<typeof configSchema>

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Display: decimal → % (0.35 → "35") */
function decToDisplay(val: number): number {
  return Math.round(val * 100)
}
/** Submit: % → decimal (35 → 0.35) */
function displayToDec(val: number): number {
  return val / 100
}

function arrToStr(arr: string[]): string {
  return arr.join(', ')
}
function strToArr(s: string): string[] {
  return s
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

// ── Component ────────────────────────────────────────────────────────────────

interface ConfigTabProps {
  store: Store
  plans: BillingPlan[]
}

export default function ConfigTab({ store, plans }: ConfigTabProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedPlanId, setSelectedPlanId] = useState<number>(store.subscription_plan_id ?? 0)
  const [isPlanPending, startPlanTransition] = useTransition()

  // AOA price plan assignment
  const { data: activePricePlans = [] } = useActivePricePlans()
  const [selectedPricePlanId, setSelectedPricePlanId] = useState<number>(store.price_plan_id ?? 0)
  const [confirmPricePlanOpen, setConfirmPricePlanOpen] = useState(false)
  const [isPricePlanPending, startPricePlanTransition] = useTransition()

  // Safe typed accessors for the untyped sync_config record
  const sc = store.sync_config
  const scBool = (key: string, fallback: boolean) => {
    const v = sc?.[key]; return typeof v === 'boolean' ? v : fallback
  }
  const scNum = (key: string, fallback: number) => {
    const v = sc?.[key]; return typeof v === 'number' ? v : fallback
  }
  const scNumNull = (key: string): number | null => {
    const v = sc?.[key]; return typeof v === 'number' ? v : null
  }
  const scStrArr = (key: string): string[] => {
    const v = sc?.[key]; return Array.isArray(v) ? (v as string[]) : []
  }

  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      merchant_markup_pct_retail: decToDisplay(store.merchant_markup_pct_retail),
      merchant_markup_pct_vds: decToDisplay(store.merchant_markup_pct_vds),
      merchant_markup_pct_wholesale: decToDisplay(store.merchant_markup_pct_wholesale),
      push_retail: scBool('push_retail', false),
      push_vds: scBool('push_vds', false),
      // use_auto_pricing and auto_shipping_profiles are now top-level store fields,
      // but sync_config may also carry them — prefer sync_config value, fall back to store
      use_auto_pricing: scBool('use_auto_pricing', store.use_auto_pricing),
      auto_shipping_profiles: scBool('auto_shipping_profiles', store.auto_shipping_profiles),
      max_retail: scNumNull('max_retail'),
      max_vds: scNumNull('max_vds'),
      min_brand_products: scNum('min_brand_products', 0),
      retail_categories: arrToStr(scStrArr('retail_categories')),
      excluded_categories: arrToStr(scStrArr('excluded_categories')),
      retail_brands: arrToStr(scStrArr('retail_brands')),
      excluded_brands: arrToStr(scStrArr('excluded_brands')),
    },
  })

  function onSubmit(values: ConfigFormValues) {
    startTransition(async () => {
      try {
        await updateStore(store.id, {
          merchant_markup_pct_retail: displayToDec(values.merchant_markup_pct_retail),
          merchant_markup_pct_vds: displayToDec(values.merchant_markup_pct_vds),
          merchant_markup_pct_wholesale: displayToDec(values.merchant_markup_pct_wholesale),
          sync_config: {
            push_retail: values.push_retail,
            push_vds: values.push_vds,
            use_auto_pricing: values.use_auto_pricing,
            auto_shipping_profiles: values.auto_shipping_profiles,
            max_retail: values.max_retail,
            max_vds: values.max_vds,
            min_brand_products: values.min_brand_products,
            retail_categories: strToArr(values.retail_categories),
            excluded_categories: strToArr(values.excluded_categories),
            retail_brands: strToArr(values.retail_brands),
            excluded_brands: strToArr(values.excluded_brands),
          },
        })
        toast.success('Store configuration saved')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save')
      }
    })
  }

  function handleAssignPlan() {
    if (!selectedPlanId) return
    startPlanTransition(async () => {
      try {
        await assignPlan(store.id, selectedPlanId)
        const plan = plans.find((p) => p.id === selectedPlanId)
        toast.success(`Plan updated to ${plan?.name ?? 'selected plan'}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to assign plan')
      }
    })
  }

  function handleConfirmAssignPricePlan() {
    if (!selectedPricePlanId) return
    startPricePlanTransition(async () => {
      try {
        await assignPricePlan(store.id, selectedPricePlanId)
        const plan = activePricePlans.find((p) => p.id === selectedPricePlanId)
        toast.success(`AOA Price Plan set to "${plan?.name ?? 'selected plan'}". Shopify reprice triggered.`)
        setConfirmPricePlanOpen(false)
      } catch (err) {
        const is409 = (err as { status?: number })?.status === 409
        toast.error(is409 ? 'That plan is no longer active.' : (err instanceof Error ? err.message : 'Failed to assign price plan'))
        setConfirmPricePlanOpen(false)
      }
    })
  }

  const { register, handleSubmit, formState: { errors } } = form

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Markups */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Merchant Markups</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(
              [
                ['merchant_markup_pct_retail', 'Retail Markup %'],
                ['merchant_markup_pct_vds', 'VDS Markup %'],
                ['merchant_markup_pct_wholesale', 'Wholesale Markup %'],
              ] as const
            ).map(([field, label]) => (
              <div key={field} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{label}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="1000"
                    {...register(field, { valueAsNumber: true })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="absolute right-3 top-2 text-sm text-muted-foreground">%</span>
                </div>
                {errors[field] && (
                  <p className="text-xs text-destructive">{errors[field]?.message}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Sync toggles */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Sync Configuration</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Toggles */}
            <div className="space-y-3">
              {(
                [
                  ['push_retail', 'Push Retail Products'],
                  ['push_vds', 'Push VDS Products'],
                  ['use_auto_pricing', 'Auto Pricing'],
                  ['auto_shipping_profiles', 'Auto Shipping Profiles'],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className="flex items-center justify-between gap-4">
                  <span className="text-sm">{label}</span>
                  <input type="checkbox" {...register(field)} className="h-4 w-4 rounded border-input accent-primary" />
                </label>
              ))}
            </div>

            {/* Number inputs */}
            <div className="space-y-3">
              {(
                ['max_retail', 'max_vds'] as const
              ).map((field) => (
                <div key={field} className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    {field === 'max_retail' ? 'Max Retail SKUs' : 'Max VDS SKUs'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register(field, {
                      setValueAs: (v: string) => v === '' || v === null ? null : Number(v),
                    })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Min Brand Products</label>
                <input
                  type="number"
                  min="0"
                  {...register('min_brand_products', { valueAsNumber: true })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Tag fields */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
            {(
              [
                ['retail_categories', 'Retail Categories'],
                ['excluded_categories', 'Excluded Categories'],
                ['retail_brands', 'Retail Brands'],
                ['excluded_brands', 'Excluded Brands'],
              ] as const
            ).map(([field, label]) => (
              <div key={field} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{label} <span className="text-muted-foreground/60">(comma-separated)</span></label>
                <input
                  type="text"
                  {...register(field)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {isPending ? 'Saving…' : 'Save Configuration'}
          </button>
        </div>
      </form>

      {/* Plan assignment */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-4">Plan Assignment</h3>
        <div className="flex items-center gap-3">
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={0} disabled>Select a plan…</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — ${p.price_usd}/mo
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={isPlanPending || !selectedPlanId}
            onClick={handleAssignPlan}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {isPlanPending ? 'Assigning…' : 'Assign Plan'}
          </button>
        </div>
      </section>

      {/* AOA Price Plan assignment */}
      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-1">AOA Price Plan</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Controls the AOA markup tier for all products on this store.
          {store.price_plan_name && (
            <> Current: <span className="font-medium text-foreground">{store.price_plan_name}</span>.</>
          )}
          &nbsp;Assigning a new plan triggers a full Shopify price reprice.
        </p>
        <div className="flex items-center gap-3">
          <select
            value={selectedPricePlanId}
            onChange={(e) => setSelectedPricePlanId(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={0} disabled>Select a price plan…</option>
            {activePricePlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedPricePlanId || isPricePlanPending}
            onClick={() => setConfirmPricePlanOpen(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            Assign Price Plan
          </button>
        </div>
      </section>

      <ConfirmModal
        open={confirmPricePlanOpen}
        title="Assign AOA Price Plan?"
        description={`Assign "${activePricePlans.find((p) => p.id === selectedPricePlanId)?.name ?? ''}" to ${store.shop_domain}? This will trigger a full Shopify price reprice across all products.`}
        confirmText="Assign & Reprice"
        loading={isPricePlanPending}
        onConfirm={handleConfirmAssignPricePlan}
        onClose={() => setConfirmPricePlanOpen(false)}
      />
    </div>
  )
}
