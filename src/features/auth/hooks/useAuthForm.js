import { useState } from "react";
import { flushSync } from "react-dom";

// Form state shared by Login and Register: the field values (controlled inputs), the fields
// the user has left at least once (touched), and whether a submit was tried.
// `validate(values)` returns an errors object. It runs on every render, so the errors always
// match the current values and are never stored in state.
export function useAuthForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const errors = validate(values);

  // A field's error shows only after the field was left once, or after a submit attempt,
  // so typing the first characters doesn't paint the field red
  function getShownError(name) {
    return touched[name] || hasSubmitted ? errors[name] : undefined;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  }

  // Called at the start of a submit. Returns true when every field is valid. Otherwise it shows
  // all the errors and moves focus to the first invalid field (fields in initialValues order).
  function validateBeforeSubmit(form) {
    const firstInvalidField = Object.keys(initialValues).find((name) => errors[name]);

    if (!firstInvalidField) {
      setHasSubmitted(true);
      return true;
    }

    // flushSync renders the error messages right away, so the field already has its error
    // when it gets focus, and a screen reader reads both together
    flushSync(() => setHasSubmitted(true));
    form.elements.namedItem(firstInvalidField).focus();
    return false;
  }

  return { values, getShownError, handleChange, handleBlur, validateBeforeSubmit };
}
