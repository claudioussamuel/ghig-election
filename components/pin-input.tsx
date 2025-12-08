"use client"

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react"

interface PinInputProps {
    length?: number
    value: string
    onChange: (value: string) => void
    onComplete?: (value: string) => void
    disabled?: boolean
    error?: boolean
}

export default function PinInput({
    length = 6,
    value,
    onChange,
    onComplete,
    disabled = false,
    error = false,
}: PinInputProps) {
    const [focusedIndex, setFocusedIndex] = useState(0)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Initialize refs array
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, length)
    }, [length])

    // Auto-focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [])

    const handleChange = (index: number, digit: string) => {
        // Only allow digits
        if (digit && !/^\d$/.test(digit)) return

        const newValue = value.split("")
        newValue[index] = digit
        const newPin = newValue.join("").slice(0, length)

        onChange(newPin)

        // Auto-advance to next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
            setFocusedIndex(index + 1)
        }

        // Call onComplete when all digits are filled
        if (newPin.length === length && onComplete) {
            onComplete(newPin)
        }
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            e.preventDefault()

            if (value[index]) {
                // Clear current digit
                const newValue = value.split("")
                newValue[index] = ""
                onChange(newValue.join(""))
            } else if (index > 0) {
                // Move to previous input and clear it
                const newValue = value.split("")
                newValue[index - 1] = ""
                onChange(newValue.join(""))
                inputRefs.current[index - 1]?.focus()
                setFocusedIndex(index - 1)
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus()
            setFocusedIndex(index - 1)
        } else if (e.key === "ArrowRight" && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
            setFocusedIndex(index + 1)
        }
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text/plain").trim()

        // Only accept digits
        const digits = pastedData.replace(/\D/g, "").slice(0, length)

        if (digits) {
            onChange(digits)

            // Focus the next empty input or the last input
            const nextIndex = Math.min(digits.length, length - 1)
            inputRefs.current[nextIndex]?.focus()
            setFocusedIndex(nextIndex)

            // Call onComplete if all digits are filled
            if (digits.length === length && onComplete) {
                onComplete(digits)
            }
        }
    }

    const handleFocus = (index: number) => {
        setFocusedIndex(index)
        // Select the content when focused
        inputRefs.current[index]?.select()
    }

    return (
        <div className="flex gap-2 sm:gap-3 justify-center">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[index] || ""}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={() => handleFocus(index)}
                    disabled={disabled}
                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-lg border-2 transition-all
            ${error
                            ? "border-red-500 bg-red-500/10"
                            : focusedIndex === index
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-border bg-background hover:border-primary/50"
                        }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            focus:outline-none text-foreground placeholder-muted-foreground
          `}
                    aria-label={`PIN digit ${index + 1}`}
                />
            ))}
        </div>
    )
}
