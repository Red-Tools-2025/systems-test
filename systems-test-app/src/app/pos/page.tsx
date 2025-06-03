"use client";

import { useAtom } from "jotai";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { employeeAtom } from "@/atoms/auth";
import { cartAtom } from "@/atoms/cart";
import { useInventory } from "@/hooks/useInventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function POSPage() {
  const [employee] = useAtom(employeeAtom);
  const [cart, setCart] = useAtom(cartAtom);
  const router = useRouter();
  const { inventory, loading, error } = useInventory(employee?.store_id);

  // For quantity input
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  if (!employee) return <p>Login in again</p>;

  // Add to cart logic
  function addToCart(itemId: number) {
    const product = inventory.find((i) => i.id === itemId);
    if (!product) return;
    const qty = quantities[itemId] || 1;
    if (qty < 1 || qty > product.quantity) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.id === itemId);
      if (existing) {
        // Update quantity
        return prev.map((c) =>
          c.id === itemId
            ? { ...c, quantity: Math.min(c.quantity + qty, product.quantity) }
            : c
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
    setQuantities((q) => ({ ...q, [itemId]: 1 }));
  }

  // Remove from cart
  function removeFromCart(itemId: number) {
    setCart((prev) => prev.filter((c) => c.id !== itemId));
  }

  // Handle "Sell" action
  function handleSell() {
    if (cart.length === 0) return;
    console.log("SOLD:", cart);
    setCart([]);
    alert("Sale complete! (Check console for cart data)");
  }

  // Cart total
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.quantity * Number(item.price),
    0
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-muted py-8">
      <Card className="w-full max-w-4xl mb-8">
        <CardHeader>
          <CardTitle>
            POS - Store #{employee.store_id}{" "}
            <Badge variant="secondary" className="ml-2">
              {employee.employee_name}
            </Badge>
          </CardTitle>
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
                  <TableHead>Available</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${item.price}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        max={item.quantity}
                        value={quantities[item.id] ?? 1}
                        onChange={(e) =>
                          setQuantities((q) => ({
                            ...q,
                            [item.id]: Number(e.target.value),
                          }))
                        }
                        className="w-16"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => addToCart(item.id)}
                        disabled={item.quantity === 0}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Cart */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>
            Cart{" "}
            <Badge variant="outline" className="ml-2">
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <div className="text-muted-foreground">Cart is empty</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>${item.price}</TableCell>
                      <TableCell>
                        ${(item.quantity * Number(item.price)).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <span className="font-bold mr-4">Total:</span>
                <span className="font-bold">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleSell} disabled={cart.length === 0}>
                  Sell
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
