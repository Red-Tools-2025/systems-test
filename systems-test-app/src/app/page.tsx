// app/page.tsx
"use client";

import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { employeeAtom } from "@/atoms/auth";
import { useInventory } from "@/hooks/useInventory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryPage() {
  const [employee] = useAtom(employeeAtom);
  const { inventory, loading, error } = useInventory(employee?.store_id);

  if (!employee) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted font-[family-name:var(--font-geist-sans)]">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Inventory for Store #{employee.store_id}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="w-full h-40 rounded" />
          ) : error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
