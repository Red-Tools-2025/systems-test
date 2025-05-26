// app/api/login/route.ts
import { pool } from "@/lib/neon";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { emp_name, emp_passcode } = await req.json();

    if (!emp_name || !emp_passcode) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT id, employee_name, store_id FROM employees WHERE employee_name = $1 AND login_passcode = $2",
      [emp_name, emp_passcode]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // You can add JWT or session logic here for production
    return NextResponse.json({ employee: result.rows[0] });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
