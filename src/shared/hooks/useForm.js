import { useState } from "react";
import { flushSync } from "react-dom";

// `validate(values)` returns an errors object. It runs on every render, so the errors always
// match the current values and are never stored in state.
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const errors = validate(values);

  // Shown only after the field was left once or a submit was tried, so typing doesn't paint it red
  function getShownError(name) {
    return touched[name] || hasSubmitted ? errors[name] : undefined;
  }

  function handleChange(event) {
    const { name, type, value, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  }

  function setValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function validateBeforeSubmit(form) {
    const firstInvalidField = Object.keys(initialValues).find((name) => errors[name]);

    if (!firstInvalidField) {
      setHasSubmitted(true);
      return true;
    }

    // flushSync renders the error messages right away, so the field already has its error
    // when it gets focus, and a screen reader reads both together
    flushSync(() => setHasSubmitted(true));
    const field = form.elements.namedItem(firstInvalidField);
    // A radio group comes back as a RadioNodeList, which has no focus(): focus its first radio
    const target = field instanceof RadioNodeList ? field[0] : field;
    // The submit button leaves focus in the last field, where focus() would do nothing (not even
    // scroll), so blur it first; a screen reader then reads it again with its error.
    if (target === document.activeElement) {
      target.blur();
    }
    target.focus();
    return false;
  }

  return { values, getShownError, handleChange, handleBlur, setValue, validateBeforeSubmit };
}
