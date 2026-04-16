"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus } from "lucide-react"
import ParentHeader from "@/components/layout/header/parent-header"
import { useDispatch, useSelector } from "react-redux"
import { gettingCart, addToCart, reduceQuantity, deleteCartProduct } from "@/store/slices/cartSlice"
import { useRouter } from "next/navigation"
import Loading from "@/components/loading";

export default function CartPage() {
    const cartItems = useSelector((state) => state.cart.cart);
    const user = useSelector((state) => state.auth.user);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const updateQuantity = (newQuantity, productId, mode) => {
        if (newQuantity < 1) return

        dispatch({
            type: "cart/updateLocalQuantity",
            payload: { productId, change: mode === "increment" ? 1 : -1 }
        });

        if (mode === 'decrement') {
            dispatch(reduceQuantity({ setLoading, productId, parentId: user?.id, reduceBy: newQuantity }))
        }

        if (mode === 'increment') {
            dispatch(addToCart({ setLoading, productId, quantity: newQuantity, parentId: user?.id }))
        }
    }

    const removeItem = (id) => {
        dispatch(deleteCartProduct({ setLoading, productId: id, parentId: user?.id }))
    }

    const getCartItems = () => {
        dispatch(gettingCart({ setLoading, parentId: user?.id }))
    }

    useEffect(() => {
        getCartItems();
    }, [])

    const totalPrice = cartItems?.reduce((acc, item) => acc + (item?.price || 0), 0);

    return (
        <div className="min-h-screen bg-background w-full">
            <div className="mx-auto w-full">
                {loading && <Loading />}
                <ParentHeader />
                {/* Header */}
                <div className="mb-4 p-4 md:px-8">
                    <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
                    <p className="mt-2 text-muted-foreground">
                        {cartItems?.length} {cartItems?.length === 1 ? "item" : "items"} in your cart
                    </p>
                </div>

                {/* Main Grid Layout */}
                <div className="grid gap-8 lg:grid-cols-3 px-4">
                    {/* Cart Items Section */}
                    {/* <div className="lg:col-span-2"> */}
                    <div className="col-span-3">
                        {cartItems.length === 0 ? (
                            <Card>
                                <CardContent className="flex items-center justify-center py-12">
                                    <p className="text-muted-foreground">Your cart is empty</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                <>
                                    {cartItems?.map((item) => (
                                        <Card key={item.id} className="overflow-hidden">
                                            <CardContent className="p-4">
                                                <div className="flex gap-4">
                                                    {/* Product Image */}
                                                    <div className="flex-shrink-0">
                                                        <img
                                                            src={item?.product?.image || "/placeholder.svg"}
                                                            alt={item?.product?.name}
                                                            className="h-24 w-24 rounded-lg object-cover"
                                                        />
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="flex flex-1 flex-col justify-between">
                                                        <div>
                                                            <h3 className="font-semibold text-foreground">{item?.product?.name}</h3>
                                                            <p className="mt-1 text-lg font-bold text-primary">${item?.product?.salePrice?.toFixed(2)}</p>
                                                        </div>

                                                        {/* Quantity Selector */}
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => updateQuantity(1, item?.product?.id, 'decrement')}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </Button>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                value={item?.quantity}
                                                                onChange={(e) => updateQuantity(item?.id, Number.parseInt(e.target.value) || 1)}
                                                                className="h-8 w-20 text-center"
                                                            />
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => updateQuantity(1, item?.product?.id, 'increment')}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <div className="flex flex-col items-end justify-between">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeItem(item?.product?.id)}
                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </Button>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {item?.price?.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    <div className="flex justify-end">
                                        <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-full cursor-pointer"
                                            onClick={() => router.push('/parent-dashboard/checkout')}
                                        >
                                            Checkout ${totalPrice}
                                        </Button>
                                    </div>
                                </>
                            </div>
                        )}
                    </div>

                    {/* Cart Summary Section */}
                    {/* <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 border-b border-border pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Items</span>
                    <span className="font-medium text-foreground">{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-foreground">Free</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">${subtotal.toFixed(2)}</span>
                </div>

                <Button className="w-full" size="lg" disabled={cartItems.length === 0}>
                  Proceed to Checkout
                </Button>

                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => (window.location.href = "/")}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div> */}
                </div>
            </div>
        </div>
    )
}