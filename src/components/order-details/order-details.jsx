"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  User,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import OrderItemsTable from "./order-items-table";
import { useDispatch, useSelector } from "react-redux";
import { getSingleOrder } from "@/store/slices/orderSlice";
import { useParams } from "next/navigation";
import Loading from "@/components/loading";
import { format } from "date-fns/format";

const getOrderStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
    case "confirmed":
      return "bg-yellow-100 text-yellow-800";

    case "processing":
    case "in transit":
    case "out_for_delivery":
      return "bg-blue-100 text-blue-800";

    case "delivered":
    case "refunded":
      return "bg-green-100 text-green-800";

    case "cancelled":
    case "failed":
    case "returned":
    case "return_requested":
      return "bg-red-100 text-red-800";

    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
    case "authorized":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "completed":
    case "refunded":
    case "partially_refunded":
      return "bg-green-100 text-green-800";
    case "failed":
    case "declined":
    case "cancelled":
    case "expired":
    case "chargeback":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function OrderDetails() {
  const user = useSelector((state) => state.auth.user);
  const order = useSelector((state) => state.order.order);
  console.log(order, "order");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const { id } = useParams();

  const gettingOrderDetails = () => {
    dispatch(getSingleOrder({ setLoading, parentId: user?.id, orderId: id }));
  };

  useEffect(() => {
    gettingOrderDetails();
  }, [id]);
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto w-full">
        {loading && <Loading />}
        <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Order Details</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Tracking:{" "}
              <span className="font-semibold">{order?.trackingNumber}</span>
            </p>
          </div>

          {/* <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search..." className="pl-10 w-64" />
                        </div>
                        <Avatar className="w-10 h-10">
                            <AvatarImage src="/professional-headshot.png" />
                            <AvatarFallback>WG</AvatarFallback>
                        </Avatar>
                        <div className="text-right">
                            <div className="font-medium text-foreground">William Gray</div>
                            <div className="text-sm text-muted-foreground">Super Admin</div>
                        </div>
                    </div> */}
        </header>

        {/* Status Section */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 mt-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className={`${getOrderStatusColor(order?.orderStatus)}`}>
                {order?.orderStatus}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4" />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={`${getPaymentStatusColor(order?.paymentStatus)}`}
              >
                {order?.paymentStatus}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* User & Shipping Info */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{order?.parent?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{order?.parent?.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{order?.shippingAddress}</p>
              {/* <p>
                                {mockOrder.shippingAddress.city}, {mockOrder.shippingAddress.state} {mockOrder.shippingAddress.zipCode}
                            </p>
                            <p>{mockOrder.shippingAddress.country}</p> */}
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderItemsTable items={order?.orderItems} />
          </CardContent>
        </Card>

        {/* Total Section */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total Price</span>
              <span className="text-2xl font-bold">
                ${order?.totalPrice?.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
