import { useState } from "react";
import FormField from "../../../shared/components/FormField.jsx";
import SubmitButton from "../../../shared/components/SubmitButton.jsx";
import { useForm } from "../../../shared/hooks/useForm.js";
import AuthAlert from "../components/AuthAlert.jsx";
import AuthPanel from "../components/AuthPanel.jsx";
import AuthSwitchLink from "../components/AuthSwitchLink.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { getAuthErrorField, getAuthErrorMessage, validateLogin } from "../utils/authValidation.js";

const INITIAL_VALUES = { email: "", password: "" };

export default function LoginPage() {
  const { login } = useAuth();
  const { values, getShownError, handleChange, handleBlur, validateBeforeSubmit } = useForm(
    INITIAL_VALUES,
    validateLogin,
  );
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);

  async function handleSubmit(event) {
    event.preventDefault();
    // Saved now: after the await, event.currentTarget is already null
    const form = event.currentTarget;

    // An old server error stays until the new answer arrives: removing it now would move the
    // form up under the mouse, and a double-click could land on the link below the button
    if (isPending || !validateBeforeSubmit(form)) {
      return;
    }

    setIsPending(true);

    try {
      await login({ email: values.email.trim(), password: values.password });
      // Nothing to do after a successful login: GuestGuard sees the user and redirects
    } catch (error) {
      setServerError(getAuthErrorMessage(error));
      setFailedAttempts((count) => count + 1);
      setIsPending(false);
      // The submit button was disabled, so focus goes back to the field to correct
      // (usually the password). The email stays filled in.
      const fieldName = getAuthErrorField(error) === "email" ? "email" : "password";
      form.elements.namedItem(fieldName).focus();
    }
  }

  return (
    <AuthPanel title="Welcome back" subtitle="Log in to continue to your worlds.">
      {/* A new key on every failure re-creates the alert, so it is announced again even
          when the message is the same as last time */}
      {serverError && <AuthAlert key={failedAttempts} message={serverError} />}

      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        {/* "username" tells password managers that the email is the account name */}
        <FormField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={getShownError("email")}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          className="auth-input"
        />

        <PasswordInput
          label="Password"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={getShownError("password")}
          autoComplete="current-password"
        />

        <SubmitButton
          isPending={isPending}
          label="Log in"
          pendingLabel="Logging in…"
          className="btn btn-primary btn-lg auth-submit"
        />
      </form>

      <AuthSwitchLink question="New to Lorelight?" to="/register" label="Create an account" />
    </AuthPanel>
  );
}
