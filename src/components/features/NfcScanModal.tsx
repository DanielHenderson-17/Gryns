import { Nfc } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface NfcScanModalProps {
  open: boolean
  onClose: () => void
}

export function NfcScanModal({ open, onClose }: NfcScanModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Nfc className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-100">Scan to go to pod</h2>
          <p className="mt-2 text-sm text-slate-400">
            Hold your device near an NFC tag on a pod to open that pod. (Not wired up yet.)
          </p>
          <Button variant="secondary" className="mt-6 w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
