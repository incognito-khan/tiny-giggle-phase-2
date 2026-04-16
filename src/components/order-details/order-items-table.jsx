"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function OrderItemsTable({ items }) {
  const calculateSubtotal = (quantity, price) => {
    return (quantity * price).toFixed(2)
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items?.map((item) => (
            <TableRow key={item?.id}>
              <TableCell className="font-medium">{item?.product?.name}</TableCell>
              <TableCell className="text-right">{item?.quantity}</TableCell>
              <TableCell className="text-right">${item?.product?.salePrice?.toFixed(2)}</TableCell>
              <TableCell className="text-right font-semibold">
                ${calculateSubtotal(item?.quantity, item?.product?.salePrice)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
