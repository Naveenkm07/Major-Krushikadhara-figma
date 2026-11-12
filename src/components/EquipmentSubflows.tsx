import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNav } from "../nav"
import { useEquipment, useEquipText } from "../equipment"
import { useProfile } from "../profile"
import { useLang } from "../i18n"
import DetailShell from "./DetailShell"
import {
  CheckCircle2,
  ShieldCheck,
  Fuel,
  Gauge,
  Plus,
  Bell,
} from "lucide-react-native"

/* -------------------------------------------------- */
/* 1. Equipment Details Screen                        */
/* -------------------------------------------------- */
export function EquipmentDetailsScreen() {
  const { params, open } = useNav()
  const { equipment, toggleNotify } = useEquipment()
  const { lang } = useLang()
  const isKn = lang === "kn"
  const tx = useEquipText()
  const insets = useSafeAreaInsets()

  const eqId = String(params.equipmentId || params.id || equipment[0]?.id)
  const eq = equipment.find((e) => e.id === eqId) || equipment[0]

  if (!eq) {
    return (
      <DetailShell title={isKn ? "ಯಂತ್ರ ವಿವರ" : "Equipment Details"}>
        <Text style={{ textAlign: "center", padding: 20 }}>
          {isKn ? "ಯಂತ್ರ ಲಭ್ಯವಿಲ್ಲ." : "Equipment not found."}
        </Text>
      </DetailShell>
    )
  }

  const isAvailable = eq.availability === "available"

  return (
    <DetailShell
      title={tx.name(eq.name)}
      subtitle={`${eq.location} · ${eq.distanceKm} ${isKn ? "ಕಿ.ಮೀ ದೂರ" : "km away"}`}
      footer={
        <View
          style={[
            styles.footerWrap,
            { paddingBottom: Math.max(insets.bottom + 12, 18) },
          ]}
        >
          {isAvailable ? (
            <TouchableOpacity
              onPress={() => open("requestRental", { equipmentId: eq.id })}
              activeOpacity={0.85}
              style={styles.primaryActionBtn}
            >
              <Text style={styles.primaryActionText}>
                {isKn
                  ? `ಬಾಡಿಗೆಗೆ ಕೇಳಿ (₹${eq.pricePerDay}/ದಿನ)`
                  : `Request to Rent (₹${eq.pricePerDay}/day)`}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => toggleNotify(eq.id)}
              activeOpacity={0.85}
              style={[
                styles.primaryActionBtn,
                { backgroundColor: eq.notifyMe ? "#15803d" : "#4b5563" },
              ]}
            >
              <Text style={styles.primaryActionText}>
                {eq.notifyMe
                  ? isKn
                    ? "ಲಭ್ಯವಾದಾಗ ನಿಮಗೆ ತಿಳಿಸಲಾಗುವುದು ✓"
                    : "Notification Enabled ✓"
                  : isKn
                  ? "ಲಭ್ಯವಾದಾಗ ನನಗೆ ತಿಳಿಸಿ"
                  : "Notify Me When Available"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      }
    >
      <View style={styles.heroImgCard}>
        <Image source={{ uri: eq.image }} style={styles.heroImg} />
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>{tx.name(eq.name)}</Text>
          <Text style={styles.priceHighlight}>
            ₹{eq.pricePerDay}/{isKn ? "ದಿನ" : "day"}
          </Text>
        </View>
        <Text style={styles.ownerText}>
          {isKn ? "ಮಾಲೀಕರು" : "Owner"}: {eq.owner}
        </Text>

        <View style={styles.specsGrid}>
          <View style={styles.specBox}>
            <Gauge size={16} color="#256428" />
            <Text style={styles.specVal}>{eq.hp}</Text>
            <Text style={styles.specLbl}>{isKn ? "ಶಕ್ತಿ" : "Power"}</Text>
          </View>
          <View style={styles.specBox}>
            <Fuel size={16} color="#d97706" />
            <Text style={styles.specVal}>{tx.fuel(eq.fuel)}</Text>
            <Text style={styles.specLbl}>{isKn ? "ಇಂಧನ" : "Fuel"}</Text>
          </View>
          <View style={styles.specBox}>
            <ShieldCheck size={16} color="#2563eb" />
            <Text style={styles.specVal}>{tx.condition(eq.condition)}</Text>
            <Text style={styles.specLbl}>{isKn ? "ಸ್ಥಿತಿ" : "Condition"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionHeading}>
          {isKn ? "ಸೂಕ್ತ ಬೆಳೆಗಳು" : "Suitable Crops"}
        </Text>
        <Text style={styles.bodyText}>{tx.crops(eq.crops)}</Text>
        <Text style={[styles.sectionHeading, { marginTop: 12 }]}>
          {isKn ? "ಕನಿಷ್ಠ ಬಾಡಿಗೆ ಅವಧಿ" : "Minimum Duration"}
        </Text>
        <Text style={styles.bodyText}>{tx.duration(eq.minDuration)}</Text>
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 2. Request Rental Screen                           */
/* -------------------------------------------------- */
export function RequestRentalScreen() {
  const { params, open } = useNav()
  const { equipment, requestRental } = useEquipment()
  const { lang } = useLang()
  const isKn = lang === "kn"
  const tx = useEquipText()
  const insets = useSafeAreaInsets()

  const eqId = String(params.equipmentId || params.id || equipment[0]?.id)
  const eq = equipment.find((e) => e.id === eqId) || equipment[0]

  const [days, setDays] = useState(2)

  function handleConfirm() {
    const startObj = new Date()
    const endObj = new Date(Date.now() + days * 86400000)
    const start = startObj.toISOString().slice(0, 10)
    const end = endObj.toISOString().slice(0, 10)
    requestRental(eq.id, { start, end, days })
    open("requestSent", { equipmentId: eq.id, days })
  }

  const total = eq.pricePerDay * days

  return (
    <DetailShell
      title={isKn ? "ಯಂತ್ರ ಬುಕ್ ಮಾಡಿ" : "Book Machinery"}
      subtitle={`${isKn ? "ಬುಕಿಂಗ್:" : "Booking"} ${tx.name(eq.name)}`}
      footer={
        <View
          style={[
            styles.footerWrap,
            { paddingBottom: Math.max(insets.bottom + 12, 18) },
          ]}
        >
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.85}
            style={styles.primaryActionBtn}
          >
            <Text style={styles.primaryActionText}>
              {isKn
                ? `ವಿನಂತಿ ದೃಢೀಕರಿಸಿ (₹${total})`
                : `Confirm & Send Request (₹${total})`}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ಬಾಡಿಗೆ ಅವಧಿ" : "Rental Duration"}
        </Text>
        <View style={styles.counterRow}>
          <TouchableOpacity
            onPress={() => setDays(Math.max(1, days - 1))}
            style={styles.counterBtn}
          >
            <Text style={styles.counterBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.counterVal}>{tx.days(days)}</Text>
          <TouchableOpacity
            onPress={() => setDays(days + 1)}
            style={styles.counterBtn}
          >
            <Text style={styles.counterBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ವೆಚ್ಚದ ವಿವರ" : "Cost Breakdown"}
        </Text>
        <View style={styles.rowBetween}>
          <Text style={styles.bodyText}>
            {isKn ? "ದೈನಂದಿನ ಬಾಡಿಗೆ ದರ" : "Daily Rental Rate"}
          </Text>
          <Text style={styles.boldText}>
            ₹{eq.pricePerDay} × {tx.days(days)}
          </Text>
        </View>
        <View
          style={[
            styles.rowBetween,
            {
              marginTop: 8,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: "#f3f4f6",
            },
          ]}
        >
          <Text style={styles.cardTitle}>
            {isKn ? "ಅಂದಾಜು ಒಟ್ಟು" : "Estimated Total"}
          </Text>
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
  const { open } = useNav()
  const { lang } = useLang()
  const isKn = lang === "kn"

  return (
    <DetailShell title={isKn ? "ವಿನಂತಿ ಕಳುಹಿಸಲಾಗಿದೆ" : "Request Sent"}>
      <View style={styles.centerCard}>
        <View style={styles.successIconCircle}>
          <CheckCircle2 size={48} color="#16a34a" />
        </View>
        <Text style={styles.successTitle}>
          {isKn ? "ಬುಕಿಂಗ್ ವಿನಂತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!" : "Booking Request Submitted!"}
        </Text>
        <Text style={styles.successDesc}>
          {isKn
            ? "ಯಂತ್ರದ ಮಾಲೀಕರಿಗೆ ಸೂಚನೆ ನೀಡಲಾಗಿದೆ. ಸಾಮಾನ್ಯವಾಗಿ 2 ಗಂಟೆಯೊಳಗೆ ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತಾರೆ."
            : "The equipment owner has been notified. They typically respond within 2 hours."}
        </Text>

        <TouchableOpacity
          onPress={() => open("myRentals")}
          activeOpacity={0.85}
          style={[styles.primaryActionBtn, { width: "100%", marginTop: 24 }]}
        >
          <Text style={styles.primaryActionText}>
            {isKn ? "ನನ್ನ ಬಾಡಿಗೆಗಳನ್ನು ನೋಡಿ" : "View My Rentals"}
          </Text>
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
  const { lang } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"

  return (
    <DetailShell
      title={isKn ? "ನನ್ನ ಬಾಡಿಗೆಗಳು" : "My Rentals"}
      subtitle={isKn ? "ಸಕ್ರಿಯ ಮತ್ತು ಬಾಕಿ ಬುಕಿಂಗ್‌ಗಳು" : "Active and pending bookings"}
    >
      <View style={styles.listWrap}>
        {rentals.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{tx.name(r.equipmentName)}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{r.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.ownerText}>
              {isKn ? "ಮಾಲೀಕರು" : "Owner"}: {r.owner} · {r.location}
            </Text>
            <Text style={styles.bodyText}>
              {isKn ? "ಅವಧಿ" : "Duration"}: {tx.days(r.days)} ·{" "}
              {isKn ? "ಒಟ್ಟು" : "Total"}: ₹{r.total}
            </Text>

            {r.status === "pending" && (
              <TouchableOpacity
                onPress={() => cancelRental(r.id)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>
                  {isKn ? "ಬುಕಿಂಗ್ ರದ್ದುಗೊಳಿಸಿ" : "Cancel Booking"}
                </Text>
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
  const { lang } = useLang()
  const { profile } = useProfile()
  const isKn = lang === "kn"

  return (
    <DetailShell
      title={isKn ? "ಬಾಡಿಗೆ ವಿವರಗಳು" : "Rental Details"}
      subtitle={isKn ? "ರಸೀದಿ ಮತ್ತು ಬುಕಿಂಗ್ ಮಾಹಿತಿ" : "Receipt & Booking Information"}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ಬುಕಿಂಗ್ ಸಾರಾಂಶ" : "Booking Summary"}
        </Text>
        <Text style={styles.bodyText}>
          {isKn ? "ಸ್ಥಿತಿ: ಅನುಮೋದಿತ" : "Status: Approved & Confirmed"}
        </Text>
        <Text style={styles.bodyText}>
          {isKn
            ? `ಪಡೆಯುವ ಸ್ಥಳ: ${profile.district} APMC ಯಾರ್ಡ್`
            : `Pickup location: ${profile.district} APMC Yard`}
        </Text>
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 6. List Equipment Screen                           */
/* -------------------------------------------------- */
const EQUIP_TYPES = ["Tractor", "Rotavator", "Seed Drill", "Sprayer", "Harvester"]

export function ListEquipmentScreen() {
  const { listEquipment } = useEquipment()
  const { profile } = useProfile()
  const { back } = useNav()
  const { lang } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"
  const insets = useSafeAreaInsets()

  const [name, setName] = useState("")
  const [type, setType] = useState("Tractor")
  const [price, setPrice] = useState("1200")

  function handleSubmit() {
    const cleanPrice = Number(price)
    if (!name.trim()) {
      Alert.alert(
        isKn ? "ದೋಷ" : "Missing Name",
        isKn ? "ದಯವಿಟ್ಟು ಯಂತ್ರದ ಹೆಸರು ನಮೂದಿಸಿ" : "Please enter equipment name or model."
      )
      return
    }
    if (!Number.isFinite(cleanPrice) || cleanPrice <= 0) {
      Alert.alert(
        isKn ? "ದೋಷ" : "Invalid Price",
        isKn ? "ದಯವಿಟ್ಟು ಸರಿಯಾದ ದಿನದ ದರ ನಮೂದಿಸಿ" : "Please enter a valid daily rental rate."
      )
      return
    }
    listEquipment({
      name: name.trim(),
      type,
      location: profile.district || "Mandya",
      pricePerDay: cleanPrice,
    })
    back()
  }

  return (
    <DetailShell
      title={isKn ? "ಯಂತ್ರವನ್ನು ಪಟ್ಟಿ ಮಾಡಿ" : "List Machinery"}
      subtitle={
        isKn
          ? "ನಿಮ್ಮ ಕೃಷಿ ಯಂತ್ರೋಪಕರಣಗಳಿಂದ ಬಾಡಿಗೆ ಆದಾಯ ಗಳಿಸಿ"
          : "Earn rental income from your farm equipment"
      }
      footer={
        <View
          style={[
            styles.footerWrap,
            { paddingBottom: Math.max(insets.bottom + 12, 18) },
          ]}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            style={styles.primaryActionBtn}
          >
            <Text style={styles.primaryActionText}>
              {isKn ? "ಪಟ್ಟಿಯನ್ನು ಪ್ರಕಟಿಸಿ" : "Publish Listing"}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.card}>
        <Text style={styles.label}>
          {isKn ? "ಯಂತ್ರದ ಹೆಸರು / ಮಾದರಿ" : "Equipment Name / Model"}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Mahindra 575 DI Tractor"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ಯಂತ್ರದ ವಿಧ" : "Equipment Category"}
        </Text>
        <View style={styles.typeChipRow}>
          {EQUIP_TYPES.map((tp) => {
            const active = type === tp
            return (
              <TouchableOpacity
                key={tp}
                onPress={() => setType(tp)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {tx.type(tp)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ದಿನದ ಬಾಡಿಗೆ ದರ (₹/ದಿನ)" : "Daily Rental Rate (₹/day)"}
        </Text>
        <TextInput
          value={price}
          onChangeText={(v) => setPrice(v.replace(/\D/g, ""))}
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
  const { lang } = useLang()
  const isKn = lang === "kn"
  return (
    <DetailShell title={isKn ? "ಪಟ್ಟಿ ಮುನ್ನೋಟ" : "Listing Preview"}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ಪ್ರಕಟಿಸಲು ಸಿದ್ಧವಾಗಿದೆ" : "Preview Ready"}
        </Text>
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
  const { lang } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"

  return (
    <DetailShell
      title={isKn ? "ನನ್ನ ಯಂತ್ರೋಪಕರಣಗಳು" : "My Equipment"}
      subtitle={isKn ? "ನಿಮ್ಮ ಖಾತೆಯ ಅಡಿಯಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಿದ ಯಂತ್ರಗಳು" : "Machinery listed under your farmer account"}
      action={
        <TouchableOpacity onPress={() => open("listEquipment")} style={styles.headerAddBtn}>
          <Plus size={18} color="#ffffff" />
        </TouchableOpacity>
      }
    >
      <View style={styles.listWrap}>
        {mine.map((eq) => (
          <View key={eq.id} style={styles.card}>
            <Text style={styles.cardTitle}>{tx.name(eq.name)}</Text>
            <Text style={styles.priceHighlight}>
              ₹{eq.pricePerDay}/{isKn ? "ದಿನ" : "day"}
            </Text>
            <Text style={styles.bodyText}>
              {isKn ? "ಸ್ಥಿತಿ" : "Status"}: {eq.availability}
            </Text>
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
  const { lang } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"

  return (
    <DetailShell
      title={isKn ? "ಬಾಡಿಗೆ ವಿನಂತಿಗಳು" : "Rental Requests"}
      subtitle={isKn ? "ನಿಮ್ಮ ಯಂತ್ರ ಬಾಡಿಗೆಗೆ ಕೇಳುತ್ತಿರುವ ರೈತರು" : "Farmers requesting your machinery"}
    >
      <View style={styles.listWrap}>
        {ownerRequests.map((req) => (
          <View key={req.id} style={styles.card}>
            <Text style={styles.cardTitle}>{tx.name(req.equipmentName)}</Text>
            <Text style={styles.ownerText}>
              {isKn ? "ಬಾಡಿಗೆದಾರ" : "Renter"}: {req.renter} · {req.location}
            </Text>
            <Text style={styles.bodyText}>
              {isKn ? "ಒಟ್ಟು" : "Total"}: ₹{req.total} ({tx.days(req.days)})
            </Text>

            {req.status === "pending" && (
              <View style={styles.actionBtnRow}>
                <TouchableOpacity
                  onPress={() => rejectRequest(req.id)}
                  style={styles.rejectBtn}
                >
                  <Text style={styles.rejectBtnText}>
                    {isKn ? "ತಿರಸ್ಕರಿಸಿ" : "Decline"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => acceptRequest(req.id)}
                  style={styles.acceptBtn}
                >
                  <Text style={styles.acceptBtnText}>
                    {isKn ? "ಒಪ್ಪಿಕೊಳ್ಳಿ" : "Accept"}
                  </Text>
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
  const { lang } = useLang()
  const isKn = lang === "kn"

  const approvedTotal = ownerRequests
    .filter((r) => r.status === "approved")
    .reduce((acc, r) => acc + r.total, 0)
  const pendingTotal = ownerRequests
    .filter((r) => r.status === "pending")
    .reduce((acc, r) => acc + r.total, 0)

  return (
    <DetailShell
      title={isKn ? "ಮಾಲೀಕರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" : "Owner Dashboard"}
      subtitle={isKn ? "ಬುಕಿಂಗ್ ಮತ್ತು ಗಳಿಕೆಯನ್ನು ನಿರ್ವಹಿಸಿ" : "Manage bookings & equipment earnings"}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ಬಾಡಿಗೆ ಸಾರಾಂಶ" : "Earnings & Fleet Summary"}
        </Text>
        <Text style={styles.priceHighlight}>
          ₹{approvedTotal.toLocaleString("en-IN")}
        </Text>
        <Text style={styles.bodyText}>
          {isKn
            ? `ಅನುಮೋದಿತ ಗಳಿಕೆ (${mine.length} ಯಂತ್ರಗಳು, ₹${pendingTotal.toLocaleString("en-IN")} ಬಾಕಿ ವಿನಂತಿಗಳು)`
            : `Approved earnings across ${mine.length} machines (₹${pendingTotal.toLocaleString("en-IN")} in pending requests)`}
        </Text>
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 11. Rental History Screen                          */
/* -------------------------------------------------- */
export function RentalHistoryScreen() {
  const { rentals } = useEquipment()
  const { lang } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"
  const completed = rentals.filter((r) => r.status === "completed")

  return (
    <DetailShell
      title={isKn ? "ಬಾಡಿಗೆ ಇತಿಹಾಸ" : "Rental History"}
      subtitle={isKn ? "ಪೂರ್ಣಗೊಂಡ ಯಂತ್ರ ಬಾಡಿಗೆಗಳು" : "Past completed machinery rentals"}
    >
      {completed.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.bodyText}>
            {isKn ? "ಇನ್ನೂ ಯಾವುದೇ ಪೂರ್ಣಗೊಂಡ ಬಾಡಿಗೆ ಇಲ್ಲ." : "No completed rentals yet."}
          </Text>
        </View>
      ) : (
        completed.map((r) => (
          <View key={r.id} style={styles.card}>
            <Text style={styles.cardTitle}>{tx.name(r.equipmentName)}</Text>
            <Text style={styles.bodyText}>
              {r.startDate} – {r.endDate} · ₹{r.total} ({tx.days(r.days)})
            </Text>
          </View>
        ))
      )}
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 12. Rental Notifications Screen                    */
/* -------------------------------------------------- */
export function RentalNotificationsScreen() {
  const { notifications, markNotifsRead } = useEquipment()
  const { lang } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"

  return (
    <DetailShell
      title={isKn ? "ಬಾಡಿಗೆ ಎಚ್ಚರಿಕೆಗಳು" : "Rental Alerts"}
      action={
        <TouchableOpacity onPress={markNotifsRead} style={styles.headerAddBtn}>
          <Bell size={16} color="#ffffff" />
        </TouchableOpacity>
      }
    >
      <View style={styles.listWrap}>
        {notifications.map((n) => {
          const rendered = tx.notif(n)
          return (
            <View key={n.id} style={styles.card}>
              <Text style={styles.cardTitle}>{rendered.title}</Text>
              <Text style={styles.bodyText}>{rendered.body}</Text>
              <Text style={styles.ownerText}>{rendered.time}</Text>
            </View>
          )
        })}
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
    paddingHorizontal: 18,
    paddingTop: 14,
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
  typeChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  chipActive: {
    backgroundColor: "#256428",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },
  chipTextActive: {
    color: "#ffffff",
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
