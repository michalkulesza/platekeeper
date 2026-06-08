import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, CardContent } from "@heroui/react";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ email, password, nickname: nickname || undefined });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">PlateKeeper</h1>
          <p className="text-zinc-500 mt-1 text-sm">Your personal recipe library</p>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <h2 className="text-xl font-semibold">Create account</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" htmlFor="nickname">Nickname</label>
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  autoComplete="username"
                  placeholder="Optional — shown on shared recipes"
                  className="px-3 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="px-3 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="px-3 py-2 text-sm rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {error && <p className="text-danger text-sm">{error}</p>}

              <Button variant="primary" type="submit" isDisabled={loading} fullWidth>
                {loading ? "Creating…" : "Create account"}
              </Button>
            </form>

            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
