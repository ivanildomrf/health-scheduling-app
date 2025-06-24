"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";

const PaymentFeedback = () => {
  const searchParams = useSearchParams();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      setFeedback({
        type: "success",
        message:
          "Pagamento realizado com sucesso! Seu plano será ativado em instantes.",
      });
    } else if (canceled === "true") {
      setFeedback({
        type: "error",
        message:
          "Pagamento cancelado. Você pode tentar novamente quando quiser.",
      });
    }

    // Limpar a URL após 5 segundos
    if (success || canceled) {
      const timer = setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("success");
        url.searchParams.delete("canceled");
        window.history.replaceState({}, "", url.toString());
        setFeedback({ type: null, message: "" });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!feedback.type) return null;

  return (
    <Alert
      className={`mb-6 ${
        feedback.type === "success"
          ? "border-green-200 bg-green-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      {feedback.type === "success" ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-red-600" />
      )}
      <AlertDescription
        className={
          feedback.type === "success" ? "text-green-800" : "text-red-800"
        }
      >
        {feedback.message}
      </AlertDescription>
    </Alert>
  );
};

export default PaymentFeedback;
