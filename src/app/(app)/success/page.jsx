"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { confirmStripeOrder } from "@/store/slices/orderSlice";
import { confirmStripePurchase } from "@/store/slices/musicSlice";
export default function SuccessPage() {
  const user = useSelector((state) => state.auth.user);
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("orderId");
  const purchaseId = searchParams.get("purchaseId");
  const appointmentId = searchParams.get("appointmentId");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId || (!orderId && !purchaseId && !appointmentId) || !user?.id) return;

    const confirm = async () => {
      if (orderId) {
        await dispatch(
          confirmStripeOrder({
            setLoading,
            parentId: user?.id,
            body: { sessionId, orderId },
          })
        ).unwrap();
      } else if (purchaseId) {
        await dispatch(
          confirmStripePurchase({
            setLoading,
            parentId: user?.id,
            body: { sessionId, purchaseId },
          })
        ).unwrap();
      } else if (appointmentId) {
        setLoading(true);
        try {
          await fetch(`/api/v1/appointments/${appointmentId}/confirm`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`
            },
            body: JSON.stringify({ sessionId })
          });
        } catch (error) {
          console.error("Failed to confirm appointment");
        } finally {
          setLoading(false);
        }
      }
    };
    
    confirm();

  }, [sessionId, user, orderId, appointmentId, purchaseId, dispatch]);


  return (
    <div className="flex flex-col items-center justify-center h-[calc(100dvh-200px)] text-center">
      {loading ? (
        <h2 className="text-lg font-semibold">Confirming your order...</h2>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-green-600">Payment Successful 🎉</h2>
          {orderId && (
            <p className="text-gray-600 mt-2">Your order has been confirmed and is being processed.</p>
          )}
          {purchaseId && (
            <p className="text-gray-600 mt-2">Your purchase has been done.</p>
          )}
          {appointmentId && (
            <p className="text-gray-600 mt-2">Your medical consultation is booked and paid for!</p>
          )}
          
          {orderId && (
            <a
              href="/parent-dashboard/orders"
              className="mt-6 bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition"
            >
              View My Orders
            </a>
          )}
          {purchaseId && (
            <a
              href="/parent-dashboard/music/my-music"
              className="mt-6 bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition"
            >
              View My Music
            </a>
          )}
          {appointmentId && (
            <a
              href="/parent-dashboard/appointments"
              className="mt-6 bg-purple-600 text-white px-5 py-2 rounded-md hover:bg-purple-700 transition font-bold"
            >
              Go to Appointments
            </a>
          )}
        </>
      )}
    </div>
  );
}
