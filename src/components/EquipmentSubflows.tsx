import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
} from "react-native"
import { useNav } from "../nav"
import { useEquipment, useEquipText } from "../equipment"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import {
  MapPin,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronRight,
  ShieldCheck,
  Fuel,
  Gauge,
  Phone,
  Plus,
  Check,
  X,
  AlertCircle,
  Bell,
} from "lucide-react-native"

/* -------------------------------------------------- */
/* 1. Equipment Details Screen                        */
/* -------------------------------------------------- */
export function EquipmentDetailsScreen() {
  const { params, open, back } = useNav()
  const { equipment } = useEquipment()
  const tx = useEquipText()
  const eqId = String(params.equipmentId || params.id || equipment[0]?.id)
  const eq = equipment.find((e) => e.id === eqId) || equipment[0]

  if (!eq) {
    return (
      <DetailShell title="Equipment Details">
        <Text style={{ textAlign: "center", padding: 20 }}>Equipment not found.</Text>
      </DetailShell>
    )
  }

  return (
    <DetailShell
      title={tx.name(eq.name)}
      subtitle={`${eq.location} · ${eq.distanceKm} km away`}
      footer={
        <View style={styles.footerWrap}>
          <TouchableOpacity
            onPress={() => open("requestRental", { equipmentId: eq.id })}
            activeOpacity={0.85}
            style={styles.primaryActionBtn}
          >
            <Text style={styles.primaryActionText}>
              Request to Rent (₹{eq.pricePerDay}/day)
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.heroImgCard}>
        <Image source={{ uri: eq.image }} style={styles.heroImg} />
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{tx.name(eq.name)}</Text>
          <Text style={styles.priceHighlight}>₹{eq.pricePerDay}/day</Text>
        </View>
        <Text style={styles.ownerText}>Owner: {eq.owner}</Text>

        <View style={styles.specsGrid}>
          <View style={styles.specBox}>
            <Gauge size={16} color="#256428" />
            <Text style={styles.specVal}>{eq.hp} HP</Text>
            <Text style={styles.specLbl}>Power</Text>
          </View>
          <View style={styles.specBox}>
            <Fuel size={16} color="#d97706" />
            <Text style={styles.specVal}>{eq.fuel}</Text>
            <Text style={styles.specLbl}>Fuel</Text>
          </View>
          <View style={styles.specBox}>
            <ShieldCheck size={16} color="#2563eb" />
            <Text style={styles.specVal}>{eq.condition}</Text>
            <Text style={styles.specLbl}>Condition</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Suitable Crops</Text>
        <Text style={styles.bodyText}>{eq.crops}</Text>
        <Text style={[styles.sectionHeading, { marginTop: 12 }]}>Minimum Duration</Text>
        <Text style={styles.bodyText}>{eq.minDuration}</Text>
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 2. Request Rental Screen                           */
/* -------------------------------------------------- */
export function RequestRentalScreen() {
  const { params, open, back } = useNav()
  const { equipment, requestRental } = useEquipment()
  const tx = useEquipText()
  const eqId = String(params.equipmentId || params.id || equipment[0]?.id)
  const eq = equipment.find((e) => e.id === eqId) || equipment[0]

  const [days, setDays] = useState(2)

  function handleConfirm() {
    requestRental(eq.id, {
      start: "2026-10-01",
      end: "2026-10-03",
      days,
    })
    open("requestSent", { equipmentId: eq.id, days })
  }

  const total = eq.pricePerDay * days

  return (
    <DetailShell
      title="Book Machinery"
      subtitle={`Booking ${tx.name(eq.name)}`}
      footer={
        <View style={styles.footerWrap}>
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.85}
            style={styles.primaryActionBtn}
          >
            <Text style={styles.primaryActionText}>
              Confirm & Send Request (₹{total})
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rental Duration</Text>
        <View style={styles.counterRow}>
          <TouchableOpacity
            onPress={() => setDays(Math.max(1, days - 1))}
            style={styles.counterBtn}
          >
            <Text style={styles.counterBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.counterVal}>{days} Days</Text>
          <TouchableOpacity
            onPress={() => setDays(days + 1)}
            style={styles.counterBtn}
          >
            <Text style={styles.counterBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cost Breakdown</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.bodyText}>Daily Rental Rate</Text>
          <Text style={styles.boldText}>₹{eq.pricePerDay} × {days} days</Text>
        </View>
        <View style={[styles.rowBetween, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#f3f4f6" }]}>
          <Text style={styles.cardTitle}>Estimated Total</Text>
          <Text style={styles.priceHighlight}>₹{total}</Text>
        </View>
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 3. Request Sent Screen                             */
/* -------------------------------------------------- */
export function RequestSentScreen() {
  const { open, reset } = useNav()

  return (
    <DetailShell title="Request Sent">
      <View style={styles.centerCard}>
        <View style={styles.successIconCircle}>
          <CheckCircle2 size={48} color="#16a34a" />
        </View>
        <Text style={styles.successTitle}>Booking Request Submitted!</Text>
        <Text style={styles.successDesc}>
          The equipment owner has been notified via SMS. They typically respond within 2 hours.
        </Text>

        <TouchableOpacity
          onPress={() => open("myRentals")}
          activeOpacity={0.85}
          style={[styles.primaryActionBtn, { width: "100%", marginTop: 24 }]}
        >
          <Text style={styles.primaryActionText}>View My Rentals</Text>
        </TouchableOpacity>
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 4. My Rentals Screen                               */
/* -------------------------------------------------- */
export function MyRentalsScreen() {
  const { rentals, cancelRental } = useEquipment()
  const { open } = useNav()

  return (
    <DetailShell title="My Rentals" subtitle="Active and pending bookings">
      <View style={styles.listWrap}>
        {rentals.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{r.equipmentName}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{r.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.ownerText}>Owner: {r.owner} · {r.location}</Text>
            <Text style={styles.bodyText}>
              Duration: {r.days} days · Total: ₹{r.total}
            </Text>

            {r.status === "pending" && (
              <TouchableOpacity
                onPress={() => cancelRental(r.id)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 5. Rental Details Screen                           */
/* -------------------------------------------------- */
export function RentalDetailsScreen() {
  return (
    <DetailShell title="Rental Details" subtitle="Receipt & Booking Information">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Booking Summary</Text>
        <Text style={styles.bodyText}>Status: Approved & Confirmed</Text>
        <Text style={styles.bodyText}>Pickup location: Mandya APMC Yard</Text>
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 6. List Equipment Screen                           */
/* -------------------------------------------------- */
export function ListEquipmentScreen() {
  const { listEquipment } = useEquipment()
  const { back } = useNav()
  const [name, setName] = useState("")
  const [type, setType] = useState("Tractor")
  const [price, setPrice] = useState("1200")

  function handleSubmit() {
    listEquipment({
      name: name || "Mahindra 575 DI Tractor",
      type,
      pricePerDay: Number(price) || 1200,
    })
    back()
  }

  return (
    <DetailShell
      title="List Machinery"
      subtitle="Earn rental income from your farm equipment"
      footer={
        <View style={styles.footerWrap}>
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            style={styles.primaryActionBtn}
          >
            <Text style={styles.primaryActionText}>Publish Listing</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.card}>
        <Text style={styles.label}>Equipment Name / Model</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. John Deere 5050 D"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Daily Rental Rate (₹/day)</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="1200"
          style={styles.input}
        />
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 7. Listing Preview Screen                          */
/* -------------------------------------------------- */
export function ListingPreviewScreen() {
  return (
    <DetailShell title="Listing Preview">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preview Ready</Text>
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 8. My Equipment Screen                             */
/* -------------------------------------------------- */
export function MyEquipmentScreen() {
  const { mine } = useEquipment()
  const { open } = useNav()

  return (
    <DetailShell
      title="My Equipment"
      subtitle="Machinery listed under your farmer account"
      action={
        <TouchableOpacity onPress={() => open("listEquipment")} style={styles.headerAddBtn}>
          <Plus size={18} color="#ffffff" />
        </TouchableOpacity>
      }
    >
      <View style={styles.listWrap}>
        {mine.map((eq) => (
          <View key={eq.id} style={styles.card}>
            <Text style={styles.cardTitle}>{eq.name}</Text>
            <Text style={styles.priceHighlight}>₹{eq.pricePerDay}/day</Text>
            <Text style={styles.bodyText}>Status: {eq.availability}</Text>
          </View>
        ))}
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 9. Owner Requests Screen                           */
/* -------------------------------------------------- */
export function OwnerRequestsScreen() {
  const { ownerRequests, acceptRequest, rejectRequest } = useEquipment()

  return (
    <DetailShell title="Rental Requests" subtitle="Farmers requesting your machinery">
      <View style={styles.listWrap}>
        {ownerRequests.map((req) => (
          <View key={req.id} style={styles.card}>
            <Text style={styles.cardTitle}>{req.equipmentName}</Text>
            <Text style={styles.ownerText}>Renter: {req.renter} · {req.location}</Text>
            <Text style={styles.bodyText}>Total: ₹{req.total} ({req.days} days)</Text>

            {req.status === "pending" && (
              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  onPress={() => rejectRequest(req.id)}
                  style={styles.rejectBtn}
                >
                  <Text style={styles.rejectBtnText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => acceptRequest(req.id)}
                  style={styles.acceptBtn}
                >
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 10. Owner Dashboard Screen                         */
/* -------------------------------------------------- */
export function OwnerDashboardScreen() {
  const { mine, ownerRequests } = useEquipment()

  return (
    <DetailShell title="Owner Dashboard" subtitle="Manage bookings & equipment earnings">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Earnings Summary</Text>
        <Text style={styles.priceHighlight}>₹24,800</Text>
        <Text style={styles.bodyText}>Total rental earnings this season</Text>
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 11. Rental History Screen                          */
/* -------------------------------------------------- */
export function RentalHistoryScreen() {
  return (
    <DetailShell title="Rental History" subtitle="Past completed machinery rentals">
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mahindra Rotavator 6ft</Text>
        <Text style={styles.bodyText}>Completed on Sep 12, 2026 · ₹1,800 paid</Text>
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 12. Rental Notifications Screen                    */
/* -------------------------------------------------- */
export function RentalNotificationsScreen() {
  const { notifications } = useEquipment()

  return (
    <DetailShell title="Rental Alerts">
      <View style={styles.listWrap}>
        {notifications.map((n) => (
          <View key={n.id} style={styles.card}>
            <Text style={styles.cardTitle}>{n.title}</Text>
            <Text style={styles.bodyText}>{n.body}</Text>
            <Text style={styles.ownerText}>{n.time}</Text>
          </View>
        ))}
      </View>
    </DetailShell>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  priceHighlight: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#256428",
  },
  ownerText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  bodyText: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 6,
  },
  boldText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroImgCard: {
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#e5e7eb",
  },
  heroImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  specsGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  specBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  specVal: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 4,
  },
  specLbl: {
    fontSize: 10,
    color: "#9ca3af",
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#374151",
  },
  footerWrap: {
    padding: 18,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  primaryActionBtn: {
    backgroundColor: "#256428",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginVertical: 14,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#256428",
  },
  counterVal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  centerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    marginTop: 20,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  successDesc: {
    fontSize: 13,
    color: "#4b5563",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 19,
  },
  statusPill: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#d97706",
  },
  cancelBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  cancelBtnText: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "600",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#f9fafb",
  },
  headerAddBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fee2e2",
    alignItems: "center",
  },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#dc2626",
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#256428",
    alignItems: "center",
  },
  acceptBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  listWrap: {
    gap: 12,
    paddingBottom: 30,
  },
})

