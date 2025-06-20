"use client";

import { updatePatientProfile } from "@/actions/update-patient-profile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

// Estados brasileiros
const ESTADOS_BRASILEIROS = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

// Interface para município
interface Municipio {
  id: number;
  nome: string;
}

// Países para seleção
const PAISES = [
  { value: "BR", label: "Brasil" },
  { value: "AR", label: "Argentina" },
  { value: "BO", label: "Bolívia" },
  { value: "CL", label: "Chile" },
  { value: "CO", label: "Colômbia" },
  { value: "EC", label: "Equador" },
  { value: "GF", label: "Guiana Francesa" },
  { value: "GY", label: "Guiana" },
  { value: "PY", label: "Paraguai" },
  { value: "PE", label: "Peru" },
  { value: "SR", label: "Suriname" },
  { value: "UY", label: "Uruguai" },
  { value: "VE", label: "Venezuela" },
  { value: "US", label: "Estados Unidos" },
  { value: "CA", label: "Canadá" },
  { value: "MX", label: "México" },
  { value: "PT", label: "Portugal" },
  { value: "ES", label: "Espanha" },
  { value: "IT", label: "Itália" },
  { value: "FR", label: "França" },
  { value: "DE", label: "Alemanha" },
  { value: "JP", label: "Japão" },
  { value: "CN", label: "China" },
  { value: "OTHER", label: "Outro" },
];

// Graus de parentesco
const GRAUS_PARENTESCO = [
  { value: "pai", label: "Pai" },
  { value: "mae", label: "Mãe" },
  { value: "avo", label: "Avô" },
  { value: "avo_feminino", label: "Avó" },
  { value: "tio", label: "Tio" },
  { value: "tia", label: "Tia" },
  { value: "irmao", label: "Irmão" },
  { value: "irma", label: "Irmã" },
  { value: "tutor", label: "Tutor Legal" },
  { value: "curador", label: "Curador" },
  { value: "responsavel_legal", label: "Responsável Legal" },
  { value: "outro", label: "Outro" },
];

const profileSchema = z.object({
  // Dados básicos obrigatórios do CNS
  name: z.string().min(1, "Nome é obrigatório"),
  socialName: z.string().optional(),
  motherName: z.string().optional(),
  motherUnknown: z.boolean().optional(),
  sex: z.enum(["male", "female"], { message: "Sexo é obrigatório" }),
  gender: z
    .enum(["cisgender", "transgenero", "nao_binario", "outro", "nao_informado"])
    .optional(),
  birthDate: z.string().optional(),
  raceColor: z
    .enum(["branca", "preta", "parda", "amarela", "indigena", "sem_informacao"])
    .optional(),

  // Dados de nacionalidade
  nationality: z.string().optional(),
  birthCountry: z.string().optional(),
  birthCity: z.string().optional(),
  birthState: z.string().optional(),
  naturalizationDate: z.string().optional(),

  // Documentos para estrangeiros
  passportNumber: z.string().optional(),
  passportCountry: z.string().optional(),
  passportIssueDate: z.string().optional(),
  passportExpiryDate: z.string().optional(),

  // Contato
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Digite um email válido (exemplo: usuario@email.com)")
    .refine((email) => email.includes("@") && email.includes("."), {
      message: "Email deve conter @ e um domínio válido",
    }),
  phone: z.string().min(1, "Telefone é obrigatório"),

  // Endereço completo
  zipCode: z.string().optional(),
  addressType: z
    .enum([
      "rua",
      "avenida",
      "travessa",
      "alameda",
      "praca",
      "estrada",
      "rodovia",
      "outro",
    ])
    .optional(),
  addressName: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),

  // Documentos brasileiros
  cpf: z.string().optional(),
  rgNumber: z.string().optional(),
  rgComplement: z.string().optional(),
  rgState: z.string().optional(),
  rgIssuer: z.string().optional(),
  rgIssueDate: z.string().optional(),
  cnsNumber: z.string().optional(),

  // Guardião/Representante legal (para menores de 16 anos)
  guardianName: z.string().optional(),
  guardianRelationship: z
    .enum([
      "pai",
      "mae",
      "avo",
      "avo_feminino",
      "tio",
      "tia",
      "irmao",
      "irma",
      "tutor",
      "curador",
      "responsavel_legal",
      "outro",
    ])
    .optional(),
  guardianCpf: z.string().optional(),

  // Contato de emergência
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface PatientProfileFormProps {
  patientData: {
    id: string;
    name: string;
    socialName?: string | null;
    motherName?: string | null;
    motherUnknown?: boolean | null;
    email: string;
    phone: string;
    sex: "male" | "female";
    gender?: string | null;
    birthDate?: Date | null;
    raceColor?: string | null;
    nationality?: string | null;
    birthCountry?: string | null;
    birthCity?: string | null;
    birthState?: string | null;
    naturalizationDate?: Date | null;
    passportNumber?: string | null;
    passportCountry?: string | null;
    passportIssueDate?: Date | null;
    passportExpiryDate?: Date | null;
    zipCode?: string | null;
    addressType?: string | null;
    addressName?: string | null;
    addressNumber?: string | null;
    addressComplement?: string | null;
    addressNeighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    cpf?: string | null;
    rgNumber?: string | null;
    rgComplement?: string | null;
    rgState?: string | null;
    rgIssuer?: string | null;
    rgIssueDate?: Date | null;
    cnsNumber?: string | null;
    guardianName?: string | null;
    guardianRelationship?: string | null;
    guardianCpf?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    clinic: {
      id: string;
      name: string;
    };
  };
}

// Tipo para rastrear status de salvamento de cada campo
type FieldSaveStatus = "idle" | "saving" | "saved" | "error";

interface FieldStatus {
  [fieldName: string]: FieldSaveStatus;
}

export function PatientProfileForm({ patientData }: PatientProfileFormProps) {
  const [fieldStatus, setFieldStatus] = useState<FieldStatus>({});
  const [estados] = useState(ESTADOS_BRASILEIROS);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Estados para controlar salvamentos pendentes
  const [pendingSaves, setPendingSaves] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Estados para confirmação de sincronização de países
  const [showCountrySyncDialog, setShowCountrySyncDialog] = useState(false);
  const [pendingCountrySync, setPendingCountrySync] = useState<{
    birthCountry: string;
    countryName: string;
  } | null>(null);

  // Estados para confirmação de limpeza de campos de estrangeiro
  const [showClearFieldsDialog, setShowClearFieldsDialog] = useState(false);
  const [pendingBrazilChange, setPendingBrazilChange] = useState<{
    newValue: string;
    previousValue: string;
  } | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: patientData.name,
      socialName: patientData.socialName || "",
      motherName: patientData.motherName || "",
      motherUnknown: patientData.motherUnknown || false,
      email: patientData.email,
      phone: patientData.phone,
      sex: patientData.sex,
      gender: (patientData.gender as any) || undefined,
      birthDate: patientData.birthDate
        ? patientData.birthDate.toISOString().split("T")[0]
        : "",
      raceColor: (patientData.raceColor as any) || undefined,
      nationality: patientData.nationality || "",
      birthCountry: patientData.birthCountry || "",
      birthCity: patientData.birthCity || "",
      birthState: patientData.birthState || "",
      naturalizationDate: patientData.naturalizationDate
        ? patientData.naturalizationDate.toISOString().split("T")[0]
        : "",
      passportNumber: patientData.passportNumber || "",
      passportCountry: patientData.passportCountry || "",
      passportIssueDate: patientData.passportIssueDate
        ? patientData.passportIssueDate.toISOString().split("T")[0]
        : "",
      passportExpiryDate: patientData.passportExpiryDate
        ? patientData.passportExpiryDate.toISOString().split("T")[0]
        : "",
      zipCode: patientData.zipCode || "",
      addressType: (patientData.addressType as any) || undefined,
      addressName: patientData.addressName || "",
      addressNumber: patientData.addressNumber || "",
      addressComplement: patientData.addressComplement || "",
      addressNeighborhood: patientData.addressNeighborhood || "",
      city: patientData.city || "",
      state: patientData.state || "",
      country: patientData.country || "",
      cpf: patientData.cpf || "",
      rgNumber: patientData.rgNumber || "",
      rgComplement: patientData.rgComplement || "",
      rgState: patientData.rgState || "",
      rgIssuer: patientData.rgIssuer || "",
      rgIssueDate: patientData.rgIssueDate
        ? patientData.rgIssueDate.toISOString().split("T")[0]
        : "",
      cnsNumber: patientData.cnsNumber || "",
      guardianName: patientData.guardianName || "",
      guardianRelationship:
        (patientData.guardianRelationship as any) || undefined,
      guardianCpf: patientData.guardianCpf || "",
      emergencyContact: patientData.emergencyContact || "",
      emergencyPhone: patientData.emergencyPhone || "",
    },
  });

  const updateProfileAction = useAction(updatePatientProfile, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        // Não mostrar toast para cada campo, apenas atualizar status visual
      }
    },
    onError: ({ error }) => {
      toast.error("Erro ao salvar", {
        description: error.serverError || "Tente novamente",
      });
    },
  });

  // Função para buscar municípios por UF
  const buscarMunicipios = useCallback(async (uf: string) => {
    if (!uf) {
      setMunicipios([]);
      return;
    }

    setLoadingMunicipios(true);
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
      );
      const data: Municipio[] = await response.json();

      // Ordenar municípios alfabeticamente
      const municipiosOrdenados = data.sort((a, b) =>
        a.nome.localeCompare(b.nome),
      );
      setMunicipios(municipiosOrdenados);
    } catch (error) {
      toast.error("Erro ao carregar municípios");
      setMunicipios([]);
    } finally {
      setLoadingMunicipios(false);
    }
  }, []);

  // Carregar municípios quando o componente montar (se já tiver UF selecionada)
  useEffect(() => {
    const currentState = form.getValues("state");
    if (currentState) {
      buscarMunicipios(currentState);
    }
  }, [form, buscarMunicipios]);

  // Função para processar salvamentos em lote com debounce
  const processPendingSaves = useCallback(async () => {
    if (Object.keys(pendingSaves).length === 0 || isSaving) return;

    setIsSaving(true);
    setHasUnsavedChanges(false); // Limpar flag de mudanças não salvas
    const fieldsToSave = { ...pendingSaves };
    setPendingSaves({});

    try {
      // Obter todos os valores atuais do formulário
      const formData = form.getValues();

      // Aplicar as mudanças pendentes
      const updatedData = {
        ...formData,
        ...fieldsToSave,
      };

      console.log("Salvando campos em lote:", Object.keys(fieldsToSave));

      const result = await updateProfileAction.executeAsync({
        patientId: patientData.id,
        ...updatedData,
      });

      if (result?.data?.success) {
        // Marcar todos os campos como "saved" imediatamente
        Object.keys(fieldsToSave).forEach((fieldName) => {
          setFieldStatus((prev) => ({ ...prev, [fieldName]: "saved" }));
        });

        // Remover status "saved" após 1.5 segundos (reduzido de 2s)
        setTimeout(() => {
          Object.keys(fieldsToSave).forEach((fieldName) => {
            setFieldStatus((prev) => ({ ...prev, [fieldName]: "idle" }));
          });
        }, 1500);
      } else {
        console.error("Erro ao salvar campos:", result?.data?.error);
        Object.keys(fieldsToSave).forEach((fieldName) => {
          setFieldStatus((prev) => ({ ...prev, [fieldName]: "error" }));
        });
        if (result?.data?.error) {
          toast.error(result.data.error);
        }

        // Remover status de erro após 3 segundos
        setTimeout(() => {
          Object.keys(fieldsToSave).forEach((fieldName) => {
            setFieldStatus((prev) => ({ ...prev, [fieldName]: "idle" }));
          });
        }, 3000);
      }
    } catch (error) {
      console.error("Erro ao salvar campos:", error);
      Object.keys(fieldsToSave).forEach((fieldName) => {
        setFieldStatus((prev) => ({ ...prev, [fieldName]: "error" }));
      });
      toast.error("Erro ao salvar campos");

      // Remover status de erro após 3 segundos
      setTimeout(() => {
        Object.keys(fieldsToSave).forEach((fieldName) => {
          setFieldStatus((prev) => ({ ...prev, [fieldName]: "idle" }));
        });
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  }, [pendingSaves, isSaving, form, updateProfileAction, patientData.id]);

  // Função original para campos que não são de texto livre
  const saveField = useCallback(
    (fieldName: string, value: any) => {
      // Adicionar o campo à fila de salvamentos pendentes
      setPendingSaves((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      // Marcar que existem mudanças não salvas
      setHasUnsavedChanges(true);

      // Cancelar timeout anterior se existir
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Agendar processamento dos salvamentos após 500ms
      saveTimeoutRef.current = setTimeout(() => {
        // Marcar campos como "saving" apenas quando realmente for salvar
        setPendingSaves((currentPending) => {
          Object.keys(currentPending).forEach((field) => {
            setFieldStatus((prev) => ({ ...prev, [field]: "saving" }));
          });
          return currentPending;
        });
        setFieldStatus((prev) => ({ ...prev, [fieldName]: "saving" }));

        processPendingSaves();
      }, 500);
    },
    [processPendingSaves],
  );

  // Limpar timeout ao desmontar componente
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Monitorar mudanças no campo passportNumber e salvar automaticamente
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        name === "passportNumber" &&
        value.passportNumber !== patientData.passportNumber
      ) {
        saveField("passportNumber", value.passportNumber);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, saveField, patientData.passportNumber]);

  // Componente para indicador global de salvamento
  const GlobalSaveIndicator = () => {
    if (isSaving) {
      return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Salvando...</span>
        </div>
      );
    }

    if (hasUnsavedChanges) {
      return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Mudanças não salvas</span>
        </div>
      );
    }

    return null;
  };

  // Componente para mostrar status de salvamento (otimizado)
  const FieldStatusIndicator = ({ fieldName }: { fieldName: string }) => {
    const status = fieldStatus[fieldName] || "idle";

    // Só mostrar indicador se o status for relevante
    switch (status) {
      case "saved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null; // Não mostrar loading individual, usar o global
    }
  };

  // Wrapper para campos com auto-save
  const AutoSaveFormField = ({
    name,
    children,
    onBlur,
  }: {
    name: string;
    children: React.ReactNode;
    onBlur?: () => void;
  }) => (
    <div className="relative">
      {children}
      <div className="absolute top-8 right-2">
        <FieldStatusIndicator fieldName={name} />
      </div>
    </div>
  );

  // Wrapper otimizado para campos de texto livre (evita perda de foco)
  const AutoSaveTextFormField = ({
    name,
    children,
  }: {
    name: string;
    children: React.ReactNode;
  }) => (
    <div className="relative">
      {children}
      <div className="absolute top-8 right-2">
        <FieldStatusIndicator fieldName={name} />
      </div>
    </div>
  );

  // Função para consultar CEP
  const consultarCEP = useCallback(
    async (cep: string) => {
      const cepLimpo = cep.replace(/\D/g, "");

      if (cepLimpo.length !== 8) {
        return;
      }

      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`,
        );
        const data = await response.json();

        if (data.erro) {
          toast.error("CEP não encontrado");
          return;
        }

        // Mapear tipo de logradouro
        const tipoLogradouro = data.logradouro?.toLowerCase().includes("rua")
          ? "rua"
          : data.logradouro?.toLowerCase().includes("avenida")
            ? "avenida"
            : data.logradouro?.toLowerCase().includes("travessa")
              ? "travessa"
              : data.logradouro?.toLowerCase().includes("alameda")
                ? "alameda"
                : data.logradouro?.toLowerCase().includes("praça")
                  ? "praca"
                  : data.logradouro?.toLowerCase().includes("estrada")
                    ? "estrada"
                    : data.logradouro?.toLowerCase().includes("rodovia")
                      ? "rodovia"
                      : "rua";

        // Extrair nome do logradouro (remover o tipo)
        const nomeLogradouro =
          data.logradouro?.replace(
            /^(Rua|Avenida|Travessa|Alameda|Praça|Estrada|Rodovia)\s+/i,
            "",
          ) || "";

        // Atualizar campos do formulário
        form.setValue("addressType", tipoLogradouro as any);
        form.setValue("addressName", nomeLogradouro);
        form.setValue("addressNeighborhood", data.bairro || "");
        form.setValue("city", data.localidade || "");
        form.setValue("state", data.uf || "");

        // Buscar municípios do estado se o UF foi preenchido
        if (data.uf) {
          await buscarMunicipios(data.uf);
        }

        toast.success("Endereço preenchido automaticamente!");
      } catch (error) {
        toast.error("Erro ao consultar CEP");
      }
    },
    [form, buscarMunicipios],
  );

  // Função para calcular idade
  const calcularIdade = useCallback((birthDate: string) => {
    if (!birthDate) return null;
    const hoje = new Date();
    const nascimento = new Date(birthDate);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  }, []);

  // Função para obter o nome do país pelo código
  const getPaisNome = (codigo: string): string => {
    const paisMap: { [key: string]: string } = {
      BR: "Brasil",
      US: "Estados Unidos",
      AR: "Argentina",
      UY: "Uruguai",
      PY: "Paraguai",
      BO: "Bolívia",
      PE: "Peru",
      CO: "Colômbia",
      VE: "Venezuela",
      CL: "Chile",
      EC: "Equador",
      GY: "Guiana",
      SR: "Suriname",
      GF: "Guiana Francesa",
      PT: "Portugal",
      ES: "Espanha",
      IT: "Itália",
      DE: "Alemanha",
      FR: "França",
      JP: "Japão",
      CN: "China",
      OTHER: "Outro",
    };

    return paisMap[codigo] || codigo;
  };

  // Função para determinar nacionalidade com base no país
  const determinarNacionalidade = useCallback((paisCodigo: string) => {
    const nacionalidades: Record<string, string> = {
      BR: "Brasileira",
      AR: "Argentina",
      BO: "Boliviana",
      CL: "Chilena",
      CO: "Colombiana",
      EC: "Equadoriana",
      GF: "Francesa",
      GY: "Guianense",
      PY: "Paraguaia",
      PE: "Peruana",
      SR: "Surinamesa",
      UY: "Uruguaia",
      VE: "Venezuelana",
      US: "Americana",
      CA: "Canadense",
      MX: "Mexicana",
      PT: "Portuguesa",
      ES: "Espanhola",
      IT: "Italiana",
      FR: "Francesa",
      DE: "Alemã",
      JP: "Japonesa",
      CN: "Chinesa",
      RU: "Russa",
      IN: "Indiana",
      ID: "Indonésia",
      MY: "Malasia",
      PH: "Filipina",
      TH: "Tailandesa",
      VN: "Vietnamita",
      ZA: "Africana",
      ZM: "Zambiana",
      ZW: "Zimbabuana",
      OTHER: "Outra",
    };
    return nacionalidades[paisCodigo] || "estrangeira";
  }, []);

  // Verificar se é menor de 16 anos
  const birthDate = form.watch("birthDate");
  const idade = birthDate ? calcularIdade(birthDate) : null;
  const precisaGuardiao = idade !== null && idade < 16;

  // Verificar se é estrangeiro
  const birthCountry = form.watch("birthCountry");
  const isEstrangeiro = birthCountry && birthCountry !== "BR";

  // Função para verificar se há dados importantes de estrangeiro preenchidos
  const hasImportantForeignerData = useCallback(() => {
    const values = form.getValues();
    return !!(
      values.birthCity ||
      values.birthState ||
      values.naturalizationDate ||
      values.passportNumber ||
      values.passportCountry ||
      values.passportIssueDate ||
      values.passportExpiryDate
    );
  }, [form]);

  // Função para limpar campos específicos de estrangeiros
  const clearForeignerFields = useCallback(
    (showConfirmation = true) => {
      // Se há dados importantes e deve mostrar confirmação, perguntar ao usuário
      if (showConfirmation && hasImportantForeignerData()) {
        // Em vez de window.confirm, retornar false para mostrar o dialog
        return false;
      }

      // Limpar campos de nascimento no exterior
      form.setValue("birthCity", "");
      form.setValue("birthState", "");
      form.setValue("naturalizationDate", "");

      // Limpar campos de passaporte
      form.setValue("passportNumber", "");
      form.setValue("passportCountry", "");
      form.setValue("passportIssueDate", "");
      form.setValue("passportExpiryDate", "");

      // Salvar as limpezas
      const fieldsToSave = {
        birthCity: "",
        birthState: "",
        naturalizationDate: "",
        passportNumber: "",
        passportCountry: "",
        passportIssueDate: "",
        passportExpiryDate: "",
      };

      // Adicionar todos os campos limpos à fila de salvamento
      setPendingSaves((prev) => ({
        ...prev,
        ...fieldsToSave,
      }));

      // Marcar que existem mudanças não salvas
      setHasUnsavedChanges(true);

      // Cancelar timeout anterior se existir
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Agendar processamento dos salvamentos
      saveTimeoutRef.current = setTimeout(() => {
        Object.keys(fieldsToSave).forEach((field) => {
          setFieldStatus((prev) => ({ ...prev, [field]: "saving" }));
        });
        processPendingSaves();
      }, 500);

      toast.success("Campos de estrangeiro foram limpos automaticamente", {
        description:
          "Dados de passaporte, naturalização e nascimento no exterior foram removidos",
      });
      return true;
    },
    [
      form,
      hasImportantForeignerData,
      setPendingSaves,
      setHasUnsavedChanges,
      saveTimeoutRef,
      processPendingSaves,
    ],
  );

  // Função para confirmar sincronização de países
  const handleConfirmCountrySync = () => {
    if (pendingCountrySync) {
      form.setValue("passportCountry", pendingCountrySync.birthCountry);
      saveField("passportCountry", pendingCountrySync.birthCountry);

      toast.success(
        `País emissor do passaporte definido como ${pendingCountrySync.countryName}`,
      );
    }

    setShowCountrySyncDialog(false);
    setPendingCountrySync(null);
  };

  // Função para cancelar sincronização de países
  const handleCancelCountrySync = () => {
    setShowCountrySyncDialog(false);
    setPendingCountrySync(null);
  };

  // Função para confirmar limpeza de campos de estrangeiro
  const handleConfirmClearFields = () => {
    if (pendingBrazilChange) {
      // Limpar os campos
      clearForeignerFields(false);

      // Atualizar o país para Brasil
      form.setValue("birthCountry", pendingBrazilChange.newValue);
      const nacionalidade = determinarNacionalidade(
        pendingBrazilChange.newValue,
      );
      form.setValue("nationality", nacionalidade);
      saveField("birthCountry", pendingBrazilChange.newValue);
    }

    setShowClearFieldsDialog(false);
    setPendingBrazilChange(null);
  };

  // Função para cancelar limpeza de campos de estrangeiro
  const handleCancelClearFields = () => {
    setShowClearFieldsDialog(false);
    setPendingBrazilChange(null);
    // Não fazer nada - manter o país anterior
  };

  return (
    <Form {...form}>
      {/* Indicador global de salvamento */}
      <GlobalSaveIndicator />

      <div className="space-y-8">
        {/* Header com informação sobre auto-save */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">
                Salvamento Automático Inteligente
              </h3>
              <p className="text-sm text-blue-700">
                Suas alterações são salvas automaticamente em lote. Você verá um
                indicador no canto superior direito quando houver mudanças não
                salvas.
              </p>
            </div>
          </div>
        </div>

        {/* Seção 1: Dados Básicos de Identificação */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Básicos de Identificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AutoSaveTextFormField name="name">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            saveField("name", e.target.value);
                          }}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveTextFormField>

              <AutoSaveTextFormField name="socialName">
                <FormField
                  control={form.control}
                  name="socialName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Social/Apelido</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nome pelo qual prefere ser chamado"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            saveField("socialName", e.target.value);
                          }}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveTextFormField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AutoSaveTextFormField name="motherName">
                <FormField
                  control={form.control}
                  name="motherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Mãe</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={form.watch("motherUnknown")}
                          placeholder={
                            form.watch("motherUnknown")
                              ? "Mãe desconhecida"
                              : "Nome completo da mãe"
                          }
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            if (!form.watch("motherUnknown")) {
                              saveField("motherName", e.target.value);
                            }
                          }}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveTextFormField>

              <FormField
                control={form.control}
                name="motherUnknown"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.checked);
                          if (e.target.checked) {
                            form.setValue("motherName", "");
                          }
                          saveField("motherUnknown", e.target.checked);
                        }}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        Mãe desconhecida
                      </FormLabel>
                      <p className="text-muted-foreground text-xs">
                        Marque esta opção se a mãe for desconhecida
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AutoSaveFormField name="sex">
                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          saveField("sex", value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o sexo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Masculino</SelectItem>
                          <SelectItem value="female">Feminino</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>

              <AutoSaveFormField name="gender">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          saveField("gender", value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o gênero" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cisgender">Cisgênero</SelectItem>
                          <SelectItem value="transgenero">
                            Transgênero
                          </SelectItem>
                          <SelectItem value="nao_binario">
                            Não binário
                          </SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                          <SelectItem value="nao_informado">
                            Não informado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AutoSaveFormField name="birthDate">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          onBlur={(e) => {
                            field.onBlur();
                            saveField("birthDate", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>

              <AutoSaveFormField name="raceColor">
                <FormField
                  control={form.control}
                  name="raceColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raça/Cor</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          saveField("raceColor", value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="branca">Branca</SelectItem>
                          <SelectItem value="preta">Preta</SelectItem>
                          <SelectItem value="parda">Parda</SelectItem>
                          <SelectItem value="amarela">Amarela</SelectItem>
                          <SelectItem value="indigena">Indígena</SelectItem>
                          <SelectItem value="sem_informacao">
                            Sem informação
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Nacionalidade e Origem */}
        <Card>
          <CardHeader>
            <CardTitle>Nacionalidade e Origem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AutoSaveFormField name="birthCountry">
                <FormField
                  control={form.control}
                  name="birthCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País de Nascimento</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const previousValue = field.value;

                          // Se mudou de estrangeiro para Brasil, verificar se deve limpar campos
                          if (
                            previousValue &&
                            previousValue !== "BR" &&
                            value === "BR"
                          ) {
                            // Se há dados importantes, mostrar dialog de confirmação
                            if (hasImportantForeignerData()) {
                              setPendingBrazilChange({
                                newValue: value,
                                previousValue: previousValue,
                              });
                              setShowClearFieldsDialog(true);
                              return; // Não atualizar o campo ainda
                            }

                            // Se não há dados importantes, limpar automaticamente
                            clearForeignerFields(false);

                            // Se chegou aqui, usuário confirmou mudança para Brasil
                            field.onChange(value);
                            const nacionalidade =
                              determinarNacionalidade(value);
                            form.setValue("nationality", nacionalidade);
                            saveField("birthCountry", value);
                            return; // Sair da função, não executar lógica de país estrangeiro
                          }

                          // Atualizar o campo normalmente
                          field.onChange(value);
                          const nacionalidade = determinarNacionalidade(value);
                          form.setValue("nationality", nacionalidade);

                          // Se selecionou um país estrangeiro (diferente do Brasil),
                          // perguntar se deve sincronizar com o país emissor do passaporte
                          if (value && value !== "BR") {
                            const countryName = getPaisNome(value);
                            setPendingCountrySync({
                              birthCountry: value,
                              countryName: countryName,
                            });
                            setShowCountrySyncDialog(true);
                          }

                          saveField("birthCountry", value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o país" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BR">Brasil</SelectItem>
                          <SelectItem value="US">Estados Unidos</SelectItem>
                          <SelectItem value="AR">Argentina</SelectItem>
                          <SelectItem value="UY">Uruguai</SelectItem>
                          <SelectItem value="PY">Paraguai</SelectItem>
                          <SelectItem value="BO">Bolívia</SelectItem>
                          <SelectItem value="PE">Peru</SelectItem>
                          <SelectItem value="CO">Colômbia</SelectItem>
                          <SelectItem value="VE">Venezuela</SelectItem>
                          <SelectItem value="CL">Chile</SelectItem>
                          <SelectItem value="EC">Equador</SelectItem>
                          <SelectItem value="GY">Guiana</SelectItem>
                          <SelectItem value="SR">Suriname</SelectItem>
                          <SelectItem value="GF">Guiana Francesa</SelectItem>
                          <SelectItem value="PT">Portugal</SelectItem>
                          <SelectItem value="ES">Espanha</SelectItem>
                          <SelectItem value="IT">Itália</SelectItem>
                          <SelectItem value="DE">Alemanha</SelectItem>
                          <SelectItem value="FR">França</SelectItem>
                          <SelectItem value="JP">Japão</SelectItem>
                          <SelectItem value="CN">China</SelectItem>
                          <SelectItem value="OTHER">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>

              <AutoSaveFormField name="nationality">
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nacionalidade</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          placeholder="Determinada automaticamente"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>
            </div>

            {isEstrangeiro && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <AutoSaveTextFormField name="birthCity">
                    <FormField
                      control={form.control}
                      name="birthCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade de Nascimento</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                saveField("birthCity", e.target.value);
                              }}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AutoSaveTextFormField>

                  <AutoSaveTextFormField name="birthState">
                    <FormField
                      control={form.control}
                      name="birthState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado/Província de Nascimento</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                saveField("birthState", e.target.value);
                              }}
                              onBlur={field.onBlur}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </AutoSaveTextFormField>
                </div>

                <AutoSaveFormField name="naturalizationDate">
                  <FormField
                    control={form.control}
                    name="naturalizationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Data de Naturalização (se aplicável)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            onBlur={(e) => {
                              field.onBlur();
                              saveField("naturalizationDate", e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AutoSaveFormField>
              </>
            )}
          </CardContent>
        </Card>

        {/* Seção 3: Dados do Passaporte */}
        {isEstrangeiro && (
          <Card>
            <CardHeader>
              <CardTitle>Dados do Passaporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="passportNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Passaporte</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Digite o número do passaporte"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AutoSaveFormField name="passportCountry">
                  <FormField
                    control={form.control}
                    name="passportCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País Emissor do Passaporte</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            saveField("passportCountry", value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o país emissor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BR">Brasil</SelectItem>
                            <SelectItem value="US">Estados Unidos</SelectItem>
                            <SelectItem value="AR">Argentina</SelectItem>
                            <SelectItem value="UY">Uruguai</SelectItem>
                            <SelectItem value="PY">Paraguai</SelectItem>
                            <SelectItem value="BO">Bolívia</SelectItem>
                            <SelectItem value="PE">Peru</SelectItem>
                            <SelectItem value="CO">Colômbia</SelectItem>
                            <SelectItem value="VE">Venezuela</SelectItem>
                            <SelectItem value="CL">Chile</SelectItem>
                            <SelectItem value="EC">Equador</SelectItem>
                            <SelectItem value="GY">Guiana</SelectItem>
                            <SelectItem value="SR">Suriname</SelectItem>
                            <SelectItem value="GF">Guiana Francesa</SelectItem>
                            <SelectItem value="PT">Portugal</SelectItem>
                            <SelectItem value="ES">Espanha</SelectItem>
                            <SelectItem value="IT">Itália</SelectItem>
                            <SelectItem value="DE">Alemanha</SelectItem>
                            <SelectItem value="FR">França</SelectItem>
                            <SelectItem value="JP">Japão</SelectItem>
                            <SelectItem value="CN">China</SelectItem>
                            <SelectItem value="OTHER">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AutoSaveFormField>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AutoSaveFormField name="passportIssueDate">
                  <FormField
                    control={form.control}
                    name="passportIssueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Emissão</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            onBlur={(e) => {
                              field.onBlur();
                              saveField("passportIssueDate", e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AutoSaveFormField>

                <AutoSaveFormField name="passportExpiryDate">
                  <FormField
                    control={form.control}
                    name="passportExpiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Validade</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            onBlur={(e) => {
                              field.onBlur();
                              saveField("passportExpiryDate", e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AutoSaveFormField>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seção 4: Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Dados de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AutoSaveTextFormField name="email">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Principal *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="usuario@email.com"
                        autoComplete="email"
                        inputMode="email"
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          saveField("email", e.target.value);
                        }}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AutoSaveTextFormField>

            <AutoSaveFormField name="phone">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <PatternFormat
                        format="(##) #####-####"
                        mask="_"
                        customInput={Input}
                        placeholder="(11) 99999-9999"
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.formattedValue);
                        }}
                        onBlur={() => {
                          saveField("phone", field.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AutoSaveFormField>
          </CardContent>
        </Card>

        {/* Seção 5: Endereço Completo */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço Completo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* CEP com consulta automática */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AutoSaveFormField name="zipCode">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="#####-###"
                          mask="_"
                          customInput={Input}
                          placeholder="12345-678"
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.formattedValue);
                            if (
                              values.formattedValue &&
                              values.formattedValue.length === 9
                            ) {
                              consultarCEP(values.formattedValue);
                            }
                          }}
                          onBlur={(e) => {
                            field.onBlur();
                            saveField("zipCode", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>

              <AutoSaveFormField name="country">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onBlur={(e) => {
                            field.onBlur();
                            saveField("country", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>
            </div>

            {/* Tipo e nome do logradouro */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <AutoSaveTextFormField name="addressName">
                <FormField
                  control={form.control}
                  name="addressName"
                  render={({ field }) => (
                    <FormItem className="w-full md:col-span-2">
                      <FormLabel>Nome do Logradouro</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Rua das Flores"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            saveField("addressName", e.target.value);
                          }}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveTextFormField>
              <AutoSaveFormField name="addressType">
                <FormField
                  control={form.control}
                  name="addressType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Logradouro</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          saveField("addressType", value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rua">Rua</SelectItem>
                          <SelectItem value="avenida">Avenida</SelectItem>
                          <SelectItem value="travessa">Travessa</SelectItem>
                          <SelectItem value="alameda">Alameda</SelectItem>
                          <SelectItem value="praca">Praça</SelectItem>
                          <SelectItem value="estrada">Estrada</SelectItem>
                          <SelectItem value="rodovia">Rodovia</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>
            </div>

            {/* Número e complemento */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AutoSaveFormField name="addressNumber">
                <FormField
                  control={form.control}
                  name="addressNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="123"
                          onBlur={(e) => {
                            field.onBlur();
                            saveField("addressNumber", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>

              <AutoSaveFormField name="addressComplement">
                <FormField
                  control={form.control}
                  name="addressComplement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Apto 45, Bloco B"
                          onBlur={(e) => {
                            field.onBlur();
                            saveField("addressComplement", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>
            </div>

            {/* Bairro */}
            <AutoSaveFormField name="addressNeighborhood">
              <FormField
                control={form.control}
                name="addressNeighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onBlur={(e) => {
                          field.onBlur();
                          saveField("addressNeighborhood", e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AutoSaveFormField>

            {/* Cidade e Estado */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AutoSaveFormField name="state">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Limpar município quando mudar estado
                          form.setValue("city", "");
                          // Buscar municípios do novo estado
                          buscarMunicipios(value);
                          saveField("state", value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estados.map((estado) => (
                            <SelectItem key={estado.value} value={estado.value}>
                              {estado.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>

              <AutoSaveFormField name="city">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Município</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          saveField("city", value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o município" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {municipios.map((municipio) => (
                            <SelectItem
                              key={municipio.id}
                              value={municipio.nome}
                            >
                              {municipio.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>
            </div>
          </CardContent>
        </Card>

        {/* Seção 6: Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AutoSaveFormField name="cpf">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="###.###.###-##"
                          mask="_"
                          customInput={Input}
                          placeholder="123.456.789-00"
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.formattedValue);
                          }}
                          onBlur={(e) => {
                            field.onBlur();
                            saveField("cpf", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>

              <AutoSaveFormField name="cnsNumber">
                <FormField
                  control={form.control}
                  name="cnsNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cartão Nacional de Saúde (CNS)</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="### #### #### ####"
                          mask="_"
                          customInput={Input}
                          placeholder="123 4567 8901 2345"
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.formattedValue);
                          }}
                          onBlur={(e) => {
                            field.onBlur();
                            saveField("cnsNumber", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>
            </div>

            {/* RG/Identidade */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">RG/Identidade</h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <AutoSaveFormField name="rgNumber">
                  <FormField
                    control={form.control}
                    name="rgNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do RG</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onBlur={(e) => {
                              field.onBlur();
                              saveField("rgNumber", e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AutoSaveFormField>

                <AutoSaveFormField name="rgComplement">
                  <FormField
                    control={form.control}
                    name="rgComplement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: X"
                            onBlur={(e) => {
                              field.onBlur();
                              saveField("rgComplement", e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AutoSaveFormField>

                <AutoSaveFormField name="rgState">
                  <FormField
                    control={form.control}
                    name="rgState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UF Emissor</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            saveField("rgState", value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {estados.map((estado) => (
                              <SelectItem
                                key={estado.value}
                                value={estado.value}
                              >
                                {estado.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AutoSaveFormField>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <AutoSaveFormField name="rgIssuer">
                  <FormField
                    control={form.control}
                    name="rgIssuer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Órgão Emissor</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: SSP, DETRAN, PC"
                            onBlur={(e) => {
                              field.onBlur();
                              saveField("rgIssuer", e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AutoSaveFormField>

                <AutoSaveFormField name="rgIssueDate">
                  <FormField
                    control={form.control}
                    name="rgIssueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Emissão</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            onBlur={(e) => {
                              field.onBlur();
                              saveField("rgIssueDate", e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AutoSaveFormField>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 7: Contato de Emergência */}
        <Card>
          <CardHeader>
            <CardTitle>Contato de Emergência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AutoSaveFormField name="emergencyContact">
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onBlur={(e) => {
                            field.onBlur();
                            saveField("emergencyContact", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>

              <AutoSaveFormField name="emergencyPhone">
                <FormField
                  control={form.control}
                  name="emergencyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone do Contato</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="(##) #####-####"
                          mask="_"
                          customInput={Input}
                          placeholder="(11) 99999-9999"
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.formattedValue);
                          }}
                          onBlur={() => {
                            saveField("emergencyPhone", field.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>
            </div>
          </CardContent>
        </Card>

        {/* Seção 8: Guardião/Representante Legal (para menores de 16 anos) */}
        {precisaGuardiao && (
          <Card>
            <CardHeader>
              <CardTitle>Guardião/Representante Legal</CardTitle>
              <p className="text-sm text-gray-600">
                Obrigatório para menores de 16 anos (idade atual: {idade} anos)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <AutoSaveFormField name="guardianName">
                <FormField
                  control={form.control}
                  name="guardianName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nome do Guardião/Representante Legal *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onBlur={(e) => {
                            field.onBlur();
                            saveField("guardianName", e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AutoSaveFormField>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AutoSaveFormField name="guardianRelationship">
                  <FormField
                    control={form.control}
                    name="guardianRelationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Grau de Parentesco/Relacionamento *
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            saveField("guardianRelationship", value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o parentesco" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GRAUS_PARENTESCO.map((grau) => (
                              <SelectItem key={grau.value} value={grau.value}>
                                {grau.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AutoSaveFormField>

                <AutoSaveFormField name="guardianCpf">
                  <FormField
                    control={form.control}
                    name="guardianCpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF do Guardião *</FormLabel>
                        <FormControl>
                          <PatternFormat
                            format="###.###.###-##"
                            mask="_"
                            customInput={Input}
                            placeholder="123.456.789-00"
                            value={field.value}
                            onValueChange={(values) => {
                              field.onChange(values.formattedValue);
                            }}
                            onBlur={(e) => {
                              field.onBlur();
                              saveField("guardianCpf", e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AutoSaveFormField>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status geral de salvamento */}
        <div className="rounded-lg border bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900">
                Perfil atualizado automaticamente
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Auto-save ativo
            </Badge>
          </div>
        </div>

        {/* Debug info - remover em produção */}
        {process.env.NODE_ENV === "development" && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h4 className="mb-2 font-medium text-yellow-900">
              Debug Info (Dev Only)
            </h4>
            <div className="space-y-1 text-xs text-yellow-800">
              <p>
                <strong>Is Saving:</strong> {isSaving ? "Sim" : "Não"}
              </p>
              <p>
                <strong>Pending Saves:</strong>{" "}
                {Object.keys(pendingSaves).join(", ") || "Nenhum"}
              </p>
              <p>
                <strong>Pending Values:</strong> {JSON.stringify(pendingSaves)}
              </p>
              <hr className="my-2" />
              <p>
                <strong>Gender:</strong>{" "}
                {form.watch("gender") || "não definido"}
              </p>
              <p>
                <strong>Race/Color:</strong>{" "}
                {form.watch("raceColor") || "não definido"}
              </p>
              <p>
                <strong>Nationality:</strong>{" "}
                {form.watch("nationality") || "não definido"}
              </p>
              <p>
                <strong>Birth Country:</strong>{" "}
                {form.watch("birthCountry") || "não definido"}
              </p>
              <p>
                <strong>Passport Number:</strong>{" "}
                {form.watch("passportNumber") || "não definido"}
              </p>
              <p>
                <strong>CPF:</strong> {form.watch("cpf") || "não definido"}
              </p>
              <p>
                <strong>RG Number:</strong>{" "}
                {form.watch("rgNumber") || "não definido"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Dialog de confirmação para sincronização de países */}
      <AlertDialog
        open={showCountrySyncDialog}
        onOpenChange={setShowCountrySyncDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sincronizar País do Passaporte</AlertDialogTitle>
            <AlertDialogDescription>
              Você selecionou <strong>{pendingCountrySync?.countryName}</strong>{" "}
              como país de nascimento.
              <br />
              <br />
              Deseja definir automaticamente o mesmo país como{" "}
              <strong>País Emissor do Passaporte</strong>?
              <br />
              <br />
              <span className="text-muted-foreground text-sm">
                Isso é recomendado pois normalmente o passaporte é emitido pelo
                país de nascimento. Você pode alterar posteriormente se
                necessário.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelCountrySync}>
              Não, manter separado
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCountrySync}>
              Sim, sincronizar países
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação para limpeza de campos de estrangeiro */}
      <AlertDialog
        open={showClearFieldsDialog}
        onOpenChange={setShowClearFieldsDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar Campos de Estrangeiro</AlertDialogTitle>
            <AlertDialogDescription>
              Você mudou o país de nascimento para Brasil. Isso irá limpar
              automaticamente os dados específicos de estrangeiros (passaporte,
              naturalização, etc.). Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClearFields}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClearFields}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}
