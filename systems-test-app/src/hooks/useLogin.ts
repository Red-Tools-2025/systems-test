// src/hooks/useLogin.ts
import { useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import { employeeAtom } from "@/atoms/auth";
import { useRouter } from "next/navigation";
import type { Employee } from "@/types/db";

export function useLogin() {
  const [, setEmployee] = useAtom(employeeAtom);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(empName: string, empPasscode: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emp_name: empName, emp_passcode: empPasscode }),
      });
      const data: { employee?: Employee; error?: string } = await res.json();
      if (res.ok && data.employee) {
        setEmployee(data.employee);
        router.push("/");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error };
}
