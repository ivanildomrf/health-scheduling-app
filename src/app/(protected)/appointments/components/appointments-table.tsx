"use client";

import { getAppointments } from "@/actions/get-appointments";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppointmentsProvider } from "./appointments-context";
import { appointmentTableColumns } from "./table-column";

interface AppointmentsTableProps {
  clinicId: string;
  initialData?: {
    appointments: any[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export function AppointmentsTable({
  clinicId,
  initialData,
}: AppointmentsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const { execute, result, isExecuting } = useAction(getAppointments, {
    onError: ({ error }) => {
      toast.error("Erro ao carregar agendamentos");
      console.error(error);
    },
  });

  // Função para recarregar os dados
  const handleRefresh = useCallback(() => {
    execute({ page: currentPage, limit, clinicId });
  }, [execute, currentPage, limit, clinicId]);

  // Carregar dados quando página/limite mudar (apenas após interação do usuário)
  useEffect(() => {
    if (hasUserInteracted) {
      execute({ page: currentPage, limit, clinicId });
    }
  }, [currentPage, limit, clinicId, execute, hasUserInteracted]);

  const data = result?.data || initialData;

  const handlePageChange = (page: number) => {
    setHasUserInteracted(true);
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setHasUserInteracted(true);
    setLimit(newLimit);
    setCurrentPage(1); // Resetar para primeira página quando mudar o limite
  };

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <div className="p-8 text-center">
            <p>Carregando agendamentos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppointmentsProvider onRefresh={handleRefresh}>
      <div className="space-y-4">
        <DataTable columns={appointmentTableColumns} data={data.appointments} />

        {data.pagination && data.pagination.totalCount > 0 && (
          <Pagination
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
            totalCount={data.pagination.totalCount}
            limit={data.pagination.limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        )}
      </div>
    </AppointmentsProvider>
  );
}
