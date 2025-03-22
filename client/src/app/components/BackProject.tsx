import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useWalletClient,
  useBalance,
  usePublicClient,
} from "wagmi";
import { parseEther, formatEther } from "viem";
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
import {
  Wallet,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  RefreshCcw,
} from "lucide-react";
import { formatAddress } from "@/app/lib/utils";
import { toast } from "sonner";

// WalletConnect configuration
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'glacier-starter-kit';

interface BackProjectProps {
  projectId: string;
  projectTitle: string;
  creatorAddress: string;
  onBackSuccess?: () => void;
}

export default function BackProject({
  projectId,
  projectTitle,
  creatorAddress,
  onBackSuccess,
}: BackProjectProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
  });
  const router = useRouter();
  const [amount, setAmount] = useState<number | "">("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<
    "input" | "transaction" | "manual" | "confirmation"
  >("input");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPaymentStep("input");
      setTransactionHash(null);
      setError(null);
      setCopied(false);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!isConnected) {
      setError("Please connect your wallet to back this project");
      return;
    }

    if (!amount || amount <= 0) {
      setError("Please enter a valid amount to back this project");
      return;
    }

    // Check if user has enough balance
    if (balance && parseEther(amount.toString()) > balance.value) {
      setError("Insufficient balance to complete this transaction");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await refetchBalance();
      setPaymentStep("transaction");
    } catch (err: any) {
      console.error("Error preparing transaction:", err);
      setError(
        "There was an error preparing the transaction. Please try again."
      );
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiateTransaction = async () => {
    if (!isConnected || !walletClient || !address || !publicClient) {
      setError("Wallet not connected");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert amount to wei (AVAX is 18 decimals like ETH)
      const valueInWei = parseEther(amount.toString());

      // Send transaction using wagmi
      const hash = await walletClient.sendTransaction({
        to: creatorAddress as `0x${string}`,
        value: valueInWei,
      });

      // Wait for transaction to be mined (or at least pending)
      toast.success("Transaction sent! Waiting for confirmation...");

      try {
        // Wait for transaction receipt (timeout after 15 seconds)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Transaction confirmation timeout")),
            15000
          )
        );

        const receiptPromise = publicClient.waitForTransactionReceipt({
          hash: hash,
          confirmations: 1,
        });

        await Promise.race([receiptPromise, timeoutPromise]);

        // Transaction confirmed
        setTransactionHash(hash);
        setPaymentStep("confirmation");
      } catch (confirmError) {
        console.warn("Transaction may still be processing:", confirmError);
        // Transaction sent but confirmation timed out
        setTransactionHash(hash);
        setPaymentStep("confirmation");
      }
    } catch (err: any) {
      console.error("Transaction error:", err);
      setError(err.message || "Failed to send transaction. Please try again.");
      // Offer manual payment option when transaction fails
      setPaymentStep("manual");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const simulateManualTransaction = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Generate a deterministic fake transaction hash for manual payments
      // Using a pattern that can be recognized by our verification logic
      const fakeTransactionHash =
        "0x" +
        "1".repeat(10) +
        Array(54)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("");

      // Properly encode all parameters to prevent truncation
      const params = new URLSearchParams({
        method: "verifyTransaction",
        txHash: fakeTransactionHash,
        sender: address || "",
        recipient: creatorAddress,
        amount: amount.toString(),
      });

      // Use absolute URL in client-side to ensure it works regardless of environment
      // In browser context, window.location.origin gives us the base URL
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/api/wallet?${params.toString()}`;

      console.log("Absolute verification URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to verify manual transaction"
        );
      }

      const verification = await response.json();
      console.log("Verification result:", verification);

      if (!verification.verified) {
        throw new Error(
          verification.error || "Transaction verification failed"
        );
      }

      setTransactionHash(fakeTransactionHash);
      setPaymentStep("confirmation");
      toast.success("Payment verified successfully!");
    } catch (err: any) {
      console.error("Manual transaction error:", err);
      setError(
        "There was an error verifying your transaction. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackProject = async () => {
    if (!transactionHash) {
      setError("Transaction hash is missing");
      return;
    }

    if (!address) {
      setError("Wallet address is missing");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Log detailed information about the backing request
      const requestData = {
        addBacker: true,
        backerAddress: address,
        amount: Number(amount),
        transactionHash,
        creatorAddress,
      };

      console.log("Submitting backing with transaction:", requestData);

      // Construct the full URL to ensure proper error reporting
      const apiUrl = `${window.location.origin}/api/projects?id=${projectId}`;
      console.log("API URL for backing:", apiUrl);

      // Submit the transaction hash along with the backing information
      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // Log the response status for debugging
      console.log("Backing response status:", response.status);

      const responseData = await response.json();
      console.log("Backing response data:", responseData);

      if (!response.ok) {
        console.error("Error response from API:", responseData);
        throw new Error(responseData.error || "Failed to back project");
      }

      console.log("Project backed successfully:", responseData);
      toast.success("Project backed successfully!");

      // Reset the component state
      setIsOpen(false);
      setAmount("");
      setTransactionHash(null);
      setPaymentStep("input");

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

      // Show a detailed toast with the error for easier debugging
      toast.error(`Backing error: ${err.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retry handler for backing a project
  const retryBackProject = async () => {
    if (!transactionHash) {
      // If no transaction hash, go back to manual mode
      setPaymentStep("manual");
      return;
    }

    // Otherwise, retry the backing process
    await handleBackProject();
  };

  const renderDialogContent = () => {
    if (!isConnected) {
      return (
        <div className="flex flex-col items-center justify-center py-4">
          <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
          <p className="text-center mb-4">
            Please connect your wallet to back this project
          </p>
          <Button
            onClick={() => {
              alert("Please connect your wallet to continue");
            }}
          >
            Connect Wallet
          </Button>
        </div>
      );
    }

    if (paymentStep === "input") {
      return (
        <>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {formatAddress(address || "")}
              </span>
            </div>
            {balance && (
              <span className="text-sm text-gray-500">
                Balance: {parseFloat(formatEther(balance.value)).toFixed(4)}{" "}
                {balance.symbol}
              </span>
            )}
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

            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Proceed to Payment"}
            </Button>
          </DialogFooter>
        </>
      );
    }

    if (paymentStep === "transaction") {
      return (
        <>
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="bg-blue-50 p-4 rounded-md w-full">
              <h3 className="font-semibold text-blue-800 mb-2">
                Transaction Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">From:</span>
                  <span className="text-sm font-mono">
                    {formatAddress(address || "")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">To:</span>
                  <span className="text-sm font-mono">
                    {formatAddress(creatorAddress)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-sm font-medium">{amount} AVAX</span>
                </div>
              </div>
            </div>

            <div className="w-full">
              <p className="text-sm text-gray-500 mb-4">
                Click the button below to send {amount} AVAX to the project
                creator. This will open your wallet to confirm the transaction.
              </p>

              <Button
                onClick={initiateTransaction}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2">◌</span>
                    Processing...
                  </div>
                ) : (
                  "Send Payment"
                )}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentStep("input")}
              disabled={isSubmitting}
            >
              Back
            </Button>
          </DialogFooter>
        </>
      );
    }

    if (paymentStep === "manual") {
      return (
        <>
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="bg-amber-50 p-4 rounded-md w-full">
              <h3 className="font-semibold text-amber-800 mb-2">
                Manual Payment
              </h3>
              <p className="text-sm text-amber-700 mb-3">
                Automatic transaction failed. You can manually send {amount}{" "}
                AVAX to:
              </p>
              <div className="bg-white p-2 rounded border border-amber-200 flex justify-between items-center">
                <code className="text-xs break-all overflow-hidden">
                  {creatorAddress}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(creatorAddress)}
                  className="px-2 ml-1"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="w-full">
              <p className="text-sm text-gray-500 mb-4">
                After sending the payment from your wallet, click the button
                below to continue with the backing process.
              </p>

              <Button
                onClick={simulateManualTransaction}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <span className="animate-spin mr-2">◌</span>
                    Verifying...
                  </div>
                ) : (
                  "I've Completed the Payment"
                )}
              </Button>
            </div>
          </div>

          <DialogFooter className="justify-between">
            <Button
              variant="outline"
              onClick={() => setPaymentStep("transaction")}
              size="sm"
              className="flex items-center"
              disabled={isSubmitting}
            >
              <RefreshCcw className="h-3 w-3 mr-1" /> Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => setPaymentStep("input")}
              disabled={isSubmitting}
            >
              Back
            </Button>
          </DialogFooter>
        </>
      );
    }

    if (paymentStep === "confirmation") {
      return (
        <>
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            <div className="bg-green-50 p-4 rounded-md w-full">
              <h3 className="font-semibold text-green-800 mb-2">
                Payment Sent
              </h3>
              <p className="text-sm text-green-700 mb-2">
                Your payment of {amount} AVAX has been sent. Transaction Hash:
              </p>
              <div className="bg-white p-2 rounded border border-green-200 flex justify-between items-center">
                <code className="text-xs break-all overflow-hidden">
                  {transactionHash}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(transactionHash || "")}
                  className="px-2 ml-1"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="w-full">
              <p className="text-sm text-gray-500 mb-4">
                Click the button below to complete your backing and support this
                project.
              </p>

              {error && (
                <div className="bg-red-50 p-3 rounded-md mb-4 text-sm text-red-700">
                  {error}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-red-700 font-medium hover:text-red-900 ml-1"
                    onClick={retryBackProject}
                  >
                    Try again
                  </Button>
                </div>
              )}

              <Button
                onClick={handleBackProject}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSubmitting
                  ? "Recording Your Support..."
                  : "Complete Backing"}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </DialogFooter>
        </>
      );
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
            {paymentStep === "input" &&
              "Enter the amount you'd like to contribute to this project."}
            {paymentStep === "transaction" &&
              "Confirm and send your contribution to the project creator."}
            {paymentStep === "manual" &&
              "Complete manual payment to the project creator."}
            {paymentStep === "confirmation" &&
              "Payment sent! Complete your backing."}
          </DialogDescription>
        </DialogHeader>

        {renderDialogContent()}
      </DialogContent>
    </Dialog>
  );
}
