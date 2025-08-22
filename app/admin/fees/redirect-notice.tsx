import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function RedirectNotice() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040210] to-[#0A0420] p-8 flex items-center justify-center">
      <Card className="max-w-2xl bg-glass-dark border-white/10 p-8">
        <div className="text-center space-y-6">
          <SparklesIcon className="w-16 h-16 text-primary mx-auto" />

          <h1 className="text-3xl font-bold text-white">
            Fee System Upgraded!
          </h1>

          <p className="text-gray-400 text-lg">
            We've consolidated all fee management features into a powerful new
            Formula System. All your fee profiles, imports, and calculations are
            now managed in one place.
          </p>

          <div className="space-y-4 pt-4">
            <Link href="/admin/formulas">
              <Button className="bg-primary hover:bg-primary/90 text-white w-full max-w-sm">
                Go to Formula System
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <div className="text-sm text-gray-500">
              <p>The new system includes:</p>
              <ul className="mt-2 space-y-1">
                <li>• Formula template management</li>
                <li>• Deal-formula assignments</li>
                <li>• Real-time formula testing</li>
                <li>• Visual formula builder</li>
                <li>• Complete audit trails</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
