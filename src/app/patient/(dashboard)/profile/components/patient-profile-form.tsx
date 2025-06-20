"use client";

import { updatePatientProfile } from "@/actions/update-patient-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  Loader2,
  MapPin,
  Phone,
  User,
} from "lucide-react";
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

// Países para seleção (em ordem alfabética)
const PAISES = [
  { value: "DE", label: "Alemanha" },
  { value: "AR", label: "Argentina" },
  { value: "BO", label: "Bolívia" },
  { value: "BR", label: "Brasil" },
  { value: "CA", label: "Canadá" },
  { value: "CL", label: "Chile" },
  { value: "CN", label: "China" },
  { value: "CO", label: "Colômbia" },
  { value: "EC", label: "Equador" },
  { value: "ES", label: "Espanha" },
  { value: "US", label: "Estados Unidos" },
  { value: "FR", label: "França" },
  { value: "GY", label: "Guiana" },
  { value: "GF", label: "Guiana Francesa" },
  { value: "IT", label: "Itália" },
  { value: "JP", label: "Japão" },
  { value: "MX", label: "México" },
  { value: "OTHER", label: "Outro" },
  { value: "PY", label: "Paraguai" },
  { value: "PE", label: "Peru" },
  { value: "PT", label: "Portugal" },
  { value: "SR", label: "Suriname" },
  { value: "UY", label: "Uruguai" },
  { value: "VE", label: "Venezuela" },
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

// Definição das etapas do wizard
const WIZARD_STEPS = [
  {
    id: "basic",
    title: "Dados Básicos",
    description: "Informações essenciais de identificação",
    icon: User,
    fields: [
      "motherName",
      "motherUnknown",
      "sex",
      "gender",
      "birthDate",
      "raceColor",
      "email",
      "phone",
    ],
  },
  {
    id: "nationality",
    title: "Nacionalidade",
    description: "Origem e nacionalidade",
    icon: Globe,
    fields: [
      "birthCountry",
      "nationality",
      "birthCity",
      "birthState",
      "naturalizationDate",
    ],
  },
  {
    id: "documents",
    title: "Documentos",
    description: "CPF, RG, CNS e Passaporte",
    icon: FileText,
    fields: [
      "cpf",
      "cnsNumber",
      "rgNumber",
      "rgComplement",
      "rgState",
      "rgIssuer",
      "rgIssueDate",
      "passportNumber",
      "passportCountry",
      "passportIssueDate",
      "passportExpiryDate",
    ],
  },
  {
    id: "address",
    title: "Endereço",
    description: "Localização e residência",
    icon: MapPin,
    fields: [
      "zipCode",
      "country",
      "addressType",
      "addressName",
      "addressNumber",
      "addressComplement",
      "addressNeighborhood",
      "city",
      "state",
    ],
  },
  {
    id: "contacts",
    title: "Contatos",
    description: "Email, telefone e emergência",
    icon: Phone,
    fields: [
      "email",
      "phone",
      "emergencyContact",
      "emergencyPhone",
      "guardianName",
      "guardianRelationship",
      "guardianCpf",
    ],
  },
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
  const [currentStep, setCurrentStep] = useState(0);
  const [fieldStatus, setFieldStatus] = useState<FieldStatus>({});
  const [estados] = useState(ESTADOS_BRASILEIROS);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Estados para controlar salvamentos pendentes
  const [pendingSaves, setPendingSaves] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxWaitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      nationality:
        patientData.nationality ||
        (patientData.birthCountry
          ? (() => {
              const nacionalidades: Record<string, string> = {
                BR: "Brasileira",
                AR: "Argentina",
                BO: "Boliviana",
                CL: "Chilena",
                CO: "Colombiana",
                EC: "Equatoriana",
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
                OTHER: "Outra",
              };
              return (
                nacionalidades[patientData.birthCountry] || "Não informada"
              );
            })()
          : ""),
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

  // Função para processar salvamentos em lote com debounce
  const processPendingSaves = useCallback(async () => {
    if (Object.keys(pendingSaves).length === 0 || isSaving) return;

    setIsSaving(true);
    setHasUnsavedChanges(false);
    const fieldsToSave = { ...pendingSaves };
    setPendingSaves({});

    try {
      const formData = form.getValues();
      const updatedData = { ...formData, ...fieldsToSave };

      const result = await updateProfileAction.executeAsync({
        patientId: patientData.id,
        ...updatedData,
      });

      if (result?.data?.success) {
        Object.keys(fieldsToSave).forEach((fieldName) => {
          setFieldStatus((prev) => ({ ...prev, [fieldName]: "saved" }));
        });

        setTimeout(() => {
          Object.keys(fieldsToSave).forEach((fieldName) => {
            setFieldStatus((prev) => ({ ...prev, [fieldName]: "idle" }));
          });
        }, 1500);
      } else {
        const errorMessage =
          result?.data?.error || "Erro desconhecido ao salvar";
        Object.keys(fieldsToSave).forEach((fieldName) => {
          setFieldStatus((prev) => ({ ...prev, [fieldName]: "error" }));
        });
        toast.error(errorMessage);

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

      setTimeout(() => {
        Object.keys(fieldsToSave).forEach((fieldName) => {
          setFieldStatus((prev) => ({ ...prev, [fieldName]: "idle" }));
        });
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  }, [pendingSaves, isSaving, form, updateProfileAction, patientData.id]);

  // Função para adicionar campo à fila de salvamento
  const saveField = useCallback(
    (fieldName: string, value: any) => {
      // Validação para evitar salvar valores incorretos
      if (!fieldName || fieldName.trim() === "") {
        console.error("❌ Campo inválido:", fieldName);
        return;
      }

      // Campos name e socialName não fazem mais parte do formulário editável

      // Log para debug
      console.log("💾 Salvando campo:", {
        fieldName,
        value,
        type: typeof value,
      });

      setPendingSaves((prev) => ({ ...prev, [fieldName]: value }));
      setHasUnsavedChanges(true);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      if (!maxWaitTimeoutRef.current) {
        maxWaitTimeoutRef.current = setTimeout(async () => {
          await processPendingSaves();
        }, 3000);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        if (maxWaitTimeoutRef.current) {
          clearTimeout(maxWaitTimeoutRef.current);
          maxWaitTimeoutRef.current = null;
        }

        setPendingSaves((currentPending) => {
          Object.keys(currentPending).forEach((field) => {
            setFieldStatus((prev) => ({ ...prev, [field]: "saving" }));
          });
          return currentPending;
        });

        try {
          await processPendingSaves();
        } catch (error) {
          console.error("Erro no processamento de salvamentos:", error);
        }
      }, 500);
    },
    [processPendingSaves, patientData],
  );

  // Monitorar mudanças nos campos da etapa atual
  useEffect(() => {
    const currentStepFields = WIZARD_STEPS[currentStep]?.fields || [];

    const subscription = form.watch((value, { name, type }) => {
      if (!name || type === "blur" || !currentStepFields.includes(name)) return;

      const timeouts = new Map<string, NodeJS.Timeout>();

      const currentValue = value[name];
      const originalValue = (patientData as any)[name];

      console.log("👀 Campo monitorado:", {
        fieldName: name,
        currentValue,
        originalValue,
        step: currentStep,
        shouldInclude: currentStepFields.includes(name),
      });

      // Campos name e socialName não fazem mais parte do formulário
      // (são exibidos como dados informativos)

      // Comparação inteligente (incluindo datas)
      const shouldSave = currentValue !== originalValue;

      if (shouldSave) {
        console.log("💾 Agendando salvamento:", {
          fieldName: name,
          currentValue,
        });

        const existingTimeout = timeouts.get(name);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        const timeout = setTimeout(() => {
          saveField(name, currentValue);
          timeouts.delete(name);
        }, 600);

        timeouts.set(name, timeout);
      }

      return () => {
        timeouts.forEach((timeout) => clearTimeout(timeout));
        timeouts.clear();
      };
    });

    return () => subscription.unsubscribe();
  }, [form, currentStep, patientData, saveField]);

  // Função para buscar municípios por UF
  const buscarMunicipios = useCallback(async (uf: string) => {
    if (!uf) {
      setMunicipios([]);
      return Promise.resolve();
    }

    setLoadingMunicipios(true);
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
      );
      const data: Municipio[] = await response.json();
      const municipiosOrdenados = data.sort((a, b) =>
        a.nome.localeCompare(b.nome),
      );
      setMunicipios(municipiosOrdenados);
      return Promise.resolve();
    } catch (error) {
      toast.error("Erro ao carregar municípios");
      setMunicipios([]);
      return Promise.reject(error);
    } finally {
      setLoadingMunicipios(false);
    }
  }, []);

  // Função para consultar CEP
  const consultarCEP = useCallback(
    async (cep: string) => {
      const cepLimpo = cep.replace(/\D/g, "");
      if (cepLimpo.length !== 8) return;

      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`,
        );
        const data = await response.json();

        if (data.erro) {
          toast.error("CEP não encontrado");
          return;
        }

        const tipoLogradouro = data.logradouro?.toLowerCase().includes("rua")
          ? "rua"
          : data.logradouro?.toLowerCase().includes("avenida")
            ? "avenida"
            : "rua";

        const nomeLogradouro =
          data.logradouro?.replace(
            /^(Rua|Avenida|Travessa|Alameda|Praça|Estrada|Rodovia)\s+/i,
            "",
          ) || "";

        form.setValue("addressType", tipoLogradouro as any);
        form.setValue("addressName", nomeLogradouro);
        form.setValue("addressNeighborhood", data.bairro || "");
        form.setValue("city", data.localidade || "");
        form.setValue("state", data.uf || "");

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

  // Função para determinar nacionalidade baseada no país
  const determinarNacionalidade = useCallback((pais: string) => {
    const nacionalidades: Record<string, string> = {
      BR: "Brasileira",
      AR: "Argentina",
      BO: "Boliviana",
      CL: "Chilena",
      CO: "Colombiana",
      EC: "Equatoriana",
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
      OTHER: "Outra",
    };
    return nacionalidades[pais] || "Não informada";
  }, []);

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

  // Verificar se é menor de 16 anos
  const birthDate = form.watch("birthDate");
  const idade = birthDate ? calcularIdade(birthDate) : null;
  const precisaGuardiao = idade !== null && idade < 16;

  // Verificar se é estrangeiro
  const birthCountry = form.watch("birthCountry");
  const isEstrangeiro = birthCountry && birthCountry !== "BR";

  // Recarregar dados do paciente no formulário quando o componente monta
  useEffect(() => {
    console.log("🔄 Inicializando formulário com dados do paciente:", {
      name: patientData.name,
      socialName: patientData.socialName,
      birthCountry: patientData.birthCountry,
      nationality: patientData.nationality,
    });

    // APENAS carregar dados não-críticos
    // Campos name e socialName são definidos no defaultValues e NÃO devem ser alterados

    // Tratar nacionalidade
    if (patientData.birthCountry) {
      form.setValue("birthCountry", patientData.birthCountry);
    }
    if (patientData.nationality) {
      form.setValue("nationality", patientData.nationality);
    } else if (patientData.birthCountry) {
      // Se não há nacionalidade salva, calcular baseada no país
      const nacionalidade = determinarNacionalidade(patientData.birthCountry);
      form.setValue("nationality", nacionalidade);
    }

    // Carregar municípios se há estado salvo
    if (patientData.state) {
      form.setValue("state", patientData.state);
      buscarMunicipios(patientData.state).then(() => {
        if (patientData.city) {
          form.setValue("city", patientData.city);
        }
      });
    }
  }, [patientData, form, determinarNacionalidade, buscarMunicipios]);

  // Proteção contínua removida - campos agora são disabled

  // Sincronizar dados quando mudamos entre etapas
  useEffect(() => {
    if (currentStep === 1) {
      // Etapa de nacionalidade
      console.log("🔧 Sincronizando etapa 1 - Nacionalidade");
      const currentBirthCountry = form.getValues("birthCountry");
      const currentNationality = form.getValues("nationality");

      // Se os valores no formulário estão vazios, mas existem no banco
      if (!currentBirthCountry && patientData.birthCountry) {
        form.setValue("birthCountry", patientData.birthCountry);
      }

      if (!currentNationality && patientData.nationality) {
        form.setValue("nationality", patientData.nationality);
      } else if (!currentNationality && patientData.birthCountry) {
        const nacionalidade = determinarNacionalidade(patientData.birthCountry);
        form.setValue("nationality", nacionalidade);
      }
    }
  }, [currentStep, form, patientData, determinarNacionalidade]);

  // Sincronizar dados quando mudamos para a etapa de endereço
  useEffect(() => {
    if (currentStep === 3) {
      // Etapa de endereço
      const currentState = form.getValues("state");
      const currentCity = form.getValues("city");

      // Se há estado salvo mas não está no formulário, aplicar
      if (!currentState && patientData.state) {
        form.setValue("state", patientData.state);
      }

      // Se há estado (do banco ou formulário), carregar municípios
      const stateToLoad = currentState || patientData.state;
      if (stateToLoad) {
        buscarMunicipios(stateToLoad).then(() => {
          // Após carregar municípios, definir a cidade se existir no banco
          if (!currentCity && patientData.city) {
            form.setValue("city", patientData.city);
          }
        });
      }
    }
  }, [currentStep, form, patientData, buscarMunicipios]);

  // Definir nacionalidade inicial baseada no país de nascimento
  useEffect(() => {
    const currentNationality = form.getValues("nationality");

    // Só atualizar nacionalidade se:
    // 1. Há um país selecionado
    // 2. NÃO há nacionalidade definida OU a nacionalidade atual não corresponde ao país
    // 3. NÃO estamos na etapa inicial (para evitar conflitos)
    if (
      birthCountry &&
      currentStep > 0 &&
      (!currentNationality || currentNationality.trim() === "")
    ) {
      const nacionalidade = determinarNacionalidade(birthCountry);
      form.setValue("nationality", nacionalidade);
      console.log("🌍 Atualizando nacionalidade:", {
        birthCountry,
        nacionalidade,
      });
    }
  }, [birthCountry, form, determinarNacionalidade, currentStep]);

  // Função para navegar entre etapas
  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  // Função para validar etapa atual
  const validateCurrentStep = () => {
    const currentStepData = WIZARD_STEPS[currentStep];
    const requiredFields = currentStepData.fields.filter((field) => {
      // Campos obrigatórios por etapa
      if (currentStep === 0) return ["sex", "email", "phone"].includes(field);
      return false;
    });

    for (const field of requiredFields) {
      const value = form.getValues(field as keyof ProfileFormData);
      if (!value || value === "") {
        const fieldNames: Record<string, string> = {
          sex: "Sexo",
          email: "Email",
          phone: "Telefone",
        };
        toast.error(`${fieldNames[field]} é obrigatório`);
        return false;
      }
    }
    return true;
  };

  // Função para finalizar o formulário
  const handleFinish = async () => {
    try {
      // Se há salvamentos pendentes, processar antes de finalizar
      if (Object.keys(pendingSaves).length > 0 || hasUnsavedChanges) {
        // Limpar timeouts existentes
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        if (maxWaitTimeoutRef.current) {
          clearTimeout(maxWaitTimeoutRef.current);
          maxWaitTimeoutRef.current = null;
        }

        // Processar salvamentos pendentes
        await processPendingSaves();
      }

      // Limpar estados de salvamento
      setPendingSaves({});
      setHasUnsavedChanges(false);

      // Mostrar mensagem de sucesso
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao finalizar:", error);
      toast.error("Erro ao salvar alterações finais");
    }
  };

  // Componente para indicador de progresso
  const ProgressIndicator = () => {
    const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

    return (
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Etapa {currentStep + 1} de {WIZARD_STEPS.length}
          </h2>
          <Badge variant="secondary">{Math.round(progress)}% completo</Badge>
        </div>

        <Progress value={progress} className="mb-4" />

        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`flex flex-col items-center rounded-lg p-2 text-xs transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : isCompleted
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <StepIcon className="mb-1 h-5 w-5" />
                <span className="hidden font-medium sm:block">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Componente para indicador global de salvamento
  const GlobalSaveIndicator = () => {
    if (isSaving) {
      const isFinishing = currentStep === WIZARD_STEPS.length - 1;
      return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">
            {isFinishing ? "Finalizando..." : "Salvando..."}
          </span>
        </div>
      );
    }

    if (hasUnsavedChanges && !isSaving) {
      return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-white shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Mudanças não salvas</span>
        </div>
      );
    }

    return null;
  };

  // Função para renderizar cada etapa
  const renderStep = () => {
    const currentStepData = WIZARD_STEPS[currentStep];
    const StepIcon = currentStepData.icon;

    switch (currentStepData.id) {
      case "basic":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StepIcon className="h-5 w-5" />
                {currentStepData.title}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* CAMPOS INFORMATIVOS: Mostrar dados reais do banco */}
                <div className="space-y-3">
                  <div>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Nome Completo *
                    </FormLabel>
                    <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                      <p className="text-sm text-gray-900">
                        {patientData.name}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      📋 Campo somente leitura - Entre em contato para
                      alterações
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Nome Social/Apelido
                    </FormLabel>
                    <div className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                      <p className="text-sm text-gray-900">
                        {patientData.socialName || "Não informado"}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      📋 Campo somente leitura - Entre em contato para
                      alterações
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
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

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero</FormLabel>
                      <Select
                        onValueChange={field.onChange}
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
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="raceColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raça/Cor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
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
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        );

      case "nationality":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StepIcon className="h-5 w-5" />
                {currentStepData.title}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="birthCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País de Nascimento</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Determinar nacionalidade automaticamente apenas se não há uma já definida
                          // ou se a nacionalidade atual não corresponde ao novo país
                          const currentNationality =
                            form.getValues("nationality");
                          const newNationality = determinarNacionalidade(value);

                          // Sempre atualizar a nacionalidade quando o país muda
                          form.setValue("nationality", newNationality);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o país" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAISES.map((pais) => (
                            <SelectItem key={pais.value} value={pais.value}>
                              {pais.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nacionalidade</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Determinada automaticamente"
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isEstrangeiro && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="birthCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade de Nascimento</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado/Província de Nascimento</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="naturalizationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Data de Naturalização (se aplicável)
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>
        );

      case "documents":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StepIcon className="h-5 w-5" />
                {currentStepData.title}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Documentos Brasileiros */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Documentos Brasileiros
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* RG */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-700">RG/Identidade</h5>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="rgNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do RG</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rgComplement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: X" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rgState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UF Emissor</FormLabel>
                          <Select
                            onValueChange={field.onChange}
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
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rgIssueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Emissão</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Passaporte para estrangeiros */}
              {isEstrangeiro && (
                <div className="space-y-4">
                  <Separator />
                  <h4 className="font-medium text-gray-900">
                    Dados do Passaporte
                  </h4>
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

                    <FormField
                      control={form.control}
                      name="passportCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País Emissor do Passaporte</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o país emissor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PAISES.map((pais) => (
                                <SelectItem key={pais.value} value={pais.value}>
                                  {pais.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="passportIssueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Emissão</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="passportExpiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Validade</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "address":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StepIcon className="h-5 w-5" />
                {currentStepData.title}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* CEP com consulta automática */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tipo e nome do logradouro */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="addressName"
                  render={({ field }) => (
                    <FormItem className="w-full md:col-span-2">
                      <FormLabel>Nome do Logradouro</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Rua das Flores" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Logradouro</FormLabel>
                      <Select
                        onValueChange={field.onChange}
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
              </div>

              {/* Número e complemento */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="addressNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="addressComplement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Apto 45, Bloco B" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Bairro */}
              <FormField
                control={form.control}
                name="addressNeighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cidade e Estado */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const currentCity = form.getValues("city");
                          field.onChange(value);

                          // Só limpar a cidade se mudou o estado
                          if (value !== field.value) {
                            form.setValue("city", "");
                          }

                          buscarMunicipios(value).then(() => {
                            // Se havia uma cidade selecionada e o estado não mudou, manter
                            if (currentCity && value === field.value) {
                              form.setValue("city", currentCity);
                            }
                          });
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

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Município</FormLabel>
                      <Select
                        onValueChange={field.onChange}
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
              </div>
            </CardContent>
          </Card>
        );

      case "contacts":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StepIcon className="h-5 w-5" />
                {currentStepData.title}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {currentStepData.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contato de emergência */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Contato de Emergência
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Contato</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Guardião/Representante Legal (para menores de 16 anos) */}
              {precisaGuardiao && (
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Guardião/Representante Legal
                    </h4>
                    <p className="text-sm text-gray-600">
                      Obrigatório para menores de 16 anos (idade atual: {idade}{" "}
                      anos)
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="guardianName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nome do Guardião/Representante Legal *
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="guardianRelationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Grau de Parentesco/Relacionamento *
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
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
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <GlobalSaveIndicator />

      <div className="mx-auto max-w-4xl space-y-6">
        <ProgressIndicator />

        {renderStep()}

        {/* Botões de navegação */}
        <div className="flex items-center justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {hasUnsavedChanges && !isSaving && (
              <Badge variant="outline" className="text-orange-600">
                <AlertCircle className="mr-1 h-3 w-3" />
                Salvando automaticamente...
              </Badge>
            )}
            {isSaving && currentStep === WIZARD_STEPS.length - 1 && (
              <Badge variant="outline" className="text-blue-600">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Finalizando...
              </Badge>
            )}
          </div>

          <Button
            type="button"
            onClick={() => {
              if (currentStep === WIZARD_STEPS.length - 1) {
                handleFinish();
              } else if (validateCurrentStep()) {
                nextStep();
              }
            }}
            disabled={currentStep === WIZARD_STEPS.length - 1 && isSaving}
            className="flex items-center gap-2"
          >
            {currentStep === WIZARD_STEPS.length - 1 ? (
              <>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {isSaving ? "Finalizando..." : "Finalizar"}
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Form>
  );
}
