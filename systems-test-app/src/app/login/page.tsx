// app/login/page.tsx
"use client";

import { useState } from "react";
import { useLogin } from "@/hooks/useLogin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LoginPage() {
  const [empName, setEmpName] = useState("");
  const [empPasscode, setEmpPasscode] = useState("");
  const { login, loading, error } = useLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login(empName, empPasscode);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted font-[family-name:var(--font-geist-sans)]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Employee Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Employee Name"
              value={empName}
              onChange={(e) => setEmpName(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Passcode"
              value={empPasscode}
              onChange={(e) => setEmpPasscode(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
