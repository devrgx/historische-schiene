"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from "react";

type ActivationCodeInputProps =
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange"
  > & {
    value?: string;
    onValueChange?: (value: string) => void;
  };

export function ActivationCodeInput({
  value,
  defaultValue,
  onValueChange,
  className,
  ...inputProps
}: ActivationCodeInputProps) {
  const normalizedDefaultValue = useMemo(
    () =>
      normalizeActivationCode(
        typeof defaultValue === "string"
          ? defaultValue
          : "",
      ),
    [defaultValue],
  );

  const [internalValue, setInternalValue] =
    useState(normalizedDefaultValue);

  const currentValue =
    value !== undefined
      ? normalizeActivationCode(value)
      : internalValue;

  function handleChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    const formattedValue =
      normalizeActivationCode(
        event.target.value,
      );

    if (value === undefined) {
      setInternalValue(formattedValue);
    }

    onValueChange?.(formattedValue);
  }

  return (
    <input
      {...inputProps}
      type="text"
      value={currentValue}
      onChange={handleChange}
      maxLength={7}
      inputMode="text"
      autoCapitalize="characters"
      spellCheck={false}
      className={[
        "w-full rounded-xl border border-line bg-page-soft text-content outline-none transition placeholder:text-subtle focus:border-accent-border focus:ring-2 focus:ring-accent-soft",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

function normalizeActivationCode(
  value: string,
): string {
  const normalizedValue = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);

  if (normalizedValue.length <= 3) {
    return normalizedValue;
  }

  return `${normalizedValue.slice(
    0,
    3,
  )}-${normalizedValue.slice(3)}`;
}