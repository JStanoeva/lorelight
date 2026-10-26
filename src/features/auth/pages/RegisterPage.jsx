import { useId, useState } from "react";
import FormField from "../../../shared/components/FormField.jsx";
import PageTitle from "../../../shared/components/PageTitle.jsx";
import SubmitButton from "../../../shared/components/SubmitButton.jsx";
import { useForm } from "../../../shared/hooks/useForm.js";
import AuthAlert from "../components/AuthAlert.jsx";
import AuthPanel from "../components/AuthPanel.jsx";
import AuthSwitchLink from "../components/AuthSwitchLink.jsx";
import PasswordChecklist from "../components/PasswordChecklist.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import PasswordMatchHint from "../components/PasswordMatchHint.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { authService } from "../services/authService.js";
import {
  NO_SESSION_MESSAGE,
  USERNAME_TAKEN_MESSAGE,
  getAuthErrorField,
  getAuthErrorMessage,
  getMatchState,
  validateRegister,
} from "../utils/authValidation.js";

const INITIAL_VALUES = { username: "", email: "", password: "", repeatPassword: "" };

export default function RegisterPage() {
  const { register } = useAuth();
  const { values, getShownError, handleChange, handleBlur, validateBeforeSubmit } = useForm(
    INITIAL_VALUES,
    validateRegister,
  );
  const [isPending, setIsPending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const rulesId = useId();
  const matchId = useId();

  // The red error replaces the calm match hint, so the two never say the same thing twice
  const matchState = getShownError("repeatPassword")
    ? ""
    : getMatchState(values.password, values.repeatPassword);

  // The submit button was disabled, so focus goes back into the form, to the field to correct
  function showServerError(form, message, fieldName) {
    setServerError(message);
    setFailedAttempts((count) => count + 1);
    setIsPending(false);
    form.elements.namedItem(fieldName).focus();
  }

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
    const username = values.username.trim();

    try {
      if (await authService.isUsernameTaken(username)) {
        showServerError(form, USERNAME_TAKEN_MESSAGE, "username");
        return;
      }

      const { session } = await register({
        email: values.email.trim(),
        password: values.password,
        username,
      });

      // With a session, GuestGuard sees the new user and redirects: nothing to do here.
      // Without one (a Supabase project that requires email confirmation), no redirect comes.
      if (!session) {
        showServerError(form, NO_SESSION_MESSAGE, "email");
      }
    } catch (error) {
      showServerError(form, getAuthErrorMessage(error), getAuthErrorField(error) || "username");
    }
  }

  return (
    <AuthPanel
      title="Create your account"
      subtitle="Start writing, organizing and sharing the lore of your worlds."
    >
      <PageTitle title="Register" />
      {/* A new key on every failure re-creates the alert, so it is announced again even
          when the message is the same as last time */}
      {serverError && <AuthAlert key={failedAttempts} message={serverError} />}

      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        {/* People log in with their email, so password managers must save the email as the
            account name: the email field is marked "username", this public name "nickname" */}
        <FormField
          label="Username"
          name="username"
          value={values.username}
          onChange={handleChange}
          onBlur={handleBlur}
          error={getShownError("username")}
          hint="3–30 Latin letters (a–z) and numbers."
          autoComplete="nickname"
          autoCapitalize="none"
          spellCheck={false}
          className="auth-input"
        />

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

        {/* One wrapper, so the rules panel sits close under the password field */}
        <div className="auth-field">
          <PasswordInput
            label="Password"
            name="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={getShownError("password")}
            autoComplete="new-password"
            describedById={`${rulesId} ${rulesId}-note`}
          />
          <PasswordChecklist id={rulesId} password={values.password} />
        </div>

        <PasswordInput
          label="Repeat password"
          name="repeatPassword"
          value={values.repeatPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={getShownError("repeatPassword")}
          autoComplete="new-password"
          toggleLabel="Show repeat password"
          describedById={matchId}
        >
          <PasswordMatchHint id={matchId} state={matchState} />
        </PasswordInput>

        <SubmitButton
          isPending={isPending}
          label="Create account"
          pendingLabel="Creating account…"
          className="btn btn-primary btn-lg auth-submit"
        />
      </form>

      <AuthSwitchLink question="Already have an account?" to="/login" label="Log in" />
    </AuthPanel>
  );
}
