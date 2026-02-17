import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validators";
import { useAuth } from "@/hooks/useAuth";
import { AxiosError } from "axios";
import SEO from "@/components/SEO";

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch {
      // Error captured by loginError
    }
  };

  const serverError =
    loginError instanceof AxiosError
      ? loginError.response?.data?.error || "Login failed. Please try again."
      : loginError
        ? "An unexpected error occurred."
        : null;

  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <SEO title="Login" description="Sign in to your Guitar Shop account." noIndex />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-ink">
            Welcome Back
          </h1>
          <p className="mt-2 font-body text-sm text-ink/60">
            Sign in to your account to continue shopping
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-6 border-3 border-ink bg-white p-8 shadow-[8px_8px_0px_0px_#0A0A0A]"
        >
          {serverError && (
            <div className="border-3 border-primary-500 bg-primary-50 px-4 py-3 font-mono text-sm text-primary-700">
              {serverError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block font-display text-xs font-bold uppercase tracking-widest text-ink"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className="brutal-input mt-1 block w-full px-3 py-2.5 text-sm"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 font-mono text-xs text-primary-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-display text-xs font-bold uppercase tracking-widest text-ink"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="brutal-input mt-1 block w-full px-3 py-2.5 text-sm"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 font-mono text-xs text-primary-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="brutal-btn flex w-full justify-center bg-primary-500 text-cream px-4 py-3 text-sm"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          <p className="text-center font-body text-sm text-ink/60">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-display font-bold uppercase text-primary-500 hover:underline"
            >
              Create One
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
