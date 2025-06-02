import { NextRequest } from "next/server";

interface Sale {
  p_id: number;
  quantity: number;
}

interface PosSalesRequestBody {
  sales: Sale[];
}

export async function POST(req: NextRequest) {
  const { sales }: PosSalesRequestBody = await req.json();

  console.log(sales);
}
