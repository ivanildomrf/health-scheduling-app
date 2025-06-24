"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FileText,
  Globe,
  Home,
  IdCard,
  Loader2,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

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

// Países para seleção (em ordem alfabética)
const PAISES = [
  { value: "BR", label: "Brasil" },
  { value: "AR", label: "Argentina" },
  { value: "AU", label: "Austrália" },
  { value: "AT", label: "Áustria" },
  { value: "BE", label: "Bélgica" },
  { value: "BO", label: "Bolívia" },
  { value: "CA", label: "Canadá" },
  { value: "CL", label: "Chile" },
  { value: "CN", label: "China" },
  { value: "CO", label: "Colômbia" },
  { value: "CR", label: "Costa Rica" },
  { value: "CU", label: "Cuba" },
  { value: "DK", label: "Dinamarca" },
  { value: "EC", label: "Equador" },
  { value: "EG", label: "Egito" },
  { value: "ES", label: "Espanha" },
  { value: "US", label: "Estados Unidos" },
  { value: "FI", label: "Finlândia" },
  { value: "FR", label: "França" },
  { value: "DE", label: "Alemanha" },
  { value: "GR", label: "Grécia" },
  { value: "GT", label: "Guatemala" },
  { value: "GY", label: "Guiana" },
  { value: "GF", label: "Guiana Francesa" },
  { value: "HT", label: "Haiti" },
  { value: "HN", label: "Honduras" },
  { value: "IN", label: "Índia" },
  { value: "ID", label: "Indonésia" },
  { value: "IR", label: "Irã" },
  { value: "IQ", label: "Iraque" },
  { value: "IE", label: "Irlanda" },
  { value: "IL", label: "Israel" },
  { value: "IT", label: "Itália" },
  { value: "JM", label: "Jamaica" },
  { value: "JP", label: "Japão" },
  { value: "JO", label: "Jordânia" },
  { value: "LB", label: "Líbano" },
  { value: "LY", label: "Líbia" },
  { value: "MX", label: "México" },
  { value: "MA", label: "Marrocos" },
  { value: "NI", label: "Nicarágua" },
  { value: "NO", label: "Noruega" },
  { value: "NZ", label: "Nova Zelândia" },
  { value: "PA", label: "Panamá" },
  { value: "PY", label: "Paraguai" },
  { value: "PE", label: "Peru" },
  { value: "PL", label: "Polônia" },
  { value: "PT", label: "Portugal" },
  { value: "GB", label: "Reino Unido" },
  { value: "RU", label: "Rússia" },
  { value: "SV", label: "El Salvador" },
  { value: "SR", label: "Suriname" },
  { value: "SE", label: "Suécia" },
  { value: "CH", label: "Suíça" },
  { value: "TH", label: "Tailândia" },
  { value: "TR", label: "Turquia" },
  { value: "UA", label: "Ucrânia" },
  { value: "UY", label: "Uruguai" },
  { value: "VE", label: "Venezuela" },
  { value: "VN", label: "Vietnã" },
  { value: "ZA", label: "África do Sul" },
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

// Tipos para API do IBGE
interface IBGECity {
  id: number;
  nome: string;
}

interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

// Tipos para Country State City API (países estrangeiros)
interface CountryStateCityState {
  id: number;
  name: string;
  iso2: string;
}

interface CountryStateCityCity {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
}

// Dados estáticos para principais países (fallback quando API não está disponível)
const ESTADOS_PAISES_ESTATICOS: Record<
  string,
  { value: string; label: string }[]
> = {
  AR: [
    // Argentina
    { value: "buenos_aires", label: "Buenos Aires" },
    { value: "catamarca", label: "Catamarca" },
    { value: "chaco", label: "Chaco" },
    { value: "chubut", label: "Chubut" },
    { value: "cordoba", label: "Córdoba" },
    { value: "corrientes", label: "Corrientes" },
    { value: "entre_rios", label: "Entre Ríos" },
    { value: "formosa", label: "Formosa" },
    { value: "jujuy", label: "Jujuy" },
    { value: "la_pampa", label: "La Pampa" },
    { value: "la_rioja", label: "La Rioja" },
    { value: "mendoza", label: "Mendoza" },
    { value: "misiones", label: "Misiones" },
    { value: "neuquen", label: "Neuquén" },
    { value: "rio_negro", label: "Río Negro" },
    { value: "salta", label: "Salta" },
    { value: "san_juan", label: "San Juan" },
    { value: "san_luis", label: "San Luis" },
    { value: "santa_cruz", label: "Santa Cruz" },
    { value: "santa_fe", label: "Santa Fe" },
    { value: "santiago_del_estero", label: "Santiago del Estero" },
    { value: "tierra_del_fuego", label: "Tierra del Fuego" },
    { value: "tucuman", label: "Tucumán" },
  ],
  US: [
    // Estados Unidos
    { value: "alabama", label: "Alabama" },
    { value: "alaska", label: "Alaska" },
    { value: "arizona", label: "Arizona" },
    { value: "arkansas", label: "Arkansas" },
    { value: "california", label: "California" },
    { value: "colorado", label: "Colorado" },
    { value: "connecticut", label: "Connecticut" },
    { value: "delaware", label: "Delaware" },
    { value: "florida", label: "Florida" },
    { value: "georgia", label: "Georgia" },
    { value: "hawaii", label: "Hawaii" },
    { value: "idaho", label: "Idaho" },
    { value: "illinois", label: "Illinois" },
    { value: "indiana", label: "Indiana" },
    { value: "iowa", label: "Iowa" },
    { value: "kansas", label: "Kansas" },
    { value: "kentucky", label: "Kentucky" },
    { value: "louisiana", label: "Louisiana" },
    { value: "maine", label: "Maine" },
    { value: "maryland", label: "Maryland" },
    { value: "massachusetts", label: "Massachusetts" },
    { value: "michigan", label: "Michigan" },
    { value: "minnesota", label: "Minnesota" },
    { value: "mississippi", label: "Mississippi" },
    { value: "missouri", label: "Missouri" },
    { value: "montana", label: "Montana" },
    { value: "nebraska", label: "Nebraska" },
    { value: "nevada", label: "Nevada" },
    { value: "new_hampshire", label: "New Hampshire" },
    { value: "new_jersey", label: "New Jersey" },
    { value: "new_mexico", label: "New Mexico" },
    { value: "new_york", label: "New York" },
    { value: "north_carolina", label: "North Carolina" },
    { value: "north_dakota", label: "North Dakota" },
    { value: "ohio", label: "Ohio" },
    { value: "oklahoma", label: "Oklahoma" },
    { value: "oregon", label: "Oregon" },
    { value: "pennsylvania", label: "Pennsylvania" },
    { value: "rhode_island", label: "Rhode Island" },
    { value: "south_carolina", label: "South Carolina" },
    { value: "south_dakota", label: "South Dakota" },
    { value: "tennessee", label: "Tennessee" },
    { value: "texas", label: "Texas" },
    { value: "utah", label: "Utah" },
    { value: "vermont", label: "Vermont" },
    { value: "virginia", label: "Virginia" },
    { value: "washington", label: "Washington" },
    { value: "west_virginia", label: "West Virginia" },
    { value: "wisconsin", label: "Wisconsin" },
    { value: "wyoming", label: "Wyoming" },
  ],
  CA: [
    // Canadá
    { value: "alberta", label: "Alberta" },
    { value: "british_columbia", label: "British Columbia" },
    { value: "manitoba", label: "Manitoba" },
    { value: "new_brunswick", label: "New Brunswick" },
    { value: "newfoundland_and_labrador", label: "Newfoundland and Labrador" },
    { value: "northwest_territories", label: "Northwest Territories" },
    { value: "nova_scotia", label: "Nova Scotia" },
    { value: "nunavut", label: "Nunavut" },
    { value: "ontario", label: "Ontario" },
    { value: "prince_edward_island", label: "Prince Edward Island" },
    { value: "quebec", label: "Quebec" },
    { value: "saskatchewan", label: "Saskatchewan" },
    { value: "yukon", label: "Yukon" },
  ],
  MX: [
    // México
    { value: "aguascalientes", label: "Aguascalientes" },
    { value: "baja_california", label: "Baja California" },
    { value: "baja_california_sur", label: "Baja California Sur" },
    { value: "campeche", label: "Campeche" },
    { value: "chiapas", label: "Chiapas" },
    { value: "chihuahua", label: "Chihuahua" },
    { value: "coahuila", label: "Coahuila" },
    { value: "colima", label: "Colima" },
    { value: "durango", label: "Durango" },
    { value: "guanajuato", label: "Guanajuato" },
    { value: "guerrero", label: "Guerrero" },
    { value: "hidalgo", label: "Hidalgo" },
    { value: "jalisco", label: "Jalisco" },
    { value: "mexico", label: "México" },
    { value: "michoacan", label: "Michoacán" },
    { value: "morelos", label: "Morelos" },
    { value: "nayarit", label: "Nayarit" },
    { value: "nuevo_leon", label: "Nuevo León" },
    { value: "oaxaca", label: "Oaxaca" },
    { value: "puebla", label: "Puebla" },
    { value: "queretaro", label: "Querétaro" },
    { value: "quintana_roo", label: "Quintana Roo" },
    { value: "san_luis_potosi", label: "San Luis Potosí" },
    { value: "sinaloa", label: "Sinaloa" },
    { value: "sonora", label: "Sonora" },
    { value: "tabasco", label: "Tabasco" },
    { value: "tamaulipas", label: "Tamaulipas" },
    { value: "tlaxcala", label: "Tlaxcala" },
    { value: "veracruz", label: "Veracruz" },
    { value: "yucatan", label: "Yucatán" },
    { value: "zacatecas", label: "Zacatecas" },
  ],
};

// Definição das etapas do wizard
const WIZARD_STEPS = [
  {
    id: "basic",
    title: "Dados Básicos",
    description: "Informações essenciais de identificação",
    icon: User,
  },
  {
    id: "nationality",
    title: "Nacionalidade",
    description: "Origem e nacionalidade",
    icon: Globe,
  },
  {
    id: "documents",
    title: "Documentos",
    description: "CPF, RG, CNS e Passaporte",
    icon: FileText,
  },
  {
    id: "address",
    title: "Endereço",
    description: "Localização e residência",
    icon: MapPin,
  },
  {
    id: "contacts",
    title: "Contatos",
    description: "Email, telefone e emergência",
    icon: Phone,
  },
];

// Schema de validação simplificado
const profileSchema = z.object({
  socialName: z.string().optional().or(z.literal("")),
  motherName: z.string().optional().or(z.literal("")),
  motherUnknown: z.boolean().optional(),
  sex: z.enum(["male", "female"]),
  gender: z
    .enum(["cisgender", "transgenero", "nao_binario", "outro", "nao_informado"])
    .optional(),
  birthDate: z.string().optional().or(z.literal("")),
  raceColor: z
    .enum(["branca", "preta", "parda", "amarela", "indigena", "sem_informacao"])
    .optional(),
  nationality: z.string().optional().or(z.literal("")),
  birthCountry: z.string().optional().or(z.literal("")),
  birthCity: z.string().optional().or(z.literal("")),
  birthState: z.string().optional().or(z.literal("")),
  naturalizationDate: z.string().optional().or(z.literal("")),
  passportNumber: z.string().optional().or(z.literal("")),
  passportCountry: z.string().optional().or(z.literal("")),
  passportIssueDate: z.string().optional().or(z.literal("")),
  passportExpiryDate: z.string().optional().or(z.literal("")),
  zipCode: z.string().optional().or(z.literal("")),
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
  addressName: z.string().optional().or(z.literal("")),
  addressNumber: z.string().optional().or(z.literal("")),
  addressComplement: z.string().optional().or(z.literal("")),
  addressNeighborhood: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  cpf: z.string().optional().or(z.literal("")),
  rgNumber: z.string().optional().or(z.literal("")),
  rgComplement: z.string().optional().or(z.literal("")),
  rgState: z.string().optional().or(z.literal("")),
  rgIssuer: z.string().optional().or(z.literal("")),
  rgIssueDate: z.string().optional().or(z.literal("")),
  cnsNumber: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal("")),
  emergencyPhone: z.string().optional().or(z.literal("")),
  guardianName: z.string().optional().or(z.literal("")),
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
  guardianCpf: z.string().optional().or(z.literal("")),
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
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

// Funções utilitárias para formatação
const formatPhone = (phone: string | null | undefined) => {
  if (!phone) return "Não informado";
  const numbers = phone.replace(/\D/g, "");
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  return phone;
};

const formatCPF = (cpf: string | null | undefined) => {
  if (!cpf) return "Não informado";
  const numbers = cpf.replace(/\D/g, "");
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  }
  return cpf;
};

const formatCEP = (cep: string | null | undefined) => {
  if (!cep) return "Não informado";
  const numbers = cep.replace(/\D/g, "");
  if (numbers.length === 8) {
    return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
  }
  return cep;
};

const formatDate = (date: Date | null | string | undefined) => {
  if (!date) return "Não informado";
  return dayjs(date).format("DD/MM/YYYY");
};

const getGenderLabel = (gender: string | null | undefined) => {
  const genderMap: Record<string, string> = {
    cisgender: "Cisgênero",
    transgenero: "Transgênero",
    nao_binario: "Não binário",
    outro: "Outro",
    nao_informado: "Não informado",
  };
  return genderMap[gender || ""] || "Não informado";
};

const getRaceColorLabel = (raceColor: string | null | undefined) => {
  const raceMap: Record<string, string> = {
    branca: "Branca",
    preta: "Preta",
    parda: "Parda",
    amarela: "Amarela",
    indigena: "Indígena",
    sem_informacao: "Sem informação",
  };
  return raceMap[raceColor || ""] || "Não informado";
};

const getRelationshipLabel = (relationship: string | null | undefined) => {
  const relationshipMap: Record<string, string> = {
    pai: "Pai",
    mae: "Mãe",
    avo: "Avô",
    avo_feminino: "Avó",
    tio: "Tio",
    tia: "Tia",
    irmao: "Irmão",
    irma: "Irmã",
    tutor: "Tutor Legal",
    curador: "Curador",
    responsavel_legal: "Responsável Legal",
    outro: "Outro",
  };
  return relationshipMap[relationship || ""] || "Não informado";
};

const getCountryLabel = (countryCode: string | null | undefined) => {
  const country = PAISES.find((p) => p.value === countryCode);
  return country ? country.label : countryCode || "Não informado";
};

const getStateLabel = (stateCode: string | null | undefined) => {
  const state = ESTADOS_BRASILEIROS.find((s) => s.value === stateCode);
  return state ? state.label : stateCode || "Não informado";
};

const getAddressTypeLabel = (addressType: string | null | undefined) => {
  const typeMap: Record<string, string> = {
    rua: "Rua",
    avenida: "Avenida",
    travessa: "Travessa",
    alameda: "Alameda",
    praca: "Praça",
    estrada: "Estrada",
    rodovia: "Rodovia",
    outro: "Outro",
  };
  return typeMap[addressType || ""] || "Não informado";
};

// Função para converter nomes de países para códigos ISO
const convertCountryNameToCode = (countryName: string | null | undefined) => {
  if (!countryName) return "BR";

  // Mapeamento de nomes para códigos ISO
  const countryMapping: { [key: string]: string } = {
    Brasil: "BR",
    Argentina: "AR",
    "Estados Unidos": "US",
    "Estados Unidos da América": "US",
    Canada: "CA",
    Canadá: "CA",
    México: "MX",
    Chile: "CL",
    Peru: "PE",
    Uruguai: "UY",
    Paraguai: "PY",
    Bolivia: "BO",
    Bolívia: "BO",
    Colombia: "CO",
    Colômbia: "CO",
    Venezuela: "VE",
    Equador: "EC",
  };

  // Se já é um código ISO (2 caracteres), retornar como está
  if (countryName.length === 2) {
    return countryName.toUpperCase();
  }

  // Tentar encontrar o mapeamento
  return countryMapping[countryName] || countryName;
};

export function PatientProfileForm({ patientData }: PatientProfileFormProps) {
  // Estados para controlar o modo (visualização/edição)
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [actionExecuted, setActionExecuted] = useState(false);

  // Estados para gerenciar cidades da API do IBGE
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Estados para gerenciar dados de países estrangeiros
  const [foreignStates, setForeignStates] = useState<CountryStateCityState[]>(
    [],
  );
  const [foreignCities, setForeignCities] = useState<CountryStateCityCity[]>(
    [],
  );
  const [loadingForeignStates, setLoadingForeignStates] = useState(false);
  const [loadingForeignCities, setLoadingForeignCities] = useState(false);

  // Configuração do form
  const defaultFormValues = {
    socialName: patientData.socialName || "",
    motherName: patientData.motherName || "",
    motherUnknown: patientData.motherUnknown || false,
    sex: patientData.sex,
    gender:
      (patientData.gender as
        | "cisgender"
        | "transgenero"
        | "nao_binario"
        | "outro"
        | "nao_informado") || undefined,
    birthDate: patientData.birthDate
      ? dayjs(patientData.birthDate).format("YYYY-MM-DD")
      : "",
    raceColor:
      (patientData.raceColor as
        | "branca"
        | "preta"
        | "parda"
        | "amarela"
        | "indigena"
        | "sem_informacao") || undefined,
    nationality: patientData.nationality || "",
    birthCountry: convertCountryNameToCode(patientData.birthCountry),
    birthCity: patientData.birthCity || "",
    birthState: patientData.birthState || "",
    naturalizationDate: patientData.naturalizationDate
      ? dayjs(patientData.naturalizationDate).format("YYYY-MM-DD")
      : "",
    passportNumber: patientData.passportNumber || "",
    passportCountry: patientData.passportCountry || "",
    passportIssueDate: patientData.passportIssueDate
      ? dayjs(patientData.passportIssueDate).format("YYYY-MM-DD")
      : "",
    passportExpiryDate: patientData.passportExpiryDate
      ? dayjs(patientData.passportExpiryDate).format("YYYY-MM-DD")
      : "",
    zipCode: patientData.zipCode || "",
    addressType:
      (patientData.addressType as
        | "rua"
        | "avenida"
        | "travessa"
        | "alameda"
        | "praca"
        | "estrada"
        | "rodovia"
        | "outro") || undefined,
    addressName: patientData.addressName || "",
    addressNumber: patientData.addressNumber || "",
    addressComplement: patientData.addressComplement || "",
    addressNeighborhood: patientData.addressNeighborhood || "",
    city: patientData.city || "",
    state: patientData.state || "",
    country: convertCountryNameToCode(patientData.country),
    cpf: patientData.cpf || "",
    rgNumber: patientData.rgNumber || "",
    rgComplement: patientData.rgComplement || "",
    rgState: patientData.rgState || "",
    rgIssuer: patientData.rgIssuer || "",
    rgIssueDate: patientData.rgIssueDate
      ? dayjs(patientData.rgIssueDate).format("YYYY-MM-DD")
      : "",
    cnsNumber: patientData.cnsNumber || "",
    emergencyContact: patientData.emergencyContact || "",
    emergencyPhone: patientData.emergencyPhone || "",
    guardianName: patientData.guardianName || "",
    guardianRelationship:
      (patientData.guardianRelationship as
        | "pai"
        | "mae"
        | "avo"
        | "avo_feminino"
        | "tio"
        | "tia"
        | "irmao"
        | "irma"
        | "tutor"
        | "curador"
        | "responsavel_legal"
        | "outro") || undefined,
    guardianCpf: patientData.guardianCpf || "",
    email: patientData.email || "",
    phone: patientData.phone || "",
  };

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur", // Validar quando sair do campo
    defaultValues: defaultFormValues,
  });

  // Server action
  const { execute, result, isExecuting } = useAction(updatePatientProfile);

  // Monitorar resultado da Server Action
  useEffect(() => {
    // Só processar se uma ação foi executada e há um resultado válido
    if (
      actionExecuted &&
      result &&
      !isExecuting &&
      (result.data || result.serverError || result.validationErrors)
    ) {
      if (result?.data?.success === true) {
        toast.success("Perfil atualizado com sucesso!");
        setIsEditMode(false);
        setCurrentStep(0);
        setIsSaving(false);
        setActionExecuted(false); // Reset da flag
        // Recarregar a página para mostrar os dados atualizados
        window.location.reload();
      } else if (result?.data?.error) {
        console.error("❌ Erro da action:", result.data.error);
        toast.error(result.data.error);
        setIsSaving(false);
        setActionExecuted(false); // Reset da flag
      } else if (result?.serverError) {
        console.error("❌ Erro do servidor:", result.serverError);
        toast.error("Erro interno do servidor");
        setIsSaving(false);
        setActionExecuted(false); // Reset da flag
      } else if (result?.validationErrors) {
        console.error("❌ Erros de validação:", result.validationErrors);
        const firstError = Object.values(result.validationErrors)[0];
        toast.error(`Erro de validação: ${firstError}`);
        setIsSaving(false);
        setActionExecuted(false); // Reset da flag
      } else if (result?.data !== undefined) {
        // Só mostrar erro se há dados mas estrutura inesperada
        console.error("❌ Resultado inesperado:", result);
        toast.error("Erro ao atualizar perfil");
        setIsSaving(false);
        setActionExecuted(false); // Reset da flag
      }
    }
  }, [result, isExecuting, actionExecuted]);

  // Função para carregar cidades da API do IBGE
  const loadCitiesByState = async (stateCode: string) => {
    if (!stateCode) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    try {
      // Buscar o ID do estado pela sigla
      const statesResponse = await fetch(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
      );
      const states: IBGEState[] = await statesResponse.json();
      const selectedState = states.find((state) => state.sigla === stateCode);

      if (selectedState) {
        // Buscar cidades do estado
        const citiesResponse = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState.id}/municipios`,
        );
        const citiesData: IBGECity[] = await citiesResponse.json();
        setCities(citiesData.sort((a, b) => a.nome.localeCompare(b.nome)));
      }
    } catch (error) {
      console.error("Erro ao carregar cidades:", error);
      toast.error("Erro ao carregar cidades");
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // Função para carregar estados de países estrangeiros
  const loadStatesByCountry = async (countryCode: string) => {
    if (!countryCode || countryCode === "BR") {
      setForeignStates([]);
      return;
    }

    setLoadingForeignStates(true);

    // Primeiro, tentar usar dados estáticos se disponíveis
    if (ESTADOS_PAISES_ESTATICOS[countryCode]) {
      const staticStates = ESTADOS_PAISES_ESTATICOS[countryCode].map(
        (state) => ({
          id: 0, // ID fictício para dados estáticos
          name: state.label,
          iso2: state.value,
        }),
      );
      setForeignStates(staticStates);
      setLoadingForeignStates(false);
      return;
    }

    // Se não há dados estáticos, verificar se há API key antes de tentar
    const apiKey = process.env.NEXT_PUBLIC_COUNTRY_STATE_CITY_API_KEY;
    if (!apiKey) {
      // Sem API key e sem dados estáticos = fallback silencioso
      setForeignStates([]);
      setLoadingForeignStates(false);
      return;
    }

    // Tentar a API apenas se houver API key
    try {
      const response = await fetch(
        `https://api.countrystatecity.in/v1/countries/${countryCode}/states`,
        {
          headers: {
            "X-CSCAPI-KEY": apiKey,
          },
        },
      );

      if (response.ok) {
        const statesData: CountryStateCityState[] = await response.json();
        setForeignStates(
          statesData.sort((a, b) => a.name.localeCompare(b.name)),
        );
      } else {
        // Fallback silencioso
        setForeignStates([]);
      }
    } catch (error) {
      // Fallback silencioso - não logar erro para evitar poluir console
      setForeignStates([]);
    } finally {
      setLoadingForeignStates(false);
    }
  };

  // Função para carregar cidades de países estrangeiros
  const loadForeignCitiesByState = async (
    countryCode: string,
    stateCode: string,
  ) => {
    if (!countryCode || !stateCode || countryCode === "BR") {
      setForeignCities([]);
      return;
    }

    // Verificar se há API key antes de tentar
    const apiKey = process.env.NEXT_PUBLIC_COUNTRY_STATE_CITY_API_KEY;
    if (!apiKey) {
      // Sem API key = fallback silencioso
      setForeignCities([]);
      return;
    }

    setLoadingForeignCities(true);
    try {
      const response = await fetch(
        `https://api.countrystatecity.in/v1/countries/${countryCode}/states/${stateCode}/cities`,
        {
          headers: {
            "X-CSCAPI-KEY": apiKey,
          },
        },
      );

      if (response.ok) {
        const citiesData: CountryStateCityCity[] = await response.json();
        setForeignCities(
          citiesData.sort((a, b) => a.name.localeCompare(b.name)),
        );
      } else {
        // Fallback silencioso
        setForeignCities([]);
      }
    } catch (error) {
      // Fallback silencioso - não logar erro para evitar poluir console
      setForeignCities([]);
    } finally {
      setLoadingForeignCities(false);
    }
  };

  // Carregar cidades quando o estado de nascimento mudar
  useEffect(() => {
    const birthState = form.watch("birthState");
    const birthCountry = form.watch("birthCountry");

    if (birthCountry === "BR" && birthState) {
      loadCitiesByState(birthState);
    } else {
      setCities([]);
    }
  }, [form.watch("birthState"), form.watch("birthCountry")]);

  // Carregar estados quando o país mudar (para países estrangeiros)
  useEffect(() => {
    const birthCountry = form.watch("birthCountry");

    if (birthCountry && birthCountry !== "BR") {
      loadStatesByCountry(birthCountry);
      // Limpar cidade quando país mudar
      form.setValue("birthCity", "");
    } else {
      setForeignStates([]);
      setForeignCities([]);
    }
  }, [form.watch("birthCountry")]);

  // Carregar cidades de países estrangeiros quando estado mudar
  useEffect(() => {
    const birthCountry = form.watch("birthCountry");
    const birthState = form.watch("birthState");

    if (birthCountry && birthCountry !== "BR" && birthState) {
      loadForeignCitiesByState(birthCountry, birthState);
    } else if (birthCountry !== "BR") {
      setForeignCities([]);
    }
  }, [form.watch("birthState"), form.watch("birthCountry")]);

  // Carregar dados iniciais quando entrar no modo de edição
  useEffect(() => {
    if (isEditMode) {
      const birthCountry = form.getValues("birthCountry");
      const birthState = form.getValues("birthState");
      const birthCity = form.getValues("birthCity");

      // Carregar estados se for país estrangeiro
      if (birthCountry && birthCountry !== "BR") {
        loadStatesByCountry(birthCountry);
      }

      // Carregar cidades se for Brasil e tem estado
      if (birthCountry === "BR" && birthState) {
        loadCitiesByState(birthState);
      }

      // Carregar cidades se for país estrangeiro e tem estado
      if (birthCountry && birthCountry !== "BR" && birthState) {
        loadForeignCitiesByState(birthCountry, birthState);
      }

      // CORREÇÃO: Forçar reset dos valores para garantir que estão corretos
      form.reset(defaultFormValues);
    }
  }, [isEditMode]);

  // Monitorar quando foreignStates mudarem
  useEffect(() => {
    if (foreignStates.length > 0) {
      const birthState = form.getValues("birthState");
      const motherName = form.getValues("motherName");
      const foundState = foreignStates.find(
        (state) => state.iso2 === birthState,
      );

      // CORREÇÃO: Forçar o valor correto se há discrepância
      if (foundState && birthState !== motherName) {
        form.setValue("birthState", birthState, { shouldValidate: true });
      }
    }
  }, [foreignStates]);

  // Funções de navegação
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

  // Função para finalizar edição
  const handleFinish = async () => {
    setIsSaving(true);
    try {
      // Validar campos críticos manualmente primeiro
      const formData = form.getValues();

      // Verificar campos obrigatórios manualmente
      if (!formData.email || formData.email.trim() === "") {
        toast.error("Email é obrigatório");
        setIsSaving(false);
        return;
      }

      if (!formData.phone || formData.phone.trim() === "") {
        toast.error("Telefone é obrigatório");
        setIsSaving(false);
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Email inválido");
        setIsSaving(false);
        return;
      }

      const payload = {
        patientId: patientData.id,
        name: patientData.name, // Nome é obrigatório na action (não editável)
        ...formData,
        // As datas são enviadas como strings para a action
        birthDate: formData.birthDate || undefined,
        naturalizationDate: formData.naturalizationDate || undefined,
        passportIssueDate: formData.passportIssueDate || undefined,
        passportExpiryDate: formData.passportExpiryDate || undefined,
        rgIssueDate: formData.rgIssueDate || undefined,
      };

      setActionExecuted(true); // Marcar que uma ação foi executada
      await execute(payload);
      // O resultado será tratado pelo useEffect
    } catch (error) {
      console.error("💥 Erro ao finalizar:", error);
      toast.error("Erro ao salvar alterações");
      setIsSaving(false);
      setActionExecuted(false); // Reset da flag em caso de erro
    }
  };

  // MODO VISUALIZAÇÃO - Componentes de blocos informativos
  const ViewModeHeader = () => (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Eye className="h-6 w-6 text-blue-600" />
          Meu Perfil
        </h1>
        <p className="mt-1 text-gray-600">
          Suas informações pessoais e dados de contato
        </p>
      </div>
      <Button
        onClick={() => setIsEditMode(true)}
        className="flex items-center gap-2"
      >
        <Edit3 className="h-4 w-4" />
        Editar Perfil
      </Button>
    </div>
  );

  const BasicDataBlock = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Dados Básicos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Nome Completo</p>
            <p className="text-gray-900">{patientData.name}</p>
          </div>

          {patientData.socialName && (
            <div>
              <p className="text-sm font-medium text-gray-500">Nome Social</p>
              <p className="text-gray-900">{patientData.socialName}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500">Nome da Mãe</p>
            <p className="text-gray-900">
              {patientData.motherUnknown
                ? "Mãe desconhecida"
                : patientData.motherName || "Não informado"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Sexo</p>
            <p className="text-gray-900">
              {patientData.sex === "male" ? "Masculino" : "Feminino"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Gênero</p>
            <p className="text-gray-900">
              {getGenderLabel(patientData.gender)}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Data de Nascimento
            </p>
            <p className="text-gray-900">{formatDate(patientData.birthDate)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Raça/Cor</p>
            <p className="text-gray-900">
              {getRaceColorLabel(patientData.raceColor)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const NationalityBlock = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-green-600" />
          Nacionalidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Nacionalidade</p>
            <p className="text-gray-900">
              {patientData.nationality || "Brasileira"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              País de Nascimento
            </p>
            <p className="text-gray-900">
              {getCountryLabel(patientData.birthCountry)}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Cidade de Nascimento
            </p>
            <p className="text-gray-900">
              {patientData.birthCity || "Não informado"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Estado de Nascimento
            </p>
            <p className="text-gray-900">
              {getStateLabel(patientData.birthState)}
            </p>
          </div>

          {patientData.naturalizationDate && (
            <div>
              <p className="text-sm font-medium text-gray-500">
                Data de Naturalização
              </p>
              <p className="text-gray-900">
                {formatDate(patientData.naturalizationDate)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const DocumentsBlock = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IdCard className="h-5 w-5 text-orange-600" />
          Documentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">CPF</p>
            <p className="text-gray-900">{formatCPF(patientData.cpf)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">CNS</p>
            <p className="text-gray-900">
              {patientData.cnsNumber || "Não informado"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">RG</p>
            <p className="text-gray-900">
              {patientData.rgNumber || "Não informado"}
            </p>
          </div>

          {patientData.rgIssuer && (
            <div>
              <p className="text-sm font-medium text-gray-500">
                Órgão Emissor RG
              </p>
              <p className="text-gray-900">{patientData.rgIssuer}</p>
            </div>
          )}

          {patientData.rgIssueDate && (
            <div>
              <p className="text-sm font-medium text-gray-500">
                Data de Emissão RG
              </p>
              <p className="text-gray-900">
                {formatDate(patientData.rgIssueDate)}
              </p>
            </div>
          )}

          {patientData.passportNumber && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-500">Passaporte</p>
                <p className="text-gray-900">{patientData.passportNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  País do Passaporte
                </p>
                <p className="text-gray-900">
                  {patientData.passportCountry || "Não informado"}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const AddressBlock = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5 text-purple-600" />
          Endereço
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">CEP</p>
            <p className="text-gray-900">{formatCEP(patientData.zipCode)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Logradouro</p>
            <p className="text-gray-900">
              {patientData.addressType && patientData.addressName
                ? `${getAddressTypeLabel(patientData.addressType)} ${patientData.addressName}`
                : "Não informado"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Número</p>
            <p className="text-gray-900">
              {patientData.addressNumber || "Não informado"}
            </p>
          </div>

          {patientData.addressComplement && (
            <div>
              <p className="text-sm font-medium text-gray-500">Complemento</p>
              <p className="text-gray-900">{patientData.addressComplement}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-500">Bairro</p>
            <p className="text-gray-900">
              {patientData.addressNeighborhood || "Não informado"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Cidade</p>
            <p className="text-gray-900">
              {patientData.city || "Não informado"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Estado</p>
            <p className="text-gray-900">{getStateLabel(patientData.state)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">País</p>
            <p className="text-gray-900">
              {getCountryLabel(patientData.country)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ContactsBlock = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-indigo-600" />
          Contatos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Email Principal</p>
            <p className="text-gray-900">{patientData.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Telefone</p>
            <p className="text-gray-900">{formatPhone(patientData.phone)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Contato de Emergência
            </p>
            <p className="text-gray-900">
              {patientData.emergencyContact || "Não informado"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Telefone de Emergência
            </p>
            <p className="text-gray-900">
              {formatPhone(patientData.emergencyPhone)}
            </p>
          </div>

          {patientData.guardianName && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Guardião/Responsável
                </p>
                <p className="text-gray-900">{patientData.guardianName}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Parentesco</p>
                <p className="text-gray-900">
                  {getRelationshipLabel(patientData.guardianRelationship)}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  CPF do Guardião
                </p>
                <p className="text-gray-900">
                  {formatCPF(patientData.guardianCpf)}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // MODO EDIÇÃO - Componentes do Wizard
  const EditModeHeader = () => (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Edit3 className="h-6 w-6 text-blue-600" />
          Editando Perfil
        </h1>
        <p className="mt-1 text-gray-600">Atualize suas informações pessoais</p>
      </div>
      <Button
        variant="outline"
        onClick={() => {
          setIsEditMode(false);
          setCurrentStep(0);
          form.reset();
        }}
      >
        Cancelar
      </Button>
    </div>
  );

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

  // Renderização das etapas do wizard (versão básica)
  const renderBasicStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Dados Básicos
        </CardTitle>
        <p className="text-sm text-gray-600">
          Informações essenciais de identificação
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="socialName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Social (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nome social" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                    placeholder="Nome completo da mãe"
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cisgender">Cisgênero</SelectItem>
                    <SelectItem value="transgenero">Transgênero</SelectItem>
                    <SelectItem value="nao_binario">Não binário</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                    <SelectItem value="nao_informado">Não informado</SelectItem>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a raça/cor" />
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
                  <Input {...field} type="email" placeholder="seu@email.com" />
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

  // Renderizar etapa de Nacionalidade
  const renderNationalityStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-green-600" />
          Nacionalidade
        </CardTitle>
        <p className="text-sm text-gray-600">
          Informações sobre nacionalidade e local de nascimento
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nacionalidade</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: Brasileira" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País de Nascimento</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Auto-completar nacionalidade baseada no país
                    const selectedCountry = PAISES.find(
                      (p) => p.value === value,
                    );
                    if (selectedCountry) {
                      if (value === "BR") {
                        form.setValue("nationality", "Brasileira");
                      } else {
                        form.setValue(
                          "nationality",
                          selectedCountry.label.replace("Brasil", "Brasileira"),
                        );
                      }
                    }
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
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="birthState"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    {form.watch("birthCountry") === "BR"
                      ? "Estado de Nascimento"
                      : "Estado/Província de Nascimento"}
                  </FormLabel>
                  {form.watch("birthCountry") === "BR" ? (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Limpar cidade quando estado mudar
                        form.setValue("birthCity", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ESTADOS_BRASILEIROS.map((estado) => (
                          <SelectItem key={estado.value} value={estado.value}>
                            {estado.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : // Select para estados de países estrangeiros
                  foreignStates.length > 0 ? (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Limpar cidade quando estado mudar
                        form.setValue("birthCity", "");
                      }}
                      value={form.getValues("birthState")}
                      disabled={
                        !form.watch("birthCountry") || loadingForeignStates
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !form.watch("birthCountry")
                                ? "Primeiro selecione o país"
                                : loadingForeignStates
                                  ? "Carregando estados..."
                                  : "Selecione o estado/província"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {foreignStates.map((state) => (
                          <SelectItem key={state.iso2} value={state.iso2}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    // Input livre quando não há dados disponíveis
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Digite o estado/província"
                        disabled={loadingForeignStates}
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="birthCity"
            render={({ field }) => {
              const currentCityValue = form.getValues("birthCity");

              return (
                <FormItem>
                  <FormLabel>Cidade de Nascimento</FormLabel>
                  {form.watch("birthCountry") === "BR" ? (
                    // Brasil: usar select se há cidades, senão input livre
                    cities.length > 0 ? (
                      <Select
                        onValueChange={field.onChange}
                        value={currentCityValue || field.value}
                        disabled={!form.watch("birthState") || loadingCities}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                !form.watch("birthState")
                                  ? "Primeiro selecione o estado"
                                  : loadingCities
                                    ? "Carregando cidades..."
                                    : "Selecione a cidade"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.nome}>
                              {city.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <FormControl>
                        <Input
                          {...field}
                          value={currentCityValue || field.value}
                          onChange={field.onChange}
                          placeholder={
                            !form.watch("birthState")
                              ? "Primeiro selecione o estado"
                              : loadingCities
                                ? "Carregando cidades..."
                                : "Digite a cidade"
                          }
                          disabled={!form.watch("birthState") || loadingCities}
                        />
                      </FormControl>
                    )
                  ) : // Países estrangeiros: usar select se há cidades, senão input livre
                  foreignCities.length > 0 ? (
                    <Select
                      onValueChange={field.onChange}
                      value={currentCityValue || field.value}
                      disabled={
                        !form.watch("birthState") || loadingForeignCities
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !form.watch("birthState")
                                ? "Primeiro selecione o estado"
                                : loadingForeignCities
                                  ? "Carregando cidades..."
                                  : "Selecione a cidade"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {foreignCities.map((city) => (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    // Input livre quando não há cidades disponíveis
                    <FormControl>
                      <Input
                        {...field}
                        value={currentCityValue || field.value}
                        onChange={field.onChange}
                        placeholder={
                          !form.watch("birthState")
                            ? "Primeiro selecione o estado"
                            : loadingForeignCities
                              ? "Carregando cidades..."
                              : "Digite a cidade"
                        }
                        disabled={
                          !form.watch("birthState") || loadingForeignCities
                        }
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {form.watch("birthCountry") && form.watch("birthCountry") !== "BR" && (
          <FormField
            control={form.control}
            name="naturalizationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Naturalização (se aplicável)</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {form.watch("birthCountry") && form.watch("birthCountry") !== "BR" && (
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900">
              Documentos para Estrangeiros
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="passportNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Passaporte</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: AB1234567" />
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
                    <FormLabel>País do Passaporte</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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

  // Renderizar etapa de Documentos
  const renderDocumentsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IdCard className="h-5 w-5 text-orange-600" />
          Documentos
        </CardTitle>
        <p className="text-sm text-gray-600">
          Informações sobre documentos pessoais
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-green-50 p-4">
          <h4 className="mb-2 font-medium text-green-900">
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
                      placeholder="000.000.000-00"
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
                  <FormLabel>CNS (Cartão Nacional de Saúde)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 4567 8901 2345" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="rgNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RG</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="12.345.678-9" />
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
                  <FormLabel>Complemento RG</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="X" />
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
                  <FormLabel>UF do RG</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="SP" />
                  </FormControl>
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
                    <Input {...field} placeholder="SSP" />
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
      </CardContent>
    </Card>
  );

  // Renderizar etapa de Endereço
  const renderAddressStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-purple-600" />
          Endereço
        </CardTitle>
        <p className="text-sm text-gray-600">
          Informações de endereço completo
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
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
                  placeholder="00000-000"
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="addressType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Logradouro</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
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

          <FormField
            control={form.control}
            name="addressName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Logradouro</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: das Flores" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  <Input {...field} placeholder="Apto 45" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="addressNeighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Centro" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="São Paulo" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ESTADOS_BRASILEIROS.map((estado) => (
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
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
        </div>
      </CardContent>
    </Card>
  );

  // Renderizar etapa de Contatos
  const renderContactsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-red-600" />
          Contatos
        </CardTitle>
        <p className="text-sm text-gray-600">
          Informações de contato e emergência
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-red-50 p-4">
          <h4 className="mb-2 font-medium text-red-900">
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
                    <Input {...field} placeholder="Nome completo" />
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
                  <FormLabel>Telefone de Emergência</FormLabel>
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

        <div className="rounded-lg bg-yellow-50 p-4">
          <h4 className="mb-2 font-medium text-yellow-900">
            Guardião/Representante Legal
          </h4>
          <p className="mb-4 text-sm text-yellow-700">
            Obrigatório para menores de 16 anos
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="guardianName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Guardião</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome completo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guardianRelationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parentesco</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o parentesco" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pai">Pai</SelectItem>
                      <SelectItem value="mae">Mãe</SelectItem>
                      <SelectItem value="avo">Avô</SelectItem>
                      <SelectItem value="avo_feminino">Avó</SelectItem>
                      <SelectItem value="tio">Tio</SelectItem>
                      <SelectItem value="tia">Tia</SelectItem>
                      <SelectItem value="irmao">Irmão</SelectItem>
                      <SelectItem value="irma">Irmã</SelectItem>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="curador">Curador</SelectItem>
                      <SelectItem value="responsavel_legal">
                        Responsável Legal
                      </SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="guardianCpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF do Guardião</FormLabel>
                <FormControl>
                  <PatternFormat
                    format="###.###.###-##"
                    mask="_"
                    customInput={Input}
                    placeholder="000.000.000-00"
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

  // Render da etapa atual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicStep();
      case 1:
        return renderNationalityStep();
      case 2:
        return renderDocumentsStep();
      case 3:
        return renderAddressStep();
      case 4:
        return renderContactsStep();
      default:
        return renderBasicStep();
    }
  };

  // RENDERIZAÇÃO PRINCIPAL
  if (!isEditMode) {
    // MODO VISUALIZAÇÃO
    return (
      <div className="space-y-6">
        <ViewModeHeader />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BasicDataBlock />
          <NationalityBlock />
          <DocumentsBlock />
          <AddressBlock />
          <div className="lg:col-span-2">
            <ContactsBlock />
          </div>
        </div>
      </div>
    );
  }

  // MODO EDIÇÃO (WIZARD)
  return (
    <Form {...form}>
      <div className="space-y-6">
        <EditModeHeader />

        <div className="mx-auto max-w-4xl space-y-6">
          <ProgressIndicator />
          {renderCurrentStep()}

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
              {isSaving && (
                <Badge variant="outline" className="text-blue-600">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Salvando...
                </Badge>
              )}
            </div>

            <Button
              type="button"
              onClick={() => {
                if (currentStep === WIZARD_STEPS.length - 1) {
                  handleFinish();
                } else {
                  nextStep();
                }
              }}
              disabled={isSaving || isExecuting}
              className="flex items-center gap-2"
            >
              {currentStep === WIZARD_STEPS.length - 1 ? (
                <>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {isSaving || isExecuting ? "Finalizando..." : "Finalizar"}
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
      </div>
    </Form>
  );
}
