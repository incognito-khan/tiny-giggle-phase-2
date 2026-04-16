"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-toastify"
import Loading from "@/components/loading"
import ParentHeader from "@/components/layout/header/parent-header"
import { useDispatch, useSelector } from "react-redux"
import { createOrder } from "@/store/slices/orderSlice"
import { useRouter } from "next/navigation"

const DELIVERY_CHARGE = 9.99

export default function CheckoutPage() {
    const cartItems = useSelector((state) => state.cart.cart);
    const user = useSelector((state) => state.auth.user);
    const [formData, setFormData] = useState({
        fullName: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
    })
    const [paymentMethod, setPaymentMethod] = useState("cod")
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    
    const handlePlaceOrder = async () => {
        if (
            !formData.fullName ||
            !formData.address ||
            !formData.city ||
            !formData.state ||
            !formData.country ||
            !formData.postalCode
        ) {
            toast.error("Please fill all the fields")
            return
        }
        
        const body = {
            shippingAddress: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country}, ${formData.postalCode}`,
            totalPrice: total,
            orderStatus: 'PENDING',
            paymentStatus: 'PENDING',
            orderItems: cartItems?.map((item) => ({
                productId: item?.product?.id,
                quantity: item?.quantity,
                image: item?.image,
                name: item?.product?.name,
                price: item?.price
            })),
            stripePayment: paymentMethod === 'cod' ? false : true
        }
        
        // console.log(body, 'body')
        await dispatch(createOrder({ setLoading, parentId: user?.id, body, router })).unwrap();

        // Reset form
        setFormData({
            fullName: "",
            address: "",
            city: "",
            state: "",
            country: "",
            postalCode: "",
        })
    }

    // Calculate totals
    const subtotal = cartItems?.reduce((sum, item) => sum + item.price, 0)
    const total = subtotal + DELIVERY_CHARGE

    return (
        <main className="min-h-screen w-full bg-background ">
            {loading && <Loading />}
            <ParentHeader />
            <div className="w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Shipping & Payment Section */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="123 Main Street"
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="Manhattan"
                                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="New York"
                                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Country</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            placeholder="USA"
                                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Postal Code</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                            placeholder="10001"
                                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Payment Method Section */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="cod"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === "cod"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 cursor-pointer"
                                    />
                                    <label htmlFor="cod" className="ml-3 cursor-pointer">
                                        Cash on Delivery
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="card"
                                        name="payment"
                                        value="card"
                                        checked={paymentMethod === "card"}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-4 h-4 cursor-pointer"
                                    />
                                    <label htmlFor="card" className="ml-3 cursor-pointer">
                                        Credit/Debit Card
                                    </label>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Order Summary Section */}
                    <div>
                        <Card className="p-6 sticky top-8">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                {cartItems?.map((item) => (
                                    <div key={item?.id} className="flex gap-4">
                                        <img
                                            src={item?.product?.image || "/placeholder.svg"}
                                            alt={item?.name}
                                            className="w-16 h-16 rounded-md object-cover bg-muted"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-medium">{item?.product?.name}</h3>
                                            <p className="text-sm text-muted-foreground">Qty: {item?.quantity}</p>
                                            <p className="text-sm font-semibold">${item?.price?.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Delivery Charge</span>
                                    <span>${DELIVERY_CHARGE.toFixed(2)}</span>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="flex justify-between text-lg font-bold mb-6">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>

                            <Button onClick={handlePlaceOrder} className="w-full" size="lg">
                                Place Order
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    )
}
