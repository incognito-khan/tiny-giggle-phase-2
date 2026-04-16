"use client";
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { requestPasswordReset, verifyOTP, changePassword, updateProfile } from "@/store/slices/authSlice";
import { getAllNotificationMessages } from "@/store/slices/messageSlice";
import { POST } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import Loading from '@/components/loading/index';
import { Bell } from "lucide-react";
import { toast } from "react-toastify";
import { CreditCard, ShieldCheck } from "lucide-react";
import { initializeSupplierPayment, confirmSupplierPayment } from "@/store/slices/supplierSlice";
import { initializeArtistPayment, confirmArtistPayment } from "@/store/slices/artistSlice";
import { useSearchParams, useRouter } from "next/navigation";

function Settings() {
    const router = useRouter();
    const user = useSelector((state) => state.auth.user);
    const messages = useSelector((state) => state.message.messages);
    const [step, setStep] = useState("email"); // 'email' | 'otp' | 'password'
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [uploading, setUploading] = useState(false);
    const searchParams = useSearchParams();
    const dispatch = useDispatch();

    // Step 1: Send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (!email) return alert("Please enter your email first!");

        const body = {
            email,
            role: user?.role
        }

        const res = await dispatch(requestPasswordReset({ setLoading, body })).unwrap();
        console.log(res, 'res')

        if (res.success) {
            setStep("otp");
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!otp) return alert("Please enter the OTP.");

        const body = {
            otp,
            email,
            type: "PASSWORD_RESET",
            role: user?.role
        }

        const res = await dispatch(verifyOTP({ setLoading, body })).unwrap();

        console.log(res, 'res')

        if (res.success) {
            setStep("password");
        }

        // TODO: Verify OTP from backend
        // console.log("Verifying OTP:", otp);
    };

    // Step 3: Change Password
    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword)
            return toast.error("Please fill out all password fields.");
        if (newPassword !== confirmPassword)
            return toast.error("Passwords do not match!");

        const body = {
            email,
            password: confirmPassword,
            role: user?.role
        }

        const res = await dispatch(changePassword({ setLoading, body })).unwrap();

        if (res.success) {
            setStep("email");
            setEmail("");
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
        }

        // TODO: Call API to update password
        // console.log("Password updated for:", email);
        // alert("Password updated successfully!");
    };

    // const gettingAllMessages = () => {
    //     dispatch(getAllNotificationMessages({ setLoading, role: user?.role, userId: user?.id }))
    // }

    const handleTabChange = (value) => {
        setActiveTab(value);

        // Fetch messages only when notifications tab is clicked
        if (value === "notifications" && !messages?.length) {
            dispatch(
                getAllNotificationMessages({
                    setLoading: setMessageLoading,
                    role: user?.role,
                    userId: user?.id,
                })
            );
        }
    };

    const handleProfilePictureChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            const { data: uploadRes } = await POST("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (uploadRes?.success) {
                const imageUrl = uploadRes.data.url;
                await dispatch(updateProfile({ body: { profilePicture: imageUrl } })).unwrap();
            }
        } catch (err) {
            console.error("Profile upload failed", err);
            toast.error("Failed to update profile picture");
        } finally {
            setUploading(false);
        }
    };

    const handleSupplierPayment = async () => {
        if (user?.role === "artist") {
            dispatch(initializeArtistPayment({ setLoading }));
        } else {
            dispatch(initializeSupplierPayment({ setLoading }));
        }
    };


    React.useEffect(() => {
        const sessionId = searchParams.get("session_id");
        const type = searchParams.get("type");

        if (sessionId && (type === "SUPPLIER_ACTIVATION" || type === "ARTIST_ACTIVATION") && !user?.isPaid) {
            const confirmThunk = type === "ARTIST_ACTIVATION" ? confirmArtistPayment : confirmSupplierPayment;
            dispatch(confirmThunk({ setLoading, sessionId })).then((res) => {
                if (res.meta.requestStatus === "fulfilled") {
                    // Clear the session_id from URL
                    router.replace("/admin-dashboard/settings?tab=activation");
                }
            });
        }
    }, [searchParams, user?.isPaid, dispatch, router]);


    return (
        <div className="w-[95%] mx-10 mt-10">
            {loading && <Loading />}
            <Card className="shadow-md">
                <CardHeader>
                    <h2 className="text-xl font-semibold">Settings</h2>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className={`grid w-full ${(user?.role === "supplier" || user?.role === "artist") ? "grid-cols-4" : "grid-cols-3"}`}>
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                            {(user?.role === "supplier" || user?.role === "artist") && (
                                <TabsTrigger value="activation">Activation</TabsTrigger>
                            )}
                        </TabsList>

                        {/* Profile Tab */}
                        <TabsContent value="profile" className="mt-5">
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Profile Settings</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Update your personal information and account details here.
                                    </p>
                                </div>

                                <div className="space-y-4 max-w-md">
                                    <div className="flex flex-col gap-4">
                                        <Label>Profile Picture</Label>
                                        <div className="flex items-center gap-6">
                                            <div className="relative group">
                                                <img
                                                    src={user?.profilePicture || "https://i.pravatar.cc/120?img=47"}
                                                    alt="Profile"
                                                    className="w-24 h-24 rounded-full object-cover border-4 border-muted shadow-sm"
                                                />
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                                                        <Loading transparent={true} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    onClick={() => document.getElementById('profile-pic-upload').click()}
                                                    disabled={uploading}
                                                >
                                                    {uploading ? "Uploading..." : "Change Photo"}
                                                </Button>
                                                <p className="text-xs text-muted-foreground">
                                                    JPG, PNG or WebP. Max 2MB.
                                                </p>
                                                <input
                                                    id="profile-pic-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleProfilePictureChange}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t space-y-4">
                                        <div>
                                            <Label>Full Name</Label>
                                            <Input 
                                                value={user?.name || ""} 
                                                disabled 
                                                className="mt-1 bg-muted/50"
                                            />
                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                Name cannot be changed here.
                                            </p>
                                        </div>
                                        <div>
                                            <Label>Email Address</Label>
                                            <Input 
                                                value={user?.email || ""} 
                                                disabled 
                                                className="mt-1 bg-muted/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="mt-5">
                            <h3 className="text-lg font-medium mb-4">Change Password</h3>

                            {/* Step 1: Enter email */}
                            {step === "email" && (
                                <form onSubmit={handleSendOtp} className="space-y-4 max-w-md">
                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your account email"
                                            className="mt-1"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" className="mt-2">
                                        Send OTP
                                    </Button>
                                </form>
                            )}

                            {/* Step 2: Enter OTP */}
                            {step === "otp" && (
                                <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-md">
                                    <div>
                                        <Label htmlFor="otp">Enter OTP</Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="Enter the OTP sent to your email"
                                            className="mt-1"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit">Verify OTP</Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep("email")}
                                        >
                                            Back
                                        </Button>
                                    </div>
                                </form>
                            )}

                            {/* Step 3: Change Password */}
                            {step === "password" && (
                                <form
                                    onSubmit={handleChangePassword}
                                    className="space-y-4 max-w-md"
                                >
                                    <div>
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="Enter new password"
                                            className="mt-1"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Re-enter new password"
                                            className="mt-1"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button type="submit">Update Password</Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep("email")}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </TabsContent>


                        {/* Activation Tab (Suppliers & Artists) */}
                        {(user?.role === "supplier" || user?.role === "artist") && (
                            <TabsContent value="activation" className="mt-5">
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">{user?.role === "artist" ? "Artist" : "Supplier"} Activation</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Manage your professional account verification and activation fees.
                                        </p>
                                    </div>

                                    <div className="max-w-md">
                                        {user?.isPaid ? (
                                            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
                                                <div className="bg-green-100 p-4 rounded-full text-green-600">
                                                    <ShieldCheck size={48} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-green-800">Account Activated</h4>
                                                    <p className="text-sm text-green-700 mt-1">
                                                        Your professional {user?.role} profile is fully verified and visible to all users.
                                                    </p>
                                                </div>
                                                <div className="w-full h-px bg-green-200 my-2" />
                                                <p className="text-xs text-green-600 font-medium">
                                                    Status: {user?.status || "ACTIVE"}
                                                </p>
                                                {user?.paidUntil && (
                                                    <div className="w-full mt-2 pt-4 border-t border-green-200">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-1">Membership Expires</p>
                                                        <p className="text-sm font-bold text-green-800">
                                                            {new Date(user.paidUntil).toLocaleDateString('en-US', {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-white border border-pink-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-pink-100 p-3 rounded-xl text-pink-600">
                                                        <CreditCard size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-800">Verification Fee</h4>
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Annual Membership</p>
                                                    </div>
                                                    <div className="ml-auto text-2xl font-black text-gray-900">
                                                        {user?.role === "artist" ? "$75.00" : "$80.00"}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                                                        {user?.role === "artist" ? "Access to profile portfolio" : "Access to unlimited product listings"}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                                                        Verified badge on your profile
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <div className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                                                        Priority in search results
                                                    </div>
                                                </div>

                                                <Button 
                                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 font-bold text-white shadow-lg shadow-pink-100"
                                                    onClick={handleSupplierPayment}
                                                    disabled={loading}
                                                >
                                                    {loading ? "Processing..." : "Activate Account Now"}
                                                </Button>

                                                <p className="text-[10px] text-center text-gray-400">
                                                    Secure payment processed via Stripe. By activating, you agree to our professional terms.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        )}
                        
                        <TabsContent value="notifications" className="mt-5">
                            {messageLoading && (
                                <div className="w-full h-[100px] flex items-center justify-center">
                                    <Loading transparent={true} />
                                </div>
                            )}
                            <div className="space-y-4">
                                {!messageLoading && messages?.length === 0 ? (
                                    <>
                                        <h3 className="text-lg font-medium mb-2">Notifications</h3>

                                        <p className="text-sm text-muted-foreground">
                                            You do not have any notifications yet.
                                        </p>
                                    </>
                                ) : (
                                    messages?.map((msg) => (
                                        <Card
                                            key={msg.id}
                                            className="border border-gray-200 hover:shadow-md transition-all"
                                        >
                                            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                                                <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                                                    <Bell size={18} />
                                                </div>
                                                <CardTitle className="text-base font-semibold">
                                                    {msg?.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {msg?.description || "No description available."}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(msg?.createdAt).toLocaleString()}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

export default Settings;
