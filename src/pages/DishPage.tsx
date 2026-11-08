import { useState } from 'react'
import DishPlanCard from '../components/DishPlanCard.tsx'
import ToolPage from '../components/ToolPage.tsx'
import { dishes, findDish } from '../data/dishes.ts'
import { findIngredient } from '../data/ingredients.ts'
import { tools } from '../routes.ts'
import { type DishPlan, parseCount, sumIngredients } from '../util/dishPlan.ts'

type Tab = 'dishes' | 'ingredients'

const tabs: readonly { value: Tab; label: string }[] = [
  { value: 'dishes', label: '作る料理' },
  { value: 'ingredients', label: '必要な食材' },
]

const INVALID = '---'

let nextId = 1

function newPlan(): DishPlan {
  return { id: nextId++, dishName: dishes[0].name, count: '1' }
}

function format(n: number): string {
  return n.toLocaleString('ja-JP')
}

/** 料理食材数計算 */
function DishPage() {
  const [tab, setTab] = useState<Tab>('dishes')
  const [plans, setPlans] = useState<DishPlan[]>(() => [newPlan()])

  const summary = sumIngredients(plans)

  const updatePlan = (updated: DishPlan) =>
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  const deletePlan = (id: number) => setPlans((prev) => prev.filter((p) => p.id !== id))
  const addPlan = () => setPlans((prev) => [...prev, newPlan()])

  return (
    <ToolPage tool={tools.dishIngredients}>
      <div className="tabs is-boxed is-small dish-tabs">
        <ul>
          {tabs.map((t) => (
            <li key={t.value} className={tab === t.value ? 'is-active' : ''}>
              <a
                href={`#${t.value}`}
                role="tab"
                aria-selected={tab === t.value}
                onClick={(e) => {
                  e.preventDefault()
                  setTab(t.value)
                }}
              >
                {t.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {tab === 'dishes' ? (
        <>
          <div className="plan-list">
            {plans.map((plan) => (
              <DishPlanCard
                key={plan.id}
                plan={plan}
                onChange={updatePlan}
                onDelete={() => deletePlan(plan.id)}
              />
            ))}
          </div>
          <button type="button" className="button is-small" aria-label="料理を追加" onClick={addPlan}>
            ＋
          </button>
        </>
      ) : (
        <>
          {/* Ingredients needed for everything, most needed first */}
          <table className="table is-narrow is-fullwidth plan-summary-table">
            <thead>
              <tr>
                <th>食材</th>
                <th className="has-text-right">個数</th>
              </tr>
            </thead>
            <tbody>
              {summary === null ? (
                <tr className="has-text-danger">
                  <td className="plan-summary-name">入力に誤りがあります</td>
                  <td className="has-text-right">{INVALID}</td>
                </tr>
              ) : summary.items.length === 0 ? (
                <tr>
                  <td className="plan-summary-name has-text-grey">なし</td>
                  <td className="has-text-right">0</td>
                </tr>
              ) : (
                summary.items.map((item) => (
                  <tr key={item.name}>
                    <td className="plan-summary-name">{findIngredient(item.name)?.nameJa ?? item.name}</td>
                    <td className="has-text-right">{format(item.count)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td>合計</td>
                <td className="has-text-right">{summary ? format(summary.total) : INVALID}</td>
              </tr>
            </tfoot>
          </table>

          {/* What is being cooked */}
          <table className="table is-narrow is-fullwidth plan-summary-table">
            <thead>
              <tr>
                <th>料理</th>
                <th className="has-text-right">回数</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => {
                const dish = findDish(plan.dishName)
                const count = parseCount(plan.count)
                return (
                  <tr key={plan.id} className={dish && count !== null ? '' : 'has-text-danger'}>
                    <td className="plan-summary-name">{dish?.nameJa ?? (plan.dishName || INVALID)}</td>
                    <td className="has-text-right">{count === null ? INVALID : format(count)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}
    </ToolPage>
  )
}

export default DishPage
