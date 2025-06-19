"use client";

import { getAppointments } from "@/actions/get-appointments";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [currentPage, setCurrentPage] = useState(
    initialData?.pagination.page || 1,
  );
  const [limit, setLimit] = useState(initialData?.pagination.limit || 10);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Usar useRef para manter sempre a referência atual da página
  const currentPageRef = useRef(currentPage);
  const limitRef = useRef(limit);

  // Atualizar as refs sempre que os estados mudarem
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    limitRef.current = limit;
  }, [limit]);

  const { execute, result, isExecuting } = useAction(getAppointments, {
    onSuccess: ({ data }) => {
      // Verificar se a página atual ainda é válida após o refresh
      if (data && data.pagination) {
        const { totalPages } = data.pagination;
        if (currentPageRef.current > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
      }
    },
    onError: ({ error }) => {
      toast.error("Erro ao carregar agendamentos");
      console.error(error);
    },
  });

  // Função para recarregar os dados mantendo a página atual
  const handleRefresh = useCallback(() => {
    const pageToUse = currentPageRef.current;
    const limitToUse = limitRef.current;
    setHasUserInteracted(true);
    execute({ page: pageToUse, limit: limitToUse, clinicId });
  }, [execute, clinicId]);

  // Carregar dados quando página/limite mudar (apenas após interação do usuário)
  useEffect(() => {
    if (hasUserInteracted) {
      execute({ page: currentPage, limit, clinicId });
    }
  }, [currentPage, limit, clinicId, execute, hasUserInteracted]);

  // Usar sempre o currentPage do estado local
  const data = result?.data || initialData;
  const displayData = data
    ? {
        ...data,
        pagination: {
          ...data.pagination,
          page: currentPage, // Sempre usar a página do estado local
        },
      }
    : null;

  const handlePageChange = (page: number) => {
    setHasUserInteracted(true);
    setCurrentPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setHasUserInteracted(true);
    setLimit(newLimit);
    setCurrentPage(1); // Resetar para primeira página quando mudar o limite
  };

  if (!displayData) {
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
        <DataTable
          columns={appointmentTableColumns}
          data={displayData.appointments}
        />

        {displayData.pagination && displayData.pagination.totalCount > 0 && (
          <Pagination
            currentPage={displayData.pagination.page}
            totalPages={displayData.pagination.totalPages}
            totalCount={displayData.pagination.totalCount}
            limit={displayData.pagination.limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        )}
      </div>
    </AppointmentsProvider>
  );
}
