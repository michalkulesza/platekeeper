import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, CardBody, Input } from "@heroui/react";
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
          <p className="text-default-500 mt-1 text-sm">Your personal recipe library</p>
        </div>

        <Card>
          <CardBody className="gap-4 p-6">
            <h2 className="text-xl font-semibold">Create account</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                label="Nickname"
                type="text"
                value={nickname}
                onValueChange={setNickname}
                autoComplete="username"
                description="Optional — shown on shared recipes"
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onValueChange={setEmail}
                autoComplete="email"
                isRequired
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onValueChange={setPassword}
                autoComplete="new-password"
                isRequired
              />

              {error && <p className="text-danger text-sm">{error}</p>}

              <Button color="primary" type="submit" isLoading={loading} fullWidth>
                Create account
              </Button>
            </form>

            <p className="text-center text-sm text-default-500">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium">
                Sign in
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
