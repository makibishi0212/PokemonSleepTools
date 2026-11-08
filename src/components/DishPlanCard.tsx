import { type Dish, dishes } from '../data/dishes.ts'
import { findIngredient } from '../data/ingredients.ts'
import { type DishPlan, validateDishPlan } from '../util/dishPlan.ts'
import ComboBox from './ComboBox.tsx'
import DraftInput from './DraftInput.tsx'

type Props = {
  plan: DishPlan
  onChange: (plan: DishPlan) => void
  onDelete: () => void
}

const getKey = (d: Dish) => d.name
const getLabel = (d: Dish) => d.nameJa
const getSearchTexts = (d: Dish) => [d.name]

function format(n: number): string {
  return n.toLocaleString('ja-JP')
}

/** One dish to cook: which dish, how many times, and the ingredients that takes. */
function DishPlanCard({ plan, onChange, onDelete }: Props) {
  const { dish, count } = validateDishPlan(plan)
  const times = count ?? 0

  return (
    <div className="box plan-card">
      <div className="dish-card-main">
        <div className="dish-card-row">
          <ComboBox
            className="dish-select"
            items={dishes}
            value={plan.dishName}
            onChange={(dishName) => onChange({ ...plan, dishName })}
            getKey={getKey}
            getLabel={getLabel}
            getSearchTexts={getSearchTexts}
            ariaLabel="料理"
            placeholder="料理名"
          />
          <div className="field has-addons mb-0">
            <div className="control">
              <DraftInput
                className={`input is-small count-input ${count === null ? 'is-danger' : ''}`}
                type="text"
                inputMode="numeric"
                aria-label="作成回数"
                aria-invalid={count === null}
                value={plan.count}
                onCommit={(value) => onChange({ ...plan, count: value })}
              />
            </div>
            <div className="control">
              <span className="button is-small is-static">回</span>
            </div>
          </div>
        </div>
        {/* Ingredients for this row (per dish x count) */}
        <p className="dish-card-ingredients">
          {dish
            ? Object.entries(dish.ingredients)
                .map(([name, n]) => `${findIngredient(name)?.nameJa ?? name} ${format(n * times)}`)
                .join('、')
            : '料理を選択してください'}
        </p>
      </div>

      <div className="plan-card-controls">
        <button type="button" className="delete" aria-label="この料理を削除" onClick={onDelete} />
      </div>
    </div>
  )
}

export default DishPlanCard
