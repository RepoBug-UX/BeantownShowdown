import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Wallet, AlertTriangle } from "lucide-react";
import { formatAddress } from "@/app/lib/utils";

interface BackProjectProps {
  projectId: string;
  projectTitle: string;
  onBackSuccess?: () => void;
}

export default function BackProject({
  projectId,
  projectTitle,
  onBackSuccess,
}: BackProjectProps) {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [amount, setAmount] = useState<number | "">("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBackProject = async () => {
    if (!isConnected) {
      setError("Please connect your wallet to back this project");
      return;
    }

    if (!amount || amount <= 0) {
      setError("Please enter a valid amount to back this project");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addBacker: true,
          backerAddress: address,
          amount: amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to back project");
      }

      // Close dialog and reset state
      setIsOpen(false);
      setAmount("");

      // Call the success callback if provided
      if (onBackSuccess) {
        onBackSuccess();
      }
    } catch (err: any) {
      console.error("Error backing project:", err);
      setError(
        err.message ||
          "There was an error backing this project. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Back this project</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Back "{projectTitle}"</DialogTitle>
          <DialogDescription>
            Enter the amount you'd like to contribute to this project.
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-4">
            <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
            <p className="text-center mb-4">
              Please connect your wallet to back this project
            </p>
            <Button
              onClick={() => {
                // In a real implementation, this would trigger wallet connection
                alert("Please connect your wallet to continue");
              }}
            >
              Connect Wallet
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md mb-4">
              <Wallet className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {formatAddress(address || "")}
              </span>
            </div>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="amount" className="text-right col-span-1">
                  Amount
                </label>
                <div className="col-span-3 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    className="pl-7"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value ? Number(e.target.value) : "")
                    }
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm mt-1">{error}</div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleBackProject} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Back Project"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
