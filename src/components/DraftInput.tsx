import { type InputHTMLAttributes, useState } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  /** Committed value */
  value: string
  /** Called with the new value when editing finishes (blur or Enter) */
  onCommit: (value: string) => void
}

/**
 * Text input that keeps a local draft while focused and commits it on blur or Enter.
 * Escape discards the draft. Nothing is recalculated while the user is typing.
 */
function DraftInput({ value, onCommit, ...rest }: Props) {
  // null = not editing; the committed value is shown.
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft !== null && draft !== value) onCommit(draft)
    setDraft(null)
  }

  return (
    <input
      {...rest}
      value={draft ?? value}
      onFocus={(e) => {
        setDraft(value)
        rest.onFocus?.(e)
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.currentTarget.blur() // triggers commit
        } else if (e.key === 'Escape') {
          setDraft(null)
          e.currentTarget.blur()
        }
        rest.onKeyDown?.(e)
      }}
    />
  )
}

export default DraftInput
