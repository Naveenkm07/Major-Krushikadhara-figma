import { useEffect, useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Switch,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNav } from "../nav"
import {
  useEquipment,
  useEquipText,
  EQUIP_PRESET_IMAGES,
  type Equipment,
  type RawAvailability,
  type RentalStatus,
} from "../equipment"
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
  Star,
  Phone,
  MapPin,
  Truck,
  UserCheck,
  Calendar,
  Camera,
  Image as ImageIcon,
  Edit3,
  Trash2,
  Eye,
  Check,
  Clock,
  Store,
  ChevronRight,
  Navigation,
  Wrench,
} from "lucide-react-native"

const STATUS_STYLE: Record<
  RentalStatus,
  { bg: string; fg: string }
> = {
  pending: { bg: "#fef3c7", fg: "#b45309" },
  approved: { bg: "#dbeafe", fg: "#1d4ed8" },
  active: { bg: "#dcfce7", fg: "#15803d" },
  completed: { bg: "#e5e7eb", fg: "#374151" },
  cancelled: { bg: "#fee2e2", fg: "#dc2626" },
  rejected: { bg: "#fee2e2", fg: "#dc2626" },
}

function callPhone(phone?: string) {
  if (!phone) return
  Linking.openURL(`tel:${phone}`).catch(() => {})
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

/* -------------------------------------------------- */
/* 1. Equipment Details Screen                        */
/* -------------------------------------------------- */
export function EquipmentDetailsScreen() {
  const { params, open } = useNav()
  const { getEquipment, equipment, toggleNotify } = useEquipment()
  const { lang } = useLang()
  const isKn = lang === "kn"
  const tx = useEquipText()
  const insets = useSafeAreaInsets()

  const eqId = String(params.equipmentId || params.id || equipment[0]?.id || "")
  const eq = getEquipment(eqId) || equipment[0]

  if (!eq) {
    return (
      <DetailShell title={isKn ? "ಯಂತ್ರ ವಿವರ" : "Equipment Details"}>
        <View style={styles.card}>
          <Text style={styles.bodyText}>
            {isKn ? "ಯಂತ್ರ ಲಭ್ಯವಿಲ್ಲ." : "Equipment not found."}
          </Text>
        </View>
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
          {eq.mine ? (
            <TouchableOpacity
              onPress={() => open("listEquipment", { equipmentId: eq.id })}
              activeOpacity={0.85}
              style={styles.primaryActionBtn}
            >
              <Text style={styles.primaryActionText}>
                {isKn ? "ಪಟ್ಟಿಯನ್ನು ನಿರ್ವಹಿಸಿ" : "Manage Listing"}
              </Text>
            </TouchableOpacity>
          ) : isAvailable ? (
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
        <View
          style={[
            styles.heroBadge,
            { backgroundColor: isAvailable ? "#dcfce7" : "#fef3c7" },
          ]}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: isAvailable ? "#15803d" : "#b45309",
            }}
          >
            {isAvailable
              ? isKn
                ? "ಲಭ್ಯವಿದೆ"
                : "Available"
              : eq.rawAvailability === "MAINTENANCE"
              ? isKn
                ? "ದುರಸ್ತಿಯಲ್ಲಿದೆ"
                : "Maintenance"
              : isKn
              ? "ಬುಕ್ ಆಗಿದೆ"
              : "Booked"}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={[styles.cardTitle, { flex: 1 }]}>{tx.name(eq.name)}</Text>
          <Text style={styles.priceHighlight}>
            ₹{eq.pricePerDay.toLocaleString("en-IN")}/{isKn ? "ದಿನ" : "day"}
          </Text>
        </View>

        <View style={[styles.rowBetween, { marginTop: 8 }]}>
          <View style={styles.inlineRow}>
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.boldText}>{eq.rating.toFixed(1)}</Text>
            <Text style={styles.mutedSmall}>
              ({eq.reviews} {isKn ? "ವಿಮರ್ಶೆಗಳು" : "reviews"})
            </Text>
          </View>
          <View style={styles.inlineRow}>
            <MapPin size={13} color="#6b7280" />
            <Text style={styles.mutedSmall}>
              {eq.location} · {eq.distanceKm} {isKn ? "ಕಿ.ಮೀ" : "km"}
            </Text>
          </View>
        </View>

        {/* Owner Row with Direct Call */}
        <View style={styles.ownerBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.mutedSmall}>
              {isKn ? "ಯಂತ್ರದ ಮಾಲೀಕರು" : "Machinery Owner"}
            </Text>
            <Text style={styles.boldText}>{eq.owner}</Text>
          </View>
          {!!eq.ownerPhone && (
            <TouchableOpacity
              onPress={() => callPhone(eq.ownerPhone)}
              style={styles.callPillBtn}
            >
              <Phone size={14} color="#256428" />
              <Text style={styles.callPillText}>{isKn ? "ಕರೆ ಮಾಡಿ" : "Call"}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.specsGrid}>
          <View style={styles.specBox}>
            <Gauge size={16} color="#256428" />
            <Text style={styles.specVal} numberOfLines={1}>
              {eq.hp}
            </Text>
            <Text style={styles.specLbl}>{isKn ? "ಶಕ್ತಿ" : "Power"}</Text>
          </View>
          <View style={styles.specBox}>
            <Fuel size={16} color="#d97706" />
            <Text style={styles.specVal} numberOfLines={1}>
              {tx.fuel(eq.fuel)}
            </Text>
            <Text style={styles.specLbl}>{isKn ? "ಇಂಧನ" : "Fuel"}</Text>
          </View>
          <View style={styles.specBox}>
            <ShieldCheck size={16} color="#2563eb" />
            <Text style={styles.specVal} numberOfLines={1}>
              {tx.condition(eq.condition)}
            </Text>
            <Text style={styles.specLbl}>{isKn ? "ಸ್ಥಿತಿ" : "Condition"}</Text>
          </View>
        </View>
      </View>

      {/* Delivery & Operator Options Card */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>
          {isKn ? "ತಲುಪಿಸುವಿಕೆ ಮತ್ತು ಚಾಲಕ ಸೌಲಭ್ಯ" : "Delivery & Operator Options"}
        </Text>
        <View style={styles.optionInfoRow}>
          <Truck size={16} color={eq.deliveryAvailable ? "#15803d" : "#9ca3af"} />
          <Text style={styles.bodyText}>
            {eq.deliveryAvailable
              ? isKn
                ? `ಹೊಲಕ್ಕೆ ತಲುಪಿಸಲಾಗುತ್ತದೆ (₹${eq.deliveryFee || 0} ಶುಲ್ಕ)`
                : `Farm delivery available (+₹${eq.deliveryFee || 0} one-time fee)`
              : isKn
              ? "ಮಾಲೀಕರ ಸ್ಥಳದಿಂದ ತಾವೇ ತೆಗೆದುಕೊಂಡು ಹೋಗಬೇಕು"
              : "Self-pickup only from owner's location"}
          </Text>
        </View>
        <View style={styles.optionInfoRow}>
          <UserCheck size={16} color={eq.operatorIncluded ? "#1d4ed8" : "#9ca3af"} />
          <Text style={styles.bodyText}>
            {eq.operatorIncluded
              ? isKn
                ? `ಅನುಭವಿ ಚಾಲಕ ಲಭ್ಯವಿದೆ (+₹${eq.operatorFeePerDay || 0}/ದಿನ)`
                : `Trained operator available (+₹${eq.operatorFeePerDay || 0}/day)`
              : isKn
              ? "ಚಾಲಕರಿಲ್ಲದೆ ಯಂತ್ರ ಮಾತ್ರ ಲಭ್ಯ"
              : "Machine only (self-operated)"}
          </Text>
        </View>
      </View>

      {/* Crops, Min Duration & Description */}
      <View style={styles.card}>
        {!!eq.description && (
          <>
            <Text style={styles.sectionHeading}>
              {isKn ? "ಯಂತ್ರದ ವಿವರಣೆ" : "Description"}
            </Text>
            <Text style={[styles.bodyText, { marginBottom: 12, lineHeight: 20 }]}>
              {eq.description}
            </Text>
          </>
        )}
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
  const { getEquipment, equipment, requestRental } = useEquipment()
  const { lang } = useLang()
  const isKn = lang === "kn"
  const tx = useEquipText()
  const insets = useSafeAreaInsets()

  const eqId = String(params.equipmentId || params.id || equipment[0]?.id || "")
  const eq = getEquipment(eqId) || equipment[0]

  const minDays = useMemo(() => {
    const m = /^(\d+)/.exec(eq?.minDuration || "1")
    return m ? Math.max(1, Number(m[1])) : 1
  }, [eq?.minDuration])

  const [startOffset, setStartOffset] = useState(1) // Tomorrow by default
  const [days, setDays] = useState(Math.max(2, minDays))
  const [pickupMode, setPickupMode] = useState<"pickup" | "delivery">("pickup")
  const [includeOperator, setIncludeOperator] = useState(false)
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setDays(Math.max(2, minDays))
    setPickupMode("pickup")
    setIncludeOperator(false)
    setNotes("")
  }, [eq?.id, minDays])

  if (!eq) {
    return (
      <DetailShell title={isKn ? "ಯಂತ್ರ ಬುಕ್ ಮಾಡಿ" : "Book Machinery"}>
        <View style={styles.card}>
          <Text style={styles.bodyText}>{isKn ? "ಯಂತ್ರ ಸಿಗಲಿಲ್ಲ." : "Equipment not found."}</Text>
        </View>
      </DetailShell>
    )
  }

  const startObj = new Date(Date.now() + startOffset * 86400000)
  const endObj = new Date(startObj.getTime() + days * 86400000)
  const baseTotal = eq.pricePerDay * days
  const deliveryFee =
    pickupMode === "delivery" && eq.deliveryAvailable ? eq.deliveryFee || 0 : 0
  const operatorFee =
    includeOperator && eq.operatorIncluded
      ? (eq.operatorFeePerDay || 0) * days
      : 0
  const grandTotal = baseTotal + deliveryFee + operatorFee

  async function handleConfirm() {
    if (submitting) return
    setSubmitting(true)
    try {
      const created = await requestRental(eq.id, {
        start: startObj.toISOString().slice(0, 10),
        end: endObj.toISOString().slice(0, 10),
        days,
        pickupMode,
        includeOperator,
        notes: notes.trim(),
      })
      if (!created) {
        Alert.alert(
          isKn ? "ಬುಕಿಂಗ್ ಸಾಧ್ಯವಾಗಲಿಲ್ಲ" : "Booking Failed",
          isKn
            ? "ಈ ಯಂತ್ರವನ್ನು ಈಗ ಬುಕ್ ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ."
            : "This equipment is currently unavailable for booking."
        )
        return
      }
      open("requestSent", {
        equipmentId: eq.id,
        days,
        booking: created,
      })
    } catch (err: any) {
      Alert.alert(
        isKn ? "ಬುಕಿಂಗ್ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ" : "Booking Unavailable",
        err?.message ||
          (isKn
            ? "ಈ ಯಂತ್ರವು ಪ್ರಸ್ತುತ ಬಾಡಿಗೆಗೆ ಲಭ್ಯವಿಲ್ಲ."
            : "This equipment is currently unavailable for booking.")
      )
    } finally {
      setSubmitting(false)
    }
  }

  const startChips = [
    { offset: 0, label: isKn ? "ಇಂದು" : "Today" },
    { offset: 1, label: isKn ? "ನಾಳೆ" : "Tomorrow" },
    { offset: 2, label: formatShortDate(new Date(Date.now() + 2 * 86400000)) },
    { offset: 3, label: formatShortDate(new Date(Date.now() + 3 * 86400000)) },
  ]

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
            disabled={submitting}
            activeOpacity={0.85}
            style={styles.primaryActionBtn}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryActionText}>
                {isKn
                  ? `ವಿನಂತಿ ದೃಢೀಕರಿಸಿ (₹${grandTotal.toLocaleString("en-IN")})`
                  : `Confirm & Send Request (₹${grandTotal.toLocaleString("en-IN")})`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      }
    >
      {/* Start Date */}
      <View style={styles.card}>
        <View style={styles.inlineRow}>
          <Calendar size={16} color="#256428" />
          <Text style={styles.cardTitle}>
            {isKn ? "ಬಾಡಿಗೆ ಆರಂಭ ದಿನಾಂಕ" : "Rental Start Date"}
          </Text>
        </View>
        <View style={[styles.typeChipRow, { marginTop: 10 }]}>
          {startChips.map((ch) => {
            const active = startOffset === ch.offset
            return (
              <TouchableOpacity
                key={ch.offset}
                onPress={() => setStartOffset(ch.offset)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {ch.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <Text style={styles.mutedSmall}>
          {isKn ? "ಅವಧಿ:" : "Schedule:"} {formatShortDate(startObj)} → {formatShortDate(endObj)}
        </Text>
      </View>

      {/* Duration Stepper */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>
            {isKn ? "ಬಾಡಿಗೆ ಅವಧಿ" : "Rental Duration"}
          </Text>
          <Text style={styles.mutedSmall}>
            {isKn ? `ಕನಿಷ್ಠ: ${minDays} ದಿನ` : `Min: ${minDays} day(s)`}
          </Text>
        </View>
        <View style={styles.counterRow}>
          <TouchableOpacity
            onPress={() => setDays(Math.max(minDays, days - 1))}
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

      {/* Pickup & Operator Options */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ಪಡೆಯುವಿಕೆ ಮತ್ತು ಚಾಲಕ ಆಯ್ಕೆಗಳು" : "Pickup & Operator Options"}
        </Text>
        <View style={[styles.typeChipRow, { marginTop: 10 }]}>
          <TouchableOpacity
            onPress={() => setPickupMode("pickup")}
            style={[styles.chip, pickupMode === "pickup" && styles.chipActive]}
          >
            <Text
              style={[
                styles.chipText,
                pickupMode === "pickup" && styles.chipTextActive,
              ]}
            >
              {isKn ? "ತಾವೇ ತೆಗೆದುಕೊಳ್ಳುವುದು (₹0)" : "Self-Pickup (₹0)"}
            </Text>
          </TouchableOpacity>
          {eq.deliveryAvailable && (
            <TouchableOpacity
              onPress={() => setPickupMode("delivery")}
              style={[styles.chip, pickupMode === "delivery" && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  pickupMode === "delivery" && styles.chipTextActive,
                ]}
              >
                {isKn
                  ? `ಹೊಲಕ್ಕೆ ತಲುಪಿಸುವಿಕೆ (+₹${eq.deliveryFee || 0})`
                  : `Farm Delivery (+₹${eq.deliveryFee || 0})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {eq.operatorIncluded && (
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.boldText}>
                {isKn ? "ಅನುಭವಿ ಚಾಲಕರನ್ನು ಸೇರಿಸಿ" : "Include Experienced Operator"}
              </Text>
              <Text style={styles.mutedSmall}>
                +₹{eq.operatorFeePerDay || 0}/{isKn ? "ದಿನ" : "day"}
              </Text>
            </View>
            <Switch
              value={includeOperator}
              onValueChange={setIncludeOperator}
              trackColor={{ false: "#d1d5db", true: "#86efac" }}
              thumbColor={includeOperator ? "#256428" : "#f4f3f4"}
            />
          </View>
        )}

        <Text style={[styles.label, { marginTop: 14 }]}>
          {isKn ? "ಮಾಲೀಕರಿಗೆ ಸಂದೇಶ / ಹೊಲದ ವಿಳಾಸ (ಐಚ್ಛಿಕ)" : "Message / Field Location Note (Optional)"}
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder={
            isKn
              ? "ಉದಾ: ನನ್ನ 2 ಎಕರೆ ಭತ್ತದ ಗದ್ದೆ ಉಳುಮೆಗೆ ಬೇಕು..."
              : "e.g. Need for 2 acres paddy field near canal..."
          }
          style={[styles.input, { minHeight: 68, textAlignVertical: "top" }]}
        />
      </View>

      {/* Itemized Cost Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ವೆಚ್ಚದ ವಿವರ" : "Cost Breakdown"}
        </Text>
        <View style={[styles.rowBetween, { marginTop: 10 }]}>
          <Text style={styles.bodyText}>
            {isKn ? "ಯಂತ್ರ ಬಾಡಿಗೆ" : "Machine Rental"} (₹{eq.pricePerDay} × {days})
          </Text>
          <Text style={styles.boldText}>₹{baseTotal.toLocaleString("en-IN")}</Text>
        </View>
        {deliveryFee > 0 && (
          <View style={[styles.rowBetween, { marginTop: 6 }]}>
            <Text style={styles.bodyText}>
              {isKn ? "ಹೊಲಕ್ಕೆ ತಲುಪಿಸುವ ಶುಲ್ಕ" : "Farm Delivery Fee"}
            </Text>
            <Text style={styles.boldText}>₹{deliveryFee.toLocaleString("en-IN")}</Text>
          </View>
        )}
        {operatorFee > 0 && (
          <View style={[styles.rowBetween, { marginTop: 6 }]}>
            <Text style={styles.bodyText}>
              {isKn ? "ಚಾಲಕ ಶುಲ್ಕ" : "Operator Charges"}
            </Text>
            <Text style={styles.boldText}>₹{operatorFee.toLocaleString("en-IN")}</Text>
          </View>
        )}
        <View style={styles.dividerRow}>
          <Text style={styles.cardTitle}>
            {isKn ? "ಅಂದಾಜು ಒಟ್ಟು" : "Estimated Total"}
          </Text>
          <Text style={styles.priceHighlight}>
            ₹{grandTotal.toLocaleString("en-IN")}
          </Text>
        </View>
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 3. Request Sent Screen                             */
/* -------------------------------------------------- */
export function RequestSentScreen() {
  const { open, params } = useNav()
  const { rentals } = useEquipment()
  const { lang } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"

  const booking = params.booking || rentals[0]

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
            ? "ಯಂತ್ರದ ಮಾಲೀಕರಿಗೆ ಸೂಚನೆ ನೀಡಲಾಗಿದೆ. ಅನುಮೋದನೆ ಸಿಕ್ಕ ತಕ್ಷಣ ನಿಮಗೆ ತಿಳಿಸಲಾಗುತ್ತದೆ."
            : "The equipment owner has been notified and will confirm your dates shortly."}
        </Text>

        {booking && (
          <View style={styles.receiptBox}>
            <View style={styles.rowBetween}>
              <Text style={styles.mutedSmall}>{isKn ? "ಯಂತ್ರ" : "Machinery"}</Text>
              <Text style={styles.boldText}>{tx.name(booking.equipmentName)}</Text>
            </View>
            <View style={[styles.rowBetween, { marginTop: 6 }]}>
              <Text style={styles.mutedSmall}>{isKn ? "ದಿನಾಂಕಗಳು" : "Dates"}</Text>
              <Text style={styles.boldText}>
                {booking.startDate} – {booking.endDate} ({tx.days(booking.days)})
              </Text>
            </View>
            <View style={[styles.rowBetween, { marginTop: 6 }]}>
              <Text style={styles.mutedSmall}>{isKn ? "ಒಟ್ಟು ಮೊತ್ತ" : "Total Estimate"}</Text>
              <Text style={styles.priceHighlight}>
                ₹{Number(booking.total || 0).toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={() => open("myRentals")}
          activeOpacity={0.85}
          style={[styles.primaryActionBtn, { width: "100%", marginTop: 20 }]}
        >
          <Text style={styles.primaryActionText}>
            {isKn ? "ನನ್ನ ಬಾಡಿಗೆಗಳನ್ನು ನೋಡಿ" : "View My Rentals"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => open("equipment")}
          activeOpacity={0.8}
          style={styles.secondaryOutlineBtn}
        >
          <Text style={styles.secondaryOutlineText}>
            {isKn ? "ಇನ್ನಷ್ಟು ಯಂತ್ರಗಳನ್ನು ನೋಡಿ" : "Browse More Equipment"}
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
  const { rentals, cancelRental, completeRental } = useEquipment()
  const { open } = useNav()
  const { lang, t } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"
  const statusMap = t.x.equipmentA.status as Record<string, string>
  const [tab, setTab] = useState<"all" | "pending" | "active" | "completed">("all")

  const filtered = useMemo(() => {
    if (tab === "all") return rentals
    if (tab === "pending") return rentals.filter((r) => r.status === "pending")
    if (tab === "active")
      return rentals.filter((r) => r.status === "approved" || r.status === "active")
    return rentals.filter(
      (r) =>
        r.status === "completed" ||
        r.status === "cancelled" ||
        r.status === "rejected"
    )
  }, [rentals, tab])

  function confirmCancel(rentalId: string) {
    Alert.alert(
      isKn ? "ಬುಕಿಂಗ್ ರದ್ದುಮಾಡಬೇಕೇ?" : "Cancel Rental Request?",
      isKn
        ? "ನೀವು ರದ್ದುಮಾಡಿದ ಬಗ್ಗೆ ಮಾಲೀಕರಿಗೆ ತಿಳಿಸಲಾಗುತ್ತದೆ."
        : "The machinery owner will be notified.",
      [
        { text: isKn ? "ಬೇಡ" : "Keep", style: "cancel" },
        {
          text: isKn ? "ಹೌದು, ರದ್ದುಮಾಡಿ" : "Yes, Cancel",
          style: "destructive",
          onPress: () => cancelRental(rentalId),
        },
      ]
    )
  }

  return (
    <DetailShell
      title={isKn ? "ನನ್ನ ಬಾಡಿಗೆಗಳು" : "My Rentals"}
      subtitle={isKn ? "ಸಕ್ರಿಯ ಮತ್ತು ಹಿಂದಿನ ಬುಕಿಂಗ್‌ಗಳು" : "Active, pending & past bookings"}
    >
      {/* Tabs */}
      <View style={styles.tabRow}>
        {(
          [
            { id: "all", label: isKn ? "ಎಲ್ಲಾ" : "All" },
            { id: "pending", label: isKn ? "ಬಾಕಿ" : "Pending" },
            { id: "active", label: isKn ? "ಸಕ್ರಿಯ" : "Active" },
            { id: "completed", label: isKn ? "ಹಿಂದಿನ" : "Past" },
          ] as const
        ).map((tb) => {
          const active = tab === tb.id
          return (
            <TouchableOpacity
              key={tb.id}
              onPress={() => setTab(tb.id)}
              style={[styles.tabPill, active && styles.tabPillActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tb.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.bodyText}>{t.x.equipmentA.my.none}</Text>
          <TouchableOpacity
            onPress={() => open("equipment")}
            style={[styles.secondaryOutlineBtn, { marginTop: 12 }]}
          >
            <Text style={styles.secondaryOutlineText}>
              {isKn ? "ಯಂತ್ರಗಳನ್ನು ಹುಡುಕಿ" : "Find Equipment"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listWrap}>
          {filtered.map((r) => {
            const st = STATUS_STYLE[r.status] || STATUS_STYLE.pending
            return (
              <TouchableOpacity
                key={r.id}
                onPress={() => open("rentalDetails", { rentalId: r.id })}
                activeOpacity={0.9}
                style={styles.card}
              >
                <View style={styles.thumbCardRow}>
                  <Image source={{ uri: r.image }} style={styles.thumbImg} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.rowBetween}>
                      <Text style={[styles.cardTitle, { flex: 1 }]} numberOfLines={1}>
                        {tx.name(r.equipmentName)}
                      </Text>
                      <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                        <Text style={[styles.statusText, { color: st.fg }]}>
                          {statusMap[r.status] || r.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.ownerText}>
                      {isKn ? "ಮಾಲೀಕರು" : "Owner"}: {r.owner} · {r.location}
                    </Text>
                    <Text style={styles.bodyText}>
                      {r.startDate} – {r.endDate} · {tx.days(r.days)} ·{" "}
                      <Text style={styles.boldText}>₹{r.total.toLocaleString("en-IN")}</Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooterBtns}>
                  <TouchableOpacity
                    onPress={() => open("rentalDetails", { rentalId: r.id })}
                    style={styles.smallLinkBtn}
                  >
                    <Text style={styles.smallLinkText}>
                      {isKn ? "ವಿವರ ಮತ್ತು ರಸೀದಿ" : "Details & Receipt"}
                    </Text>
                    <ChevronRight size={14} color="#256428" />
                  </TouchableOpacity>

                  {(r.status === "pending" || r.status === "approved") && (
                    <TouchableOpacity
                      onPress={() => confirmCancel(r.id)}
                      style={styles.cancelBtn}
                    >
                      <Text style={styles.cancelBtnText}>
                        {isKn ? "ರದ್ದುಮಾಡಿ" : "Cancel"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {r.status === "active" && (
                    <TouchableOpacity
                      onPress={() => completeRental(r.id)}
                      style={styles.completeMiniBtn}
                    >
                      <Text style={styles.completeMiniText}>
                        {isKn ? "ಹಿಂತಿರುಗಿಸಲಾಗಿದೆ" : "Mark Returned"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {r.status === "completed" && !r.rating && (
                    <TouchableOpacity
                      onPress={() => open("rentalDetails", { rentalId: r.id })}
                      style={styles.rateMiniBtn}
                    >
                      <Star size={12} color="#b45309" fill="#f59e0b" />
                      <Text style={styles.rateMiniText}>
                        {isKn ? "ರೇಟಿಂಗ್ ನೀಡಿ" : "Rate Now"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      )}
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 5. Rental Details & Receipt / Review Screen        */
/* -------------------------------------------------- */
export function RentalDetailsScreen() {
  const { params } = useNav()
  const {
    rentals,
    ownerRequests,
    getEquipment,
    getRental,
    cancelRental,
    acceptRequest,
    rejectRequest,
    startRentalHandover,
    completeRental,
    submitRentalReview,
  } = useEquipment()
  const { lang, t } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"
  const statusMap = t.x.equipmentA.status as Record<string, string>

  const rentalId = String(params.rentalId || params.id || rentals[0]?.id || "")
  const directRental = rentalId ? getRental(rentalId) : undefined
  const matchedOwnerReq = !directRental
    ? ownerRequests.find((r) => r.id === rentalId)
    : undefined
  const isOwnerView = Boolean(matchedOwnerReq)

  const rental =
    directRental ||
    (matchedOwnerReq
      ? {
          id: matchedOwnerReq.id,
          equipmentId: matchedOwnerReq.equipmentId,
          equipmentName: matchedOwnerReq.equipmentName,
          owner: "",
          renter: matchedOwnerReq.renter,
          renterPhone: matchedOwnerReq.renterPhone,
          location: matchedOwnerReq.location,
          image:
            getEquipment(matchedOwnerReq.equipmentId)?.image ||
            EQUIP_PRESET_IMAGES.Tractor,
          startDate: matchedOwnerReq.startDate,
          endDate: matchedOwnerReq.endDate,
          days: matchedOwnerReq.days,
          pricePerDay: Math.round(
            Math.max(
              0,
              matchedOwnerReq.total -
                (matchedOwnerReq.deliveryFee || 0) -
                (matchedOwnerReq.operatorFee || 0)
            ) / Math.max(1, matchedOwnerReq.days)
          ),
          deliveryFee: matchedOwnerReq.deliveryFee || 0,
          operatorFee: matchedOwnerReq.operatorFee || 0,
          total: matchedOwnerReq.total,
          pickupMode: matchedOwnerReq.pickupMode || "pickup",
          operatorIncluded: Boolean(matchedOwnerReq.operatorIncluded),
          notes: matchedOwnerReq.notes,
          rating: matchedOwnerReq.rating,
          reviewComment: matchedOwnerReq.reviewComment,
          status: matchedOwnerReq.status,
        }
      : rentals[0])

  const [starVal, setStarVal] = useState<number>(rental?.rating || 5)
  const [comment, setComment] = useState<string>(rental?.reviewComment || "")
  const [reviewSaving, setReviewSaving] = useState(false)

  useEffect(() => {
    setStarVal(rental?.rating || 5)
    setComment(rental?.reviewComment || "")
  }, [rental?.id, rental?.rating, rental?.reviewComment])

  if (!rental) {
    return (
      <DetailShell title={isKn ? "ಬಾಡಿಗೆ ವಿವರಗಳು" : "Rental Details"}>
        <View style={styles.card}>
          <Text style={styles.bodyText}>{t.x.equipmentA.rd.notFound}</Text>
        </View>
      </DetailShell>
    )
  }

  const st = STATUS_STYLE[rental.status] || STATUS_STYLE.pending
  const steps: Array<{ key: RentalStatus; en: string; kn: string }> = [
    { key: "pending", en: "Requested", kn: "ಕೋರಲಾಗಿದೆ" },
    { key: "approved", en: "Approved", kn: "ಅನುಮೋದಿತ" },
    { key: "active", en: "Active", kn: "ಚಾಲ್ತಿಯಲ್ಲಿ" },
    { key: "completed", en: "Completed", kn: "ಪೂರ್ಣ" },
  ]
  const currentIdx = steps.findIndex((s) => s.key === rental.status)

  async function handleSaveReview() {
    if (!rental) return
    setReviewSaving(true)
    try {
      const ok = await submitRentalReview(rental.id, starVal, comment.trim())
      if (ok) {
        Alert.alert(
          isKn ? "ಧನ್ಯವಾದಗಳು ✓" : "Thank You ✓",
          isKn
            ? "ನಿಮ್ಮ ರೇಟಿಂಗ್ ಮತ್ತು ವಿಮರ್ಶೆಯನ್ನು ಉಳಿಸಲಾಗಿದೆ."
            : "Your rating and review have been saved."
        )
      }
    } finally {
      setReviewSaving(false)
    }
  }

  return (
    <DetailShell
      title={isKn ? "ಬಾಡಿಗೆ ವಿವರಗಳು" : "Rental Details"}
      subtitle={`${tx.name(rental.equipmentName)} · #${rental.id.slice(-6)}`}
    >
      {/* Status Timeline Card */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>
            {isKn ? "ಬುಕಿಂಗ್ ಸ್ಥಿತಿ" : "Booking Status"}
          </Text>
          <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
            <Text style={[styles.statusText, { color: st.fg }]}>
              {statusMap[rental.status] || rental.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {currentIdx >= 0 && (
          <View style={styles.timelineRow}>
            {steps.map((s, idx) => {
              const done = idx <= currentIdx
              return (
                <View key={s.key} style={styles.timelineStep}>
                  <View
                    style={[
                      styles.timelineDot,
                      done && styles.timelineDotDone,
                    ]}
                  >
                    {done && <Check size={11} color="#ffffff" />}
                  </View>
                  <Text
                    style={[
                      styles.timelineLbl,
                      done && { color: "#15803d", fontWeight: "700" },
                    ]}
                  >
                    {isKn ? s.kn : s.en}
                  </Text>
                </View>
              )
            })}
          </View>
        )}
      </View>

      {/* Equipment & Contact Card */}
      <View style={styles.card}>
        <View style={styles.thumbCardRow}>
          <Image source={{ uri: rental.image }} style={styles.thumbImg} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{tx.name(rental.equipmentName)}</Text>
            <Text style={styles.ownerText}>
              {rental.owner
                ? `${isKn ? "ಮಾಲೀಕರು" : "Owner"}: ${rental.owner}`
                : `${isKn ? "ಬಾಡಿಗೆದಾರ" : "Renter"}: ${rental.renter}`}
            </Text>
            <Text style={styles.mutedSmall}>{rental.location}</Text>
          </View>
        </View>

        {!!(rental.ownerPhone || rental.renterPhone) && (
          <TouchableOpacity
            onPress={() => callPhone(rental.ownerPhone || rental.renterPhone)}
            style={[styles.callPillBtn, { marginTop: 12, alignSelf: "flex-start" }]}
          >
            <Phone size={14} color="#256428" />
            <Text style={styles.callPillText}>
              {isKn ? "ಸಂಪರ್ಕಿಸಿ / ಕರೆ ಮಾಡಿ" : "Call Contact"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Receipt Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ರಸೀದಿ ಮತ್ತು ವೆಚ್ಚ ವಿವರ" : "Receipt & Schedule"}
        </Text>
        <View style={[styles.rowBetween, { marginTop: 10 }]}>
          <Text style={styles.bodyText}>{isKn ? "ಅವಧಿ" : "Dates"}</Text>
          <Text style={styles.boldText}>
            {rental.startDate} – {rental.endDate} ({tx.days(rental.days)})
          </Text>
        </View>
        <View style={[styles.rowBetween, { marginTop: 6 }]}>
          <Text style={styles.bodyText}>{isKn ? "ತಲುಪಿಸುವ ವಿಧಾನ" : "Pickup Mode"}</Text>
          <Text style={styles.boldText}>
            {rental.pickupMode === "delivery"
              ? isKn
                ? "ಹೊಲಕ್ಕೆ ತಲುಪಿಸುವಿಕೆ"
                : "Farm Delivery"
              : isKn
              ? "ತಾವೇ ತೆಗೆದುಕೊಳ್ಳುವುದು"
              : "Self-Pickup"}
          </Text>
        </View>
        <View style={[styles.rowBetween, { marginTop: 6 }]}>
          <Text style={styles.bodyText}>{isKn ? "ಮೂಲ ಬಾಡಿಗೆ" : "Base Rental"}</Text>
          <Text style={styles.boldText}>
            ₹{(rental.pricePerDay * rental.days).toLocaleString("en-IN")}
          </Text>
        </View>
        {!!rental.deliveryFee && rental.deliveryFee > 0 && (
          <View style={[styles.rowBetween, { marginTop: 6 }]}>
            <Text style={styles.bodyText}>{isKn ? "ತಲುಪಿಸುವ ಶುಲ್ಕ" : "Delivery Fee"}</Text>
            <Text style={styles.boldText}>
              ₹{rental.deliveryFee.toLocaleString("en-IN")}
            </Text>
          </View>
        )}
        {!!rental.operatorFee && rental.operatorFee > 0 && (
          <View style={[styles.rowBetween, { marginTop: 6 }]}>
            <Text style={styles.bodyText}>{isKn ? "ಚಾಲಕ ಶುಲ್ಕ" : "Operator Fee"}</Text>
            <Text style={styles.boldText}>
              ₹{rental.operatorFee.toLocaleString("en-IN")}
            </Text>
          </View>
        )}
        <View style={styles.dividerRow}>
          <Text style={styles.cardTitle}>{isKn ? "ಒಟ್ಟು ಮೊತ್ತ" : "Total Paid / Due"}</Text>
          <Text style={styles.priceHighlight}>
            ₹{rental.total.toLocaleString("en-IN")}
          </Text>
        </View>

        {!!rental.notes && (
          <View style={styles.noteBox}>
            <Text style={styles.mutedSmall}>{isKn ? "ಟಿಪ್ಪಣಿ:" : "Note:"}</Text>
            <Text style={styles.bodyText}>{rental.notes}</Text>
          </View>
        )}
      </View>

      {/* Actions for Active / Pending */}
      {isOwnerView ? (
        <>
          {rental.status === "pending" && (
            <View style={[styles.actionBtnRow, { marginBottom: 16 }]}>
              <TouchableOpacity
                onPress={() => rejectRequest(rental.id, "Unavailable on selected dates")}
                style={styles.rejectBtn}
              >
                <Text style={styles.rejectBtnText}>
                  {isKn ? "ತಿರಸ್ಕರಿಸಿ" : "Decline Request"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => acceptRequest(rental.id)}
                style={styles.acceptBtn}
              >
                <Text style={styles.acceptBtnText}>
                  {isKn ? "ಒಪ್ಪಿಕೊಳ್ಳಿ ✓" : "Accept Request ✓"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {rental.status === "approved" && (
            <TouchableOpacity
              onPress={() => startRentalHandover(rental.id)}
              style={[styles.primaryActionBtn, { marginBottom: 16 }]}
            >
              <Text style={styles.primaryActionText}>
                {isKn ? "ಯಂತ್ರ ಹಸ್ತಾಂತರ ಪ್ರಾರಂಭಿಸಿ (ಸಕ್ರಿಯ)" : "Start Handover (Mark Active)"}
              </Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        (rental.status === "pending" || rental.status === "approved") && (
          <TouchableOpacity
            onPress={() => cancelRental(rental.id)}
            style={styles.dangerOutlineBtn}
          >
            <Text style={styles.dangerOutlineText}>
              {isKn ? "ಬುಕಿಂಗ್ ರದ್ದುಗೊಳಿಸಿ" : "Cancel Rental Request"}
            </Text>
          </TouchableOpacity>
        )
      )}

      {rental.status === "active" && (
        <TouchableOpacity
          onPress={() => completeRental(rental.id)}
          style={[styles.primaryActionBtn, { marginBottom: 16 }]}
        >
          <Text style={styles.primaryActionText}>
            {isKn ? "ಯಂತ್ರ ಹಿಂತಿರುಗಿಸಲಾಗಿದೆ (ಪೂರ್ಣಗೊಳಿಸಿ)" : "Confirm Equipment Returned"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Rating & Review Card on Completed Rentals */}
      {rental.status === "completed" && !isOwnerView && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {rental.rating
              ? isKn
                ? "ನಿಮ್ಮ ರೇಟಿಂಗ್ ಮತ್ತು ವಿಮರ್ಶೆ"
                : "Your Rating & Review"
              : isKn
              ? "ನಿಮ್ಮ ಅನುಭವಕ್ಕೆ ರೇಟಿಂಗ್ ನೀಡಿ"
              : "Rate Your Rental Experience"}
          </Text>
          <View style={styles.starPickerRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setStarVal(n)}
                style={{ padding: 4 }}
              >
                <Star
                  size={28}
                  color="#f59e0b"
                  fill={n <= starVal ? "#f59e0b" : "transparent"}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={comment}
            onChangeText={setComment}
            multiline
            placeholder={
              isKn
                ? "ಯಂತ್ರದ ಸ್ಥಿತಿ ಮತ್ತು ಮಾಲೀಕರ ಸಹಕಾರದ ಬಗ್ಗೆ ಬರೆಯಿರಿ..."
                : "Share feedback on machinery condition and owner support..."
            }
            style={[styles.input, { minHeight: 70, textAlignVertical: "top" }]}
          />
          <TouchableOpacity
            onPress={handleSaveReview}
            disabled={reviewSaving}
            style={[styles.primaryActionBtn, { marginTop: 12 }]}
          >
            {reviewSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryActionText}>
                {isKn ? "ವಿಮರ್ಶೆ ಸಲ್ಲಿಸಿ" : "Submit Rating & Review"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {rental.status === "completed" && isOwnerView && rental.rating ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isKn ? "ಬಾಡಿಗೆದಾರರ ವಿಮರ್ಶೆ" : "Renter Feedback"}
          </Text>
          <View style={[styles.inlineRow, { marginTop: 8 }]}>
            <Star size={18} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.boldText}>{rental.rating} / 5</Text>
          </View>
          {!!rental.reviewComment && (
            <Text style={[styles.bodyText, { marginTop: 6 }]}>
              "{rental.reviewComment}"
            </Text>
          )}
        </View>
      ) : null}
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 6. List / Edit Equipment Screen                    */
/* -------------------------------------------------- */
const EQUIP_TYPES = [
  "Tractor",
  "Rotavator",
  "Seed Drill",
  "Sprayer",
  "Harvester",
  "Cultivator",
  "Other",
]
const FUEL_TYPES = ["Diesel", "Petrol", "PTO driven"]
const CONDITION_OPTS = ["Excellent", "Well maintained", "Good"]

export function ListEquipmentScreen() {
  const { listEquipment, updateEquipmentListing, uploadEquipmentPhoto, getEquipment } =
    useEquipment()
  const { profile } = useProfile()
  const { params, back, open } = useNav()
  const { lang } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"
  const insets = useSafeAreaInsets()

  const editingEq = params.equipmentId ? getEquipment(String(params.equipmentId)) : undefined

  const [name, setName] = useState(editingEq?.name || "")
  const [type, setType] = useState(editingEq?.type || "Tractor")
  const [price, setPrice] = useState(String(editingEq?.pricePerDay || 1200))
  const [hp, setHp] = useState(editingEq?.hp || "45 HP")
  const [fuel, setFuel] = useState(editingEq?.fuel || "Diesel")
  const [condition, setCondition] = useState(editingEq?.condition || "Well maintained")
  const [minDuration, setMinDuration] = useState(editingEq?.minDuration || "1 day")
  const [crops, setCrops] = useState(editingEq?.crops || "Rice, Ragi, Sugarcane")
  const [description, setDescription] = useState(editingEq?.description || "")
  const [location, setLocation] = useState(
    editingEq?.location || profile.district || "Mandya"
  )
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    editingEq?.latitude && editingEq?.longitude
      ? { lat: editingEq.latitude, lng: editingEq.longitude }
      : null
  )
  const [image, setImage] = useState(
    editingEq?.image || EQUIP_PRESET_IMAGES.Tractor
  )
  const [deliveryAvailable, setDeliveryAvailable] = useState(
    Boolean(editingEq?.deliveryAvailable)
  )
  const [deliveryFee, setDeliveryFee] = useState(String(editingEq?.deliveryFee || 200))
  const [operatorIncluded, setOperatorIncluded] = useState(
    Boolean(editingEq?.operatorIncluded)
  )
  const [operatorFeePerDay, setOperatorFeePerDay] = useState(
    String(editingEq?.operatorFeePerDay || 400)
  )
  const [rawAvailability, setRawAvailability] = useState<RawAvailability>(
    editingEq?.rawAvailability || "AVAILABLE"
  )
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [saving, setSaving] = useState(false)
  const [gpsBusy, setGpsBusy] = useState(false)

  async function pickPhoto(useCamera: boolean) {
    try {
      const perm = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted) {
        Alert.alert(
          isKn ? "ಅನುಮತಿ ಅಗತ್ಯ" : "Permission Required",
          isKn
            ? "ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಲು ಕ್ಯಾಮೆರಾ/ಗ್ಯಾಲರಿ ಅನುಮತಿ ನೀಡಿ."
            : "Please grant camera or gallery permission."
        )
        return
      }
      const res = useCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.75 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.75 })
      if (res.canceled || !res.assets?.[0]?.uri) return

      const localUri = res.assets[0].uri
      setUploadingPhoto(true)
      try {
        const remoteUrl = await uploadEquipmentPhoto(localUri)
        setImage(remoteUrl)
      } catch {
        setImage(localUri)
      } finally {
        setUploadingPhoto(false)
      }
    } catch {
      setUploadingPhoto(false)
    }
  }

  async function fillCurrentGps() {
    setGpsBusy(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          isKn ? "ಸ್ಥಳ ಅನುಮತಿ" : "Location Permission",
          isKn ? "GPS ಸ್ಥಳ ಪಡೆಯಲು ಅನುಮತಿ ನೀಡಿ." : "Enable location permission."
        )
        return
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      if (!location.trim()) setLocation(profile.district || "Mandya")
    } finally {
      setGpsBusy(false)
    }
  }

  function buildPayload(): Partial<Equipment> & { rawAvailability?: RawAvailability } {
    return {
      name: name.trim(),
      type,
      location: location.trim() || profile.district || "Mandya",
      latitude: coords?.lat,
      longitude: coords?.lng,
      pricePerDay: Number(price),
      hp: hp.trim() || "—",
      fuel,
      condition,
      minDuration: minDuration.trim() || "1 day",
      crops: crops.trim() || "All field crops",
      description: description.trim(),
      image,
      deliveryAvailable,
      deliveryFee: deliveryAvailable ? Number(deliveryFee || 0) : 0,
      operatorIncluded,
      operatorFeePerDay: operatorIncluded ? Number(operatorFeePerDay || 0) : 0,
      rawAvailability,
      availability: rawAvailability === "AVAILABLE" ? "available" : "booked",
    }
  }

  function validateForm(): boolean {
    const cleanPrice = Number(price)
    if (!name.trim()) {
      Alert.alert(
        isKn ? "ದೋಷ" : "Missing Name",
        isKn ? "ದಯವಿಟ್ಟು ಯಂತ್ರದ ಹೆಸರು ನಮೂದಿಸಿ" : "Please enter equipment name or model."
      )
      return false
    }
    if (!Number.isFinite(cleanPrice) || cleanPrice <= 0) {
      Alert.alert(
        isKn ? "ದೋಷ" : "Invalid Price",
        isKn ? "ದಯವಿಟ್ಟು ಸರಿಯಾದ ದಿನದ ದರ ನಮೂದಿಸಿ" : "Please enter a valid daily rental rate."
      )
      return false
    }
    return true
  }

  async function handleSubmit() {
    if (!validateForm() || saving) return
    setSaving(true)
    try {
      const payload = buildPayload()
      if (editingEq) {
        await updateEquipmentListing(editingEq.id, payload)
      } else {
        await listEquipment(payload)
      }
      back()
    } finally {
      setSaving(false)
    }
  }

  function handlePreview() {
    if (!validateForm()) return
    open("listingPreview", {
      draft: buildPayload(),
      editId: editingEq?.id,
    })
  }

  return (
    <DetailShell
      title={
        editingEq
          ? isKn
            ? "ಯಂತ್ರ ಪಟ್ಟಿಯನ್ನು ಬದಲಿಸಿ"
            : "Edit Equipment Listing"
          : isKn
          ? "ಯಂತ್ರವನ್ನು ಪಟ್ಟಿ ಮಾಡಿ"
          : "List Machinery"
      }
      subtitle={
        isKn
          ? "ನಿಮ್ಮ ಕೃಷಿ ಯಂತ್ರೋಪಕರಣಗಳಿಂದ ಬಾಡಿಗೆ ಆದಾಯ ಗಳಿಸಿ"
          : "Earn rental income from your farm equipment"
      }
      footer={
        <View
          style={[
            styles.footerRowWrap,
            { paddingBottom: Math.max(insets.bottom + 12, 18) },
          ]}
        >
          <TouchableOpacity onPress={handlePreview} style={styles.previewFooterBtn}>
            <Eye size={16} color="#256428" />
            <Text style={styles.previewFooterText}>
              {isKn ? "ಮುನ್ನೋಟ" : "Preview"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={saving || uploadingPhoto}
            activeOpacity={0.85}
            style={[styles.primaryActionBtn, { flex: 1 }]}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryActionText}>
                {editingEq
                  ? isKn
                    ? "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ"
                    : "Save Changes"
                  : isKn
                  ? "ಪಟ್ಟಿಯನ್ನು ಪ್ರಕಟಿಸಿ"
                  : "Publish Listing"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      }
    >
      {/* Photo Upload Card */}
      <View style={styles.card}>
        <Text style={styles.label}>{isKn ? "ಯಂತ್ರದ ಫೋಟೋ" : "Machinery Photo"}</Text>
        <View style={styles.photoPreviewBox}>
          <Image source={{ uri: image }} style={styles.photoPreviewImg} />
          {uploadingPhoto && (
            <View style={styles.photoOverlay}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          )}
        </View>
        <View style={styles.actionBtnRow}>
          <TouchableOpacity
            onPress={() => pickPhoto(true)}
            style={styles.photoPickBtn}
          >
            <Camera size={15} color="#256428" />
            <Text style={styles.photoPickText}>
              {isKn ? "ಕ್ಯಾಮೆರಾ" : "Camera"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => pickPhoto(false)}
            style={styles.photoPickBtn}
          >
            <ImageIcon size={15} color="#256428" />
            <Text style={styles.photoPickText}>
              {isKn ? "ಗ್ಯಾಲರಿ" : "Gallery"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Core Details */}
      <View style={styles.card}>
        <Text style={styles.label}>
          {isKn ? "ಯಂತ್ರದ ಹೆಸರು / ಮಾದರಿ *" : "Equipment Name / Model *"}
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
                onPress={() => {
                  setType(tp)
                  if (!editingEq && EQUIP_PRESET_IMAGES[tp]) {
                    setImage(EQUIP_PRESET_IMAGES[tp])
                  }
                }}
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
          {isKn ? "ದಿನದ ಬಾಡಿಗೆ ದರ (₹/ದಿನ) *" : "Daily Rental Rate (₹/day) *"}
        </Text>
        <TextInput
          value={price}
          onChangeText={(v) => setPrice(v.replace(/\D/g, ""))}
          keyboardType="numeric"
          placeholder="1200"
          style={styles.input}
        />

        <View style={styles.twoColRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { marginTop: 12 }]}>
              {isKn ? "ಶಕ್ತಿ / ಗಾತ್ರ" : "HP / Capacity"}
            </Text>
            <TextInput
              value={hp}
              onChangeText={setHp}
              placeholder="45 HP"
              style={styles.input}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { marginTop: 12 }]}>
              {isKn ? "ಕನಿಷ್ಠ ಅವಧಿ" : "Min Duration"}
            </Text>
            <TextInput
              value={minDuration}
              onChangeText={setMinDuration}
              placeholder="1 day"
              style={styles.input}
            />
          </View>
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ಇಂಧನ ಪ್ರಕಾರ" : "Fuel Type"}
        </Text>
        <View style={styles.typeChipRow}>
          {FUEL_TYPES.map((fl) => (
            <TouchableOpacity
              key={fl}
              onPress={() => setFuel(fl)}
              style={[styles.chip, fuel === fl && styles.chipActive]}
            >
              <Text style={[styles.chipText, fuel === fl && styles.chipTextActive]}>
                {tx.fuel(fl)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ಸ್ಥಿತಿ" : "Condition"}
        </Text>
        <View style={styles.typeChipRow}>
          {CONDITION_OPTS.map((cn) => (
            <TouchableOpacity
              key={cn}
              onPress={() => setCondition(cn)}
              style={[styles.chip, condition === cn && styles.chipActive]}
            >
              <Text style={[styles.chipText, condition === cn && styles.chipTextActive]}>
                {tx.condition(cn)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ಸೂಕ್ತ ಬೆಳೆಗಳು" : "Suitable Crops"}
        </Text>
        <TextInput
          value={crops}
          onChangeText={setCrops}
          placeholder="Rice, Ragi, Sugarcane"
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>
          {isKn ? "ವಿವರಣೆ" : "Description"}
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder={
            isKn
              ? "ಯಂತ್ರದ ಸ್ಥಿತಿ, ಸಲಕರಣೆಗಳು ಮತ್ತು ನಿಯಮಗಳ ಬಗ್ಗೆ ತಿಳಿಸಿ..."
              : "Share attachments included, servicing history, or instructions..."
          }
          style={[styles.input, { minHeight: 72, textAlignVertical: "top" }]}
        />
      </View>

      {/* Location + Delivery + Operator */}
      <View style={styles.card}>
        <Text style={styles.label}>{isKn ? "ಗ್ರಾಮ / ತಾಲೂಕು" : "Location"}</Text>
        <View style={styles.inlineRow}>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Mandya"
            style={[styles.input, { flex: 1 }]}
          />
          <TouchableOpacity
            onPress={fillCurrentGps}
            disabled={gpsBusy}
            style={styles.gpsInlineBtn}
          >
            {gpsBusy ? (
              <ActivityIndicator size="small" color="#256428" />
            ) : (
              <Navigation size={16} color="#256428" />
            )}
            <Text style={styles.gpsInlineText}>GPS</Text>
          </TouchableOpacity>
        </View>
        {coords && (
          <Text style={styles.mutedSmall}>
            GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </Text>
        )}

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.boldText}>
              {isKn ? "ಹೊಲಕ್ಕೆ ತಲುಪಿಸುವ ಸೌಲಭ್ಯ" : "Delivery Available"}
            </Text>
            <Text style={styles.mutedSmall}>
              {isKn ? "ಬಾಡಿಗೆದಾರರ ಹೊಲಕ್ಕೆ ಯಂತ್ರ ತಲುಪಿಸಿ" : "Deliver machinery to renter's farm"}
            </Text>
          </View>
          <Switch
            value={deliveryAvailable}
            onValueChange={setDeliveryAvailable}
            trackColor={{ false: "#d1d5db", true: "#86efac" }}
            thumbColor={deliveryAvailable ? "#256428" : "#f4f3f4"}
          />
        </View>

        {deliveryAvailable && (
          <TextInput
            value={deliveryFee}
            onChangeText={(v) => setDeliveryFee(v.replace(/\D/g, ""))}
            keyboardType="numeric"
            placeholder="Delivery fee (₹)"
            style={[styles.input, { marginTop: 8 }]}
          />
        )}

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.boldText}>
              {isKn ? "ಚಾಲಕ / ಆಪರೇಟರ್ ಲಭ್ಯ" : "Operator Available"}
            </Text>
            <Text style={styles.mutedSmall}>
              {isKn ? "ಯಂತ್ರದೊಂದಿಗೆ ಚಾಲಕರನ್ನು ಒದಗಿಸಿ" : "Provide an operator if requested"}
            </Text>
          </View>
          <Switch
            value={operatorIncluded}
            onValueChange={setOperatorIncluded}
            trackColor={{ false: "#d1d5db", true: "#86efac" }}
            thumbColor={operatorIncluded ? "#256428" : "#f4f3f4"}
          />
        </View>

        {operatorIncluded && (
          <TextInput
            value={operatorFeePerDay}
            onChangeText={(v) => setOperatorFeePerDay(v.replace(/\D/g, ""))}
            keyboardType="numeric"
            placeholder="Operator fee per day (₹)"
            style={[styles.input, { marginTop: 8 }]}
          />
        )}

        {editingEq && (
          <>
            <Text style={[styles.label, { marginTop: 14 }]}>
              {isKn ? "ಲಭ್ಯತೆ ಸ್ಥಿತಿ" : "Availability Status"}
            </Text>
            <View style={styles.typeChipRow}>
              {(
                [
                  { id: "AVAILABLE", en: "Available", kn: "ಲಭ್ಯವಿದೆ" },
                  { id: "BOOKED", en: "Booked", kn: "ಬುಕ್ ಆಗಿದೆ" },
                  { id: "MAINTENANCE", en: "Maintenance", kn: "ದುರಸ್ತಿಯಲ್ಲಿ" },
                ] as const
              ).map((av) => (
                <TouchableOpacity
                  key={av.id}
                  onPress={() => setRawAvailability(av.id)}
                  style={[styles.chip, rawAvailability === av.id && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      rawAvailability === av.id && styles.chipTextActive,
                    ]}
                  >
                    {isKn ? av.kn : av.en}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 7. Listing Preview Screen                          */
/* -------------------------------------------------- */
export function ListingPreviewScreen() {
  const { params, back, open } = useNav()
  const { listEquipment, updateEquipmentListing } = useEquipment()
  const { profile } = useProfile()
  const { lang } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"
  const insets = useSafeAreaInsets()
  const [publishing, setPublishing] = useState(false)

  const draft = params.draft || {
    name: "Tractor (45 HP)",
    type: "Tractor",
    pricePerDay: 1200,
    location: profile.district || "Mandya",
    hp: "45 HP",
    fuel: "Diesel",
    condition: "Well maintained",
    minDuration: "1 day",
    crops: "Rice, Ragi, Sugarcane",
    image: EQUIP_PRESET_IMAGES.Tractor,
  }

  async function handlePublish() {
    setPublishing(true)
    try {
      if (params.editId) {
        await updateEquipmentListing(String(params.editId), draft)
      } else {
        await listEquipment(draft)
      }
      open("myEquipment")
    } finally {
      setPublishing(false)
    }
  }

  return (
    <DetailShell
      title={isKn ? "ಪಟ್ಟಿ ಮುನ್ನೋಟ" : "Listing Preview"}
      subtitle={isKn ? "ರೈತರಿಗೆ ಹೀಗೆ ಕಾಣಿಸುತ್ತದೆ" : "How nearby farmers will see it"}
      footer={
        <View
          style={[
            styles.footerRowWrap,
            { paddingBottom: Math.max(insets.bottom + 12, 18) },
          ]}
        >
          <TouchableOpacity onPress={back} style={styles.previewFooterBtn}>
            <Edit3 size={16} color="#256428" />
            <Text style={styles.previewFooterText}>
              {isKn ? "ತಿದ್ದುಪಡಿ" : "Edit"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePublish}
            disabled={publishing}
            style={[styles.primaryActionBtn, { flex: 1 }]}
          >
            {publishing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryActionText}>
                {params.editId
                  ? isKn
                    ? "ಬದಲಾವಣೆ ಉಳಿಸಿ"
                    : "Save Listing"
                  : isKn
                  ? "ಈಗ ಪ್ರಕಟಿಸಿ"
                  : "Publish Listing"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.heroImgCard}>
        <Image
          source={{ uri: draft.image || EQUIP_PRESET_IMAGES.Tractor }}
          style={styles.heroImg}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={[styles.cardTitle, { flex: 1 }]}>{draft.name}</Text>
          <Text style={styles.priceHighlight}>
            ₹{draft.pricePerDay}/{isKn ? "ದಿನ" : "day"}
          </Text>
        </View>
        <Text style={styles.ownerText}>
          {isKn ? "ಮಾಲೀಕರು:" : "Owner:"} {profile.name} · {draft.location}
        </Text>
        {!!draft.description && (
          <Text style={[styles.bodyText, { marginTop: 10 }]}>{draft.description}</Text>
        )}
        <View style={styles.specsGrid}>
          <View style={styles.specBox}>
            <Gauge size={16} color="#256428" />
            <Text style={styles.specVal}>{draft.hp}</Text>
            <Text style={styles.specLbl}>{isKn ? "ಶಕ್ತಿ" : "Power"}</Text>
          </View>
          <View style={styles.specBox}>
            <Fuel size={16} color="#d97706" />
            <Text style={styles.specVal}>{tx.fuel(draft.fuel)}</Text>
            <Text style={styles.specLbl}>{isKn ? "ಇಂಧನ" : "Fuel"}</Text>
          </View>
          <View style={styles.specBox}>
            <ShieldCheck size={16} color="#2563eb" />
            <Text style={styles.specVal}>{tx.condition(draft.condition)}</Text>
            <Text style={styles.specLbl}>{isKn ? "ಸ್ಥಿತಿ" : "Condition"}</Text>
          </View>
        </View>
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 8. My Equipment Screen                             */
/* -------------------------------------------------- */
export function MyEquipmentScreen() {
  const { mine, updateEquipmentListing, deleteEquipmentListing } = useEquipment()
  const { open } = useNav()
  const { lang } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"

  function confirmDelete(eq: Equipment) {
    Alert.alert(
      isKn ? "ಪಟ್ಟಿಯನ್ನು ಅಳಿಸಬೇಕೇ?" : "Delete Listing?",
      isKn
        ? `${eq.name} ಅನ್ನು ನಿಮ್ಮ ಪಟ್ಟಿಯಿಂದ ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ.`
        : `Remove ${eq.name} from the rental marketplace?`,
      [
        { text: isKn ? "ಬೇಡ" : "Cancel", style: "cancel" },
        {
          text: isKn ? "ಅಳಿಸಿ" : "Delete",
          style: "destructive",
          onPress: () => deleteEquipmentListing(eq.id),
        },
      ]
    )
  }

  function handleToggleStatus(eq: Equipment) {
    const nextAvail: RawAvailability =
      eq.rawAvailability === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE"
    updateEquipmentListing(eq.id, { rawAvailability: nextAvail })
  }

  return (
    <DetailShell
      title={isKn ? "ನನ್ನ ಯಂತ್ರೋಪಕರಣಗಳು" : "My Equipment"}
      subtitle={
        isKn
          ? "ನಿಮ್ಮ ಖಾತೆಯ ಅಡಿಯಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಿದ ಯಂತ್ರಗಳು"
          : "Machinery listed under your farmer account"
      }
      action={
        <TouchableOpacity
          onPress={() => open("listEquipment")}
          style={styles.headerAddBtn}
        >
          <Plus size={18} color="#ffffff" />
        </TouchableOpacity>
      }
    >
      {mine.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.bodyText}>
            {isKn
              ? "ಯಾವುದೇ ಯಂತ್ರೋಪಕರಣ ಪಟ್ಟಿ ಮಾಡಲಾಗಿಲ್ಲ."
              : "No equipment listed yet."}
          </Text>
          <TouchableOpacity
            onPress={() => open("listEquipment")}
            style={[styles.primaryActionBtn, { marginTop: 14 }]}
          >
            <Text style={styles.primaryActionText}>
              {isKn ? "+ ಮೊದಲ ಯಂತ್ರವನ್ನು ಪಟ್ಟಿ ಮಾಡಿ" : "+ List Your First Equipment"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listWrap}>
          {mine.map((eq) => {
            const avail = eq.rawAvailability === "AVAILABLE" || eq.availability === "available"
            return (
              <View key={eq.id} style={styles.card}>
                <View style={styles.thumbCardRow}>
                  <Image source={{ uri: eq.image }} style={styles.thumbImg} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.rowBetween}>
                      <Text style={[styles.cardTitle, { flex: 1 }]} numberOfLines={1}>
                        {tx.name(eq.name)}
                      </Text>
                      <Text style={styles.priceHighlight}>
                        ₹{eq.pricePerDay}/{isKn ? "ದಿನ" : "day"}
                      </Text>
                    </View>
                    <Text style={styles.ownerText}>
                      {eq.location} · ★ {eq.rating.toFixed(1)} ({eq.reviews})
                    </Text>
                    <View style={[styles.inlineRow, { marginTop: 6 }]}>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: avail ? "#dcfce7" : "#fef3c7" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: avail ? "#15803d" : "#b45309" },
                          ]}
                        >
                          {avail
                            ? isKn
                              ? "ಲಭ್ಯವಿದೆ"
                              : "AVAILABLE"
                            : eq.rawAvailability === "MAINTENANCE"
                            ? isKn
                              ? "ದುರಸ್ತಿಯಲ್ಲಿ"
                              : "MAINTENANCE"
                            : isKn
                            ? "ಬುಕ್ ಆಗಿದೆ"
                            : "BOOKED"}
                        </Text>
                      </View>
                      {!!eq.requestCount && eq.requestCount > 0 && (
                        <TouchableOpacity
                          onPress={() => open("ownerRequests")}
                          style={styles.reqCountBadge}
                        >
                          <Text style={styles.reqCountText}>
                            {eq.requestCount} {isKn ? "ಮನವಿ" : "req"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.ownerActionBar}>
                  <TouchableOpacity
                    onPress={() => handleToggleStatus(eq)}
                    style={styles.ownerActionBtn}
                  >
                    <Wrench size={13} color="#374151" />
                    <Text style={styles.ownerActionText}>
                      {avail
                        ? isKn
                          ? "ವಿರಾಮಗೊಳಿಸಿ"
                          : "Pause"
                        : isKn
                        ? "ಲಭ್ಯಗೊಳಿಸಿ"
                        : "Set Available"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => open("listEquipment", { equipmentId: eq.id })}
                    style={styles.ownerActionBtn}
                  >
                    <Edit3 size={13} color="#256428" />
                    <Text style={[styles.ownerActionText, { color: "#256428" }]}>
                      {isKn ? "ತಿದ್ದುಪಡಿ" : "Edit"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => confirmDelete(eq)}
                    style={styles.ownerActionBtn}
                  >
                    <Trash2 size={13} color="#dc2626" />
                    <Text style={[styles.ownerActionText, { color: "#dc2626" }]}>
                      {isKn ? "ಅಳಿಸಿ" : "Delete"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          })}
        </View>
      )}
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 9. Owner Requests Screen                           */
/* -------------------------------------------------- */
export function OwnerRequestsScreen() {
  const {
    ownerRequests,
    acceptRequest,
    rejectRequest,
    startRentalHandover,
    completeRental,
  } = useEquipment()
  const { lang, t } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"
  const statusMap = t.x.equipmentA.status as Record<string, string>
  const [tab, setTab] = useState<"all" | "pending" | "active" | "completed">("all")

  const filtered = useMemo(() => {
    if (tab === "all") return ownerRequests
    if (tab === "pending") return ownerRequests.filter((r) => r.status === "pending")
    if (tab === "active")
      return ownerRequests.filter((r) => r.status === "approved" || r.status === "active")
    return ownerRequests.filter(
      (r) => r.status === "completed" || r.status === "rejected" || r.status === "cancelled"
    )
  }, [ownerRequests, tab])

  function confirmReject(reqId: string) {
    Alert.alert(
      isKn ? "ಬಾಡಿಗೆ ವಿನಂತಿ ತಿರಸ್ಕರಿಸಬೇಕೇ?" : "Decline Request?",
      isKn ? "ದಯವಿಟ್ಟು ಕಾರಣ ಆಯ್ಕೆಮಾಡಿ:" : "Choose a reason for the farmer:",
      [
        { text: isKn ? "ರದ್ದು" : "Cancel", style: "cancel" },
        {
          text: isKn ? "ದಿನಾಂಕ ಲಭ್ಯವಿಲ್ಲ" : "Dates unavailable",
          onPress: () => rejectRequest(reqId, "Dates unavailable"),
        },
        {
          text: isKn ? "ಈಗಾಗಲೇ ಬುಕ್ ಆಗಿದೆ" : "Already booked",
          style: "destructive",
          onPress: () => rejectRequest(reqId, "Already booked"),
        },
      ]
    )
  }

  return (
    <DetailShell
      title={isKn ? "ಬಾಡಿಗೆ ವಿನಂತಿಗಳು" : "Rental Requests"}
      subtitle={
        isKn
          ? "ನಿಮ್ಮ ಯಂತ್ರ ಬಾಡಿಗೆಗೆ ಕೇಳುತ್ತಿರುವ ರೈತರು"
          : "Manage bookings for your machinery"
      }
    >
      {/* Tabs */}
      <View style={styles.tabRow}>
        {(
          [
            { id: "all", label: isKn ? "ಎಲ್ಲಾ" : "All" },
            { id: "pending", label: isKn ? "ಬಾಕಿ" : "Pending" },
            { id: "active", label: isKn ? "ಸಕ್ರಿಯ" : "Active" },
            { id: "completed", label: isKn ? "ಹಿಂದಿನ" : "Past" },
          ] as const
        ).map((tb) => {
          const active = tab === tb.id
          return (
            <TouchableOpacity
              key={tb.id}
              onPress={() => setTab(tb.id)}
              style={[styles.tabPill, active && styles.tabPillActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tb.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.bodyText}>{t.x.equipmentB.requests.empty}</Text>
        </View>
      ) : (
        <View style={styles.listWrap}>
          {filtered.map((req) => {
            const st = STATUS_STYLE[req.status] || STATUS_STYLE.pending
            return (
              <View key={req.id} style={styles.card}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.cardTitle, { flex: 1 }]}>
                    {tx.name(req.equipmentName)}
                  </Text>
                  <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusText, { color: st.fg }]}>
                      {statusMap[req.status] || req.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={[styles.rowBetween, { marginTop: 8 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.boldText}>
                      {req.renter} · {req.location} ({req.distanceKm}{" "}
                      {isKn ? "ಕಿ.ಮೀ" : "km"})
                    </Text>
                    <Text style={styles.mutedSmall}>
                      {req.startDate} – {req.endDate} ({tx.days(req.days)})
                    </Text>
                  </View>
                  {!!req.renterPhone && (
                    <TouchableOpacity
                      onPress={() => callPhone(req.renterPhone)}
                      style={styles.callCircleMini}
                    >
                      <Phone size={14} color="#256428" />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={[styles.inlineRow, { marginTop: 8, flexWrap: "wrap" }]}>
                  <View style={styles.tagMuted}>
                    <Text style={styles.tagMutedText}>
                      {req.pickupMode === "delivery"
                        ? isKn
                          ? "ತಲುಪಿಸುವಿಕೆ ಅಗತ್ಯ"
                          : "Delivery requested"
                        : isKn
                        ? "ತಾವೇ ತೆಗೆದುಕೊಳ್ಳುತ್ತಾರೆ"
                        : "Self-pickup"}
                    </Text>
                  </View>
                  {req.operatorIncluded && (
                    <View style={styles.tagMuted}>
                      <Text style={styles.tagMutedText}>
                        {isKn ? "ಚಾಲಕ ಸಹಿತ" : "With operator"}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.priceHighlight, { marginLeft: "auto" }]}>
                    ₹{req.total.toLocaleString("en-IN")}
                  </Text>
                </View>

                {!!req.notes && (
                  <View style={styles.noteBox}>
                    <Text style={styles.bodyText}>"{req.notes}"</Text>
                  </View>
                )}

                {req.status === "pending" && (
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      onPress={() => confirmReject(req.id)}
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
                        {isKn ? "ಒಪ್ಪಿಕೊಳ್ಳಿ ✓" : "Accept Request ✓"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {req.status === "approved" && (
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      onPress={() => startRentalHandover(req.id)}
                      style={styles.acceptBtn}
                    >
                      <Text style={styles.acceptBtnText}>
                        {isKn
                          ? "ಯಂತ್ರ ಹಸ್ತಾಂತರ ಪ್ರಾರಂಭಿಸಿ (ಸಕ್ರಿಯ)"
                          : "Start Handover (Mark Active)"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {req.status === "active" && (
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      onPress={() => completeRental(req.id)}
                      style={[styles.acceptBtn, { backgroundColor: "#1d4ed8" }]}
                    >
                      <Text style={styles.acceptBtnText}>
                        {isKn
                          ? "ಯಂತ್ರ ವಾಪಸ್ ಬಂದಿದೆ (ಪೂರ್ಣಗೊಳಿಸಿ)"
                          : "Mark Returned (Complete Rental)"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )
          })}
        </View>
      )}
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 10. Owner Dashboard Screen                         */
/* -------------------------------------------------- */
export function OwnerDashboardScreen() {
  const { stats, mine } = useEquipment()
  const { open } = useNav()
  const { lang } = useLang()
  const isKn = lang === "kn"

  return (
    <DetailShell
      title={isKn ? "ಮಾಲೀಕರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" : "Owner Dashboard"}
      subtitle={
        isKn
          ? "ಬುಕಿಂಗ್, ಯಂತ್ರಗಳು ಮತ್ತು ಗಳಿಕೆಯನ್ನು ನಿರ್ವಹಿಸಿ"
          : "Manage machinery fleet, bookings & earnings"
      }
      action={
        <TouchableOpacity
          onPress={() => open("listEquipment")}
          style={styles.headerAddBtn}
        >
          <Plus size={18} color="#ffffff" />
        </TouchableOpacity>
      }
    >
      {/* Revenue Banner */}
      <View style={styles.earningsBanner}>
        <Text style={styles.earningsLabel}>
          {isKn ? "ಒಟ್ಟು ಅಂದಾಜು ಮತ್ತು ಪೂರ್ಣಗೊಂಡ ಗಳಿಕೆ" : "Confirmed & Completed Revenue"}
        </Text>
        <Text style={styles.earningsValue}>
          ₹{stats.approvedEarnings.toLocaleString("en-IN")}
        </Text>
        <Text style={styles.earningsSub}>
          {isKn
            ? `ಪೂರ್ಣಗೊಂಡ ಬಾಡಿಗೆಗಳಿಂದ: ₹${stats.completedEarnings.toLocaleString("en-IN")}`
            : `Settled from ${stats.completedCount} completed rentals: ₹${stats.completedEarnings.toLocaleString("en-IN")}`}
        </Text>
      </View>

      {/* 4 KPI Grid */}
      <View style={styles.kpiGrid}>
        <TouchableOpacity
          onPress={() => open("myEquipment")}
          style={styles.kpiCard}
        >
          <Text style={styles.kpiNum}>{mine.length}</Text>
          <Text style={styles.kpiLbl}>
            {isKn ? "ಪಟ್ಟಿ ಮಾಡಿದ ಯಂತ್ರಗಳು" : "Listed Machinery"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => open("ownerRequests")}
          style={styles.kpiCard}
        >
          <Text style={[styles.kpiNum, { color: "#d97706" }]}>
            {stats.pendingCount}
          </Text>
          <Text style={styles.kpiLbl}>
            {isKn ? "ಬಾಕಿ ವಿನಂತಿಗಳು" : "Pending Requests"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => open("ownerRequests")}
          style={styles.kpiCard}
        >
          <Text style={[styles.kpiNum, { color: "#1d4ed8" }]}>
            {stats.activeCount}
          </Text>
          <Text style={styles.kpiLbl}>
            {isKn ? "ಸಕ್ರಿಯ ಬಾಡಿಗೆಗಳು" : "Active Rentals"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => open("rentalHistory")}
          style={styles.kpiCard}
        >
          <Text style={[styles.kpiNum, { color: "#15803d" }]}>
            {stats.completedCount}
          </Text>
          <Text style={styles.kpiLbl}>
            {isKn ? "ಪೂರ್ಣಗೊಂಡವು" : "Completed"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {isKn ? "ಮಾಲೀಕರ ನಿರ್ವಹಣೆ" : "Owner Management"}
        </Text>

        <TouchableOpacity
          onPress={() => open("ownerRequests")}
          style={styles.menuRow}
        >
          <Clock size={18} color="#d97706" />
          <Text style={styles.menuRowText}>
            {isKn ? "ಬಾಡಿಗೆ ಕೋರಿಕೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ" : "Review Incoming Requests"}
          </Text>
          {stats.pendingCount > 0 && (
            <View style={styles.reqCountBadge}>
              <Text style={styles.reqCountText}>{stats.pendingCount}</Text>
            </View>
          )}
          <ChevronRight size={16} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => open("myEquipment")}
          style={styles.menuRow}
        >
          <Store size={18} color="#256428" />
          <Text style={styles.menuRowText}>
            {isKn ? "ನನ್ನ ಯಂತ್ರಗಳು ಮತ್ತು ಲಭ್ಯತೆ" : "My Machinery & Availability"}
          </Text>
          <ChevronRight size={16} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => open("listEquipment")}
          style={styles.menuRow}
        >
          <Plus size={18} color="#1d4ed8" />
          <Text style={styles.menuRowText}>
            {isKn ? "ಹೊಸ ಯಂತ್ರವನ್ನು ಪಟ್ಟಿ ಮಾಡಿ" : "List New Machinery"}
          </Text>
          <ChevronRight size={16} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => open("rentalHistory")}
          style={[styles.menuRow, { borderBottomWidth: 0 }]}
        >
          <CheckCircle2 size={18} color="#15803d" />
          <Text style={styles.menuRowText}>
            {isKn ? "ಪೂರ್ಣಗೊಂಡ ಬಾಡಿಗೆ ಇತಿಹಾಸ" : "Completed Rental History"}
          </Text>
          <ChevronRight size={16} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 11. Rental History Screen                          */
/* -------------------------------------------------- */
export function RentalHistoryScreen() {
  const { rentals, ownerRequests } = useEquipment()
  const { open } = useNav()
  const { lang } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"

  const completedRenter = rentals
    .filter((r) => r.status === "completed")
    .map((r) => ({
      id: r.id,
      equipmentName: r.equipmentName,
      party: r.owner,
      role: isKn ? "ಮಾಲೀಕರು" : "Owner",
      startDate: r.startDate,
      endDate: r.endDate,
      days: r.days,
      total: r.total,
      rating: r.rating,
    }))

  const completedOwner = ownerRequests
    .filter((r) => r.status === "completed")
    .map((r) => ({
      id: r.id,
      equipmentName: r.equipmentName,
      party: r.renter,
      role: isKn ? "ಬಾಡಿಗೆದಾರ" : "Renter",
      startDate: r.startDate,
      endDate: r.endDate,
      days: r.days,
      total: r.total,
      rating: r.rating,
    }))

  const allCompleted = [...completedRenter, ...completedOwner]

  return (
    <DetailShell
      title={isKn ? "ಬಾಡಿಗೆ ಇತಿಹಾಸ" : "Rental History"}
      subtitle={isKn ? "ಪೂರ್ಣಗೊಂಡ ಯಂತ್ರ ಬಾಡಿಗೆಗಳು" : "Past completed machinery rentals"}
    >
      {allCompleted.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.bodyText}>
            {isKn
              ? "ಇನ್ನೂ ಯಾವುದೇ ಪೂರ್ಣಗೊಂಡ ಬಾಡಿಗೆ ಇಲ್ಲ."
              : "No completed rentals yet."}
          </Text>
        </View>
      ) : (
        <View style={styles.listWrap}>
          {allCompleted.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => open("rentalDetails", { rentalId: item.id })}
              style={styles.card}
            >
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{tx.name(item.equipmentName)}</Text>
                <Text style={styles.priceHighlight}>
                  ₹{item.total.toLocaleString("en-IN")}
                </Text>
              </View>
              <Text style={styles.ownerText}>
                {item.role}: {item.party}
              </Text>
              <View style={[styles.rowBetween, { marginTop: 6 }]}>
                <Text style={styles.bodyText}>
                  {item.startDate} – {item.endDate} ({tx.days(item.days)})
                </Text>
                {!!item.rating && (
                  <View style={styles.inlineRow}>
                    <Star size={13} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.boldText}>{item.rating}/5</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </DetailShell>
  )
}

/* -------------------------------------------------- */
/* 12. Rental Notifications Screen                    */
/* -------------------------------------------------- */
export function RentalNotificationsScreen() {
  const { notifications, unreadCount, markNotifsRead } = useEquipment()
  const { open } = useNav()
  const { lang } = useLang()
  const tx = useEquipText()
  const isKn = lang === "kn"

  function handleNotifTap(n: (typeof notifications)[0]) {
    if (!n.read) markNotifsRead(n.id)
    if (n.kind === "request") {
      open("ownerRequests")
    } else if (n.bookingId) {
      open("rentalDetails", { rentalId: n.bookingId })
    } else if (n.equipmentId) {
      open("equipmentDetails", { equipmentId: n.equipmentId })
    } else {
      open("myRentals")
    }
  }

  return (
    <DetailShell
      title={isKn ? "ಬಾಡಿಗೆ ಎಚ್ಚರಿಕೆಗಳು" : "Rental Alerts"}
      subtitle={
        unreadCount > 0
          ? isKn
            ? `${unreadCount} ಓದದ ಸೂಚನೆಗಳು`
            : `${unreadCount} unread notifications`
          : isKn
          ? "ಎಲ್ಲವನ್ನೂ ಓದಲಾಗಿದೆ"
          : "All caught up"
      }
      action={
        <TouchableOpacity
          onPress={() => markNotifsRead()}
          style={styles.headerAddBtn}
        >
          <Bell size={16} color="#ffffff" />
        </TouchableOpacity>
      }
    >
      {unreadCount > 0 && (
        <TouchableOpacity
          onPress={() => markNotifsRead()}
          style={styles.markAllBtn}
        >
          <Check size={14} color="#256428" />
          <Text style={styles.markAllText}>
            {isKn ? "ಎಲ್ಲವನ್ನೂ ಓದಿದಂತೆ ಗುರುತಿಸಿ" : "Mark all as read"}
          </Text>
        </TouchableOpacity>
      )}

      {notifications.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.bodyText}>
            {isKn ? "ಯಾವುದೇ ಬಾಡಿಗೆ ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ." : "No rental alerts yet."}
          </Text>
        </View>
      ) : (
        <View style={styles.listWrap}>
          {notifications.map((n) => {
            const rendered = tx.notif(n)
            return (
              <TouchableOpacity
                key={n.id}
                onPress={() => handleNotifTap(n)}
                activeOpacity={0.85}
                style={[styles.card, !n.read && styles.unreadNotifCard]}
              >
                <View style={styles.rowBetween}>
                  <Text style={[styles.cardTitle, { flex: 1 }]}>
                    {rendered.title}
                  </Text>
                  {!n.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.bodyText}>{rendered.body}</Text>
                <Text style={styles.ownerText}>{rendered.time}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      )}
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
  mutedSmall: {
    fontSize: 12,
    color: "#6b7280",
  },
  bodyText: {
    fontSize: 13,
    color: "#4b5563",
    marginTop: 4,
  },
  boldText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroImgCard: {
    height: 210,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#e5e7eb",
    position: "relative",
  },
  heroImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ownerBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 14,
    marginTop: 12,
    gap: 10,
  },
  callPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  callPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803d",
  },
  callCircleMini: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
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
  optionInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  footerWrap: {
    paddingHorizontal: 18,
    paddingTop: 14,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  footerRowWrap: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 14,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  previewFooterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  previewFooterText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#256428",
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
  secondaryOutlineBtn: {
    width: "100%",
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#256428",
    alignItems: "center",
  },
  secondaryOutlineText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#256428",
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginVertical: 12,
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  dividerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  centerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    marginTop: 12,
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
  receiptBox: {
    width: "100%",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
  },
  tabPillActive: {
    backgroundColor: "#256428",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4b5563",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  thumbCardRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  thumbImg: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: "#e5e7eb",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  cardFooterBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  smallLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  smallLinkText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#256428",
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
  },
  cancelBtnText: {
    fontSize: 11,
    color: "#dc2626",
    fontWeight: "700",
  },
  completeMiniBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#dbeafe",
  },
  completeMiniText: {
    fontSize: 11,
    color: "#1d4ed8",
    fontWeight: "700",
  },
  rateMiniBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#fef3c7",
  },
  rateMiniText: {
    fontSize: 11,
    color: "#b45309",
    fontWeight: "700",
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  timelineStep: {
    alignItems: "center",
    flex: 1,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  timelineDotDone: {
    backgroundColor: "#16a34a",
  },
  timelineLbl: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
  },
  noteBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
  },
  dangerOutlineBtn: {
    borderWidth: 1.5,
    borderColor: "#dc2626",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  dangerOutlineText: {
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 14,
  },
  starPickerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginVertical: 12,
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
    fontSize: 14,
    backgroundColor: "#f9fafb",
    color: "#111827",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 10,
  },
  photoPreviewBox: {
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    position: "relative",
  },
  photoPreviewImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoPickBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ecfdf5",
    paddingVertical: 10,
    borderRadius: 12,
  },
  photoPickText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#256428",
  },
  gpsInlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  gpsInlineText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#256428",
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
    paddingVertical: 10,
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
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#256428",
    alignItems: "center",
  },
  acceptBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  tagMuted: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagMutedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4b5563",
  },
  reqCountBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  reqCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#b45309",
  },
  ownerActionBar: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  ownerActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f9fafb",
  },
  ownerActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  earningsBanner: {
    backgroundColor: "#1a5632",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  earningsLabel: {
    fontSize: 12,
    color: "#dcfce7",
    fontWeight: "600",
  },
  earningsValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 4,
  },
  earningsSub: {
    fontSize: 12,
    color: "#bbf7d0",
    marginTop: 4,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  kpiCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiNum: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  kpiLbl: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    marginTop: 3,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuRowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 5,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginBottom: 12,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803d",
  },
  unreadNotifCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#256428",
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#256428",
  },
  listWrap: {
    gap: 12,
    paddingBottom: 30,
  },
})
