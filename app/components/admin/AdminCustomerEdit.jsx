"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
    TbUser, 
    TbMail, 
    TbPhone, 
    TbMapPin, 
    TbCalendar, 
    TbShoppingCart, 
    TbChevronLeft,
    TbLoader,
    TbTruck,
    TbCreditCard,
    TbDeviceFloppy,
    TbX
} from "react-icons/tb";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import Modal from "@/app/components/UI/Modal";
import AdminOrderEdit from "@/app/components/admin/AdminOrderEdit";

import H3 from "@/app/components/UI/Texts/H3";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import SmallTextInput from "@/app/components/UI/Inputfield/SmallTextInput";
import Textarea from "@/app/components/UI/Inputfield/Textarea";
import AdminSaveButton from "@/app/components/UI/Buttons/AdminSaveButton";
import AdminCancelButton from "@/app/components/UI/Buttons/AdminCancelButton";

function formatDateTime(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("hu-HU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatMoneyHuf(value) {
  if (value == null) return "0 Ft";
  return value.toLocaleString("hu-HU") + " Ft";
}

export default function AdminCustomerEdit({ userId, onClose }) {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        phone: "",
        email: "", // read-only mostly
        billing_zip: "",
        billing_city: "",
        billing_address: "",
        shipping_zip: "",
        shipping_city: "",
        shipping_address: "",
        notes: ""
    });

    useEffect(() => {
        const fetchDetails = async () => {
            if (!userId) return;
            setLoading(true);

            // 1. Fetch user profile
            const { data: profile, error: profileError } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (profileError) {
                console.error("Error fetching profile:", profileError);
                toast.error("Hiba a felhasználó betöltésekor");
                setLoading(false);
                return;
            }

            // 2. Fetch user orders
            let userOrders = [];
            if (profile.email) {
                 const { data: ords, error: orderError } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("email", profile.email)
                    .order("created_at", { ascending: false });
                 
                 if (!orderError) userOrders = ords;
            }

            setUser(profile);
            setOrders(userOrders || []);
            setFormData({
                firstname: profile.firstname || "",
                lastname: profile.lastname || "",
                phone: profile.phone || "",
                email: profile.email || "",
                billing_zip: profile.billing_zip || "",
                billing_city: profile.billing_city || "",
                billing_address: profile.billing_address || "",
                shipping_zip: profile.shipping_zip || "",
                shipping_city: profile.shipping_city || "",
                shipping_address: profile.shipping_address || "",
                notes: profile.notes || ""
            });
            setLoading(false);
        };

        fetchDetails();
    }, [userId, supabase]);

    // Használjuk a SmallTextInput elvárt handleChange formátumát (event alapú)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        const { email, ...updatableData } = formData; // emailt jellemzően nem szerkesztjük így, vagy ha igen, óvatosan

        const { error } = await supabase
            .from("user_profiles")
            .update(updatableData)
            .eq("id", userId);

        if (error) {
            console.error("Error updating profile:", error);
            toast.error("Hiba a mentés során");
        } else {
            toast.success("Adatok sikeresen frissítve");
            window.dispatchEvent(new Event("admin:customers:changed"));
            router.refresh();
        }
        setSaving(false);
    };

    // Ha nincs onClose prop (pl. full page view), akkor fallback router.back vagy router.push linkre
    const effectiveClose = onClose || (() => router.back());

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                 <TbLoader className="w-8 h-8 animate-spin text-[var(--pink)]" />
            </div>
        );
    }

    if (!user) return <div className="p-8 text-center">Nem található felhasználó</div>;

    const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.email;

    return (
        <div className="flex flex-col gap-6">
             {/* HEADER */}
             <div className="sticky top-0 bg-[#f5f5f5] flex flex-col justify-between items-start md:flex-row gap-4 z-10 border-b border-[var(--border)]">
                <div className="flex flex-col md:flex-row justify-between md:items-center items-start w-full gap-2">
                    <div className="flex flex-nowrap gap-2">
                        <button
                            className="flex justify-center items-start w-12 h-auto border-r border-[var(--border)] p-2 cursor-pointer hover:bg-[var(--border)]"
                            onClick={effectiveClose}
                        >
                            <TbChevronLeft className="text-[var(--pink)] w-8 h-auto" />
                        </button>
                        <div className="flex flex-col lg:flex-row gap-1 items-start lg:items-center p-2">
                             <div className="w-10 h-10 rounded-full bg-white border border-gray-200 relative overflow-hidden flex-shrink-0 mr-3">
                                {user.avatar_url ? (
                                    <Image src={user.avatar_url} alt="Avatar" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                                        <TbUser className="w-6 h-6" />
                                    </div>
                                )}
                            </div>
                            <div>
                                 <h1 className="text-xl font-bold">{fullName}</h1>
                                 <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
             </div>

             {/* BODY */}
             <div className="flex flex-col lg:p-6 p-3 pb-20 gap-8">
                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* BAL OSZLOP */}
                    <div className="w-full md:w-1/2 space-y-6">
                         {/* Személyes adatok */}
                         <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <TbUser className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                                <H3>Személyes adatok</H3>
                            </div>

                            <SmallTextInput 
                                legend="Vezetéknév"
                                name="lastname"
                                value={formData.lastname}
                                handleChange={handleChange}
                            />
                             <SmallTextInput 
                                legend="Keresztnév"
                                name="firstname"
                                value={formData.firstname}
                                handleChange={handleChange}
                            />
                            <SmallTextInput 
                                legend="Telefonszám"
                                name="phone"
                                value={formData.phone}
                                handleChange={handleChange}
                            />
                             <SmallTextInput 
                                legend="Email (nem szerkeszthető)"
                                name="email"
                                value={formData.email}
                                handleChange={() => {}} // Disabled effect
                                className="bg-gray-100 cursor-not-allowed"
                            />
                         </div>

                        {/* Szállítási cím */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <TbTruck className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                                <H3>Szállítási cím</H3>
                            </div>
                             <SmallTextInput 
                                legend="Irányítószám"
                                name="shipping_zip"
                                value={formData.shipping_zip}
                                handleChange={handleChange}
                            />
                             <SmallTextInput 
                                legend="Város"
                                name="shipping_city"
                                value={formData.shipping_city}
                                handleChange={handleChange}
                            />
                             <SmallTextInput 
                                legend="Cím (utca, hsz, em, ajtó)"
                                name="shipping_address"
                                value={formData.shipping_address}
                                handleChange={handleChange}
                            />
                        </div>

                         {/* Számlázási cím */}
                         <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <TbCreditCard className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                                <H3>Számlázási cím</H3>
                            </div>
                             <SmallTextInput 
                                legend="Irányítószám"
                                name="billing_zip"
                                value={formData.billing_zip}
                                handleChange={handleChange}
                            />
                             <SmallTextInput 
                                legend="Város"
                                name="billing_city"
                                value={formData.billing_city}
                                handleChange={handleChange}
                            />
                             <SmallTextInput 
                                legend="Cím (utca, hsz, em, ajtó)"
                                name="billing_address"
                                value={formData.billing_address}
                                handleChange={handleChange}
                            />
                        </div>

                         {/* Megjegyzés */}
                         <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <TbMail className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                                <H3>Megjegyzés</H3>
                            </div>
                            <Textarea 
                                legend="Belső megjegyzés"
                                name="notes"
                                value={formData.notes}
                                handleChange={handleChange}
                                rows={4}
                            />
                         </div>
                    </div>

                    {/* JOBB OSZLOP: Rendelések & Statisztika */}
                    <div className="w-full md:w-1/2 space-y-6">
                        
                         {/* Info Card */}
                         <div className="space-y-3 border border-[var(--border)] rounded-2xl p-4 bg-white">
                            <H3>Fiók Információk</H3>
                            <div className="flex justify-between text-sm">
                                <span>User ID:</span>
                                <span className="font-mono text-xs text-gray-500">{user.id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Regisztráció:</span>
                                <span>{formatDateTime(user.created_at)}</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span>Rendelések száma:</span>
                                <span>{orders.length} db</span>
                            </div>
                         </div>

                        {/* Recent Orders */}
                        <div className="space-y-3 border border-[var(--border)] rounded-2xl p-4 bg-white">
                             <div className="flex items-center gap-2">
                                <TbShoppingCart className="min-w-8 h-auto bg-[var(--pink)] p-1 rounded-md text-white" />
                                <H3>Legutóbbi rendelések</H3>
                            </div>

                             {orders.length === 0 ? (
                                <Paragraph classname="text-sm text-gray-500">
                                    Nincs még rögzített rendelés ehhez az email címhez.
                                </Paragraph>
                             ) : (
                                 <div className="space-y-3">
                                    {orders.slice(0, 10).map(order => (
                                        <div 
                                            key={order.id} 
                                            className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center justify-between group hover:border-[var(--pink)]/30 transition-all cursor-pointer hover:bg-gray-100"
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setOrderDetailsOpen(true);
                                            }}
                                        >
                                            <div>
                                                 <div className="font-bold text-gray-900 group-hover:text-[var(--pink)] transition-colors text-sm">#{order.order_number}</div>
                                                 <div className="text-xs text-gray-500">{formatDateTime(order.created_at)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900 text-sm">{formatMoneyHuf(order.total_huf)}</div>
                                                <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5
                                                    ${order.status === 'paid' || order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {order.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length > 10 && (
                                        <p className="text-center text-xs text-gray-500 mt-2">...és további {orders.length - 10} rendelés</p>
                                    )}
                                </div>
                             )}
                        </div>

                    </div>
                </div>
             </div>

              {/* FOOTER ACTION BAR */}
              <div className="sticky bottom-0 bg-[#f5f5f5] border-t border-[var(--border)] p-2 flex md:flex-row flex-col justify-between items-center gap-2 w-full">
                <div className="text-xs text-gray-500 px-2">
                     Utolsó módosítás: {formatDateTime(new Date())}
                </div>
                <div className="flex flex-row gap-2">
                    <AdminCancelButton 
                        title="Mégse"
                        link=""
                        onclick={effectiveClose}
                        buttonicon="TbX"
                    />
                    <AdminSaveButton 
                        title={saving ? "Mentés..." : "Mentés"}
                        link=""
                        onclick={handleSave}
                        buttonicon="TbDeviceFloppy"
                    />
                </div>
             </div>

            {/* NESTED MODAL: Order Details */}
            {orderDetailsOpen && selectedOrder && (
                <Modal 
                    openstate={true} 
                    onClose={() => {
                        setOrderDetailsOpen(false);
                        setSelectedOrder(null);
                    }} 
                    closeButton={false}
                    width="80%"
                >
                    <AdminOrderEdit order={selectedOrder} />
                </Modal>
            )}
        </div>
    );
}
