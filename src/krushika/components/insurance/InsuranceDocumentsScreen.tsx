import { FileText, Download, Clock } from "lucide-react"
import { useLang } from "@/krushika/i18n"
import { useInsurance, type InsuranceDoc } from "@/krushika/insurance"
import DetailShell from "@/krushika/components/DetailShell"

const docTypeIcon: Record<InsuranceDoc["type"], string> = {
  policy: "bg-green-50 text-green-600",
  application_receipt: "bg-blue-50 text-blue-600",
  premium_receipt: "bg-purple-50 text-purple-600",
  claim_receipt: "bg-orange-50 text-orange-600",
  uploaded: "bg-gray-50 text-gray-600",
}

export default function InsuranceDocumentsScreen() {
  const { t } = useLang()
  const ins = t.ins
  const x = t.x.insurance
  const { documents } = useInsurance()

  return (
    <DetailShell title={ins.documents} subtitle={x.docs.subtitle}>
      {documents.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <FileText className="mx-auto h-12 w-12 text-gray-200" />
          <p className="mt-3 font-semibold">{ins.noDocs}</p>
          <p className="mt-1 text-xs text-gray-400">
            {x.docs.emptyHint}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${docTypeIcon[doc.type]}`}>
                  <FileText className="h-5 w-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{x.docTypes[doc.type]}</p>
                  <p className="text-xs text-gray-400">{doc.date}</p>
                </div>
                {doc.status === "available" ? (
                  <button className="flex items-center gap-1 rounded-xl bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 transition active:scale-95">
                    <Download className="h-3.5 w-3.5" />
                    {x.common.demoBtn}
                  </button>
                ) : (
                  <span className="flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600">
                    <Clock className="h-3.5 w-3.5" />
                    {x.common.pending}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-5 rounded-2xl bg-blue-50 p-4">
        <p className="text-xs font-semibold text-blue-800">{x.docs.storageTitle}</p>
        <p className="mt-1 text-xs leading-relaxed text-blue-700">
          {x.docs.storageBody}
        </p>
      </div>
    </DetailShell>
  )
}
