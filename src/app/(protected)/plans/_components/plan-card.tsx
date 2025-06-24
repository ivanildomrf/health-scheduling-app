"use client";

import { upgradePlan } from "@/actions/upgrade-plan";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/helpers/currency";
import { Check, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  isCurrentPlan: boolean;
  stripePriceId?: string | null;
}

interface PlanCardProps {
  plan: Plan;
}

const PlanCard = ({ plan }: PlanCardProps) => {
  const { execute, isExecuting } = useAction(upgradePlan, {
    onSuccess: (result) => {
      if (result.data?.success) {
        toast.success(result.data.message);
        // A página será revalidada automaticamente pelo revalidatePath
      }
    },
    onError: (error) => {
      toast.error(error.error.serverError || "Erro ao atualizar plano");
    },
  });

  const handleUpgrade = () => {
    execute({
      planSlug: plan.id,
      stripePriceId: plan.stripePriceId || undefined,
    });
  };

  const isPopular = plan.id === "professional";

  return (
    <Card
      className={`relative flex flex-col ${
        plan.isCurrentPlan
          ? "border-blue-200 bg-blue-50 shadow-lg"
          : "border-gray-200 hover:border-blue-200 hover:bg-blue-50 hover:shadow-md"
      } transition-all duration-300`}
    >
      {plan.isCurrentPlan && (
        <Badge className="absolute -top-2 left-4 bg-blue-600 text-white shadow-md">
          Atual
        </Badge>
      )}

      {isPopular && !plan.isCurrentPlan && (
        <Badge className="absolute -top-2 left-4 bg-purple-600 text-white shadow-md">
          Mais Popular
        </Badge>
      )}

      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">
          {plan.name}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          {plan.description}
        </CardDescription>
        <div className="flex items-baseline gap-1 pt-2">
          <span className="text-3xl font-bold text-gray-900">
            {formatCurrency(plan.price)}
          </span>
          <span className="text-sm text-gray-500">/mês</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        {plan.isCurrentPlan ? (
          <Button className="w-full" variant="outline" disabled>
            Plano Atual
          </Button>
        ) : (
          <Button
            className="w-full bg-blue-600 transition-all duration-300 hover:bg-blue-700"
            onClick={handleUpgrade}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Fazer Upgrade"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
