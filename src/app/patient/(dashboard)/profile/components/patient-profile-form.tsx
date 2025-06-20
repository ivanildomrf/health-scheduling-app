"use client";

import { updatePatientProfile } from "@/actions/update-patient-profile";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useCallback, useEffect, useState } from "react";
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

export function PatientProfileForm({ patientData }: PatientProfileFormProps) {
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

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
      gender: (patientData.gender as any) || "nao_informado",
      birthDate: patientData.birthDate
        ? patientData.birthDate.toISOString().split("T")[0]
        : "",
      raceColor: (patientData.raceColor as any) || "sem_informacao",
      nationality: patientData.nationality || "brasileira",
      birthCountry: patientData.birthCountry || "BR",
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
      addressType: (patientData.addressType as any) || "rua",
      addressName: patientData.addressName || "",
      addressNumber: patientData.addressNumber || "",
      addressComplement: patientData.addressComplement || "",
      addressNeighborhood: patientData.addressNeighborhood || "",
      city: patientData.city || "",
      state: patientData.state || "",
      country: patientData.country || "Brasil",
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
      guardianRelationship: (patientData.guardianRelationship as any) || "",
      guardianCpf: patientData.guardianCpf || "",
      emergencyContact: patientData.emergencyContact || "",
      emergencyPhone: patientData.emergencyPhone || "",
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

  const updateProfileAction = useAction(updatePatientProfile, {
    onSuccess: (result) => {
      if (result?.data?.success) {
        toast.success("Perfil atualizado com sucesso!");
      } else if (result?.data?.error) {
        toast.error(result.data.error);
      }
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil");
    },
  });

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

  // Função para determinar nacionalidade baseada no país de nascimento
  const determinarNacionalidade = useCallback((paisCodigo: string) => {
    const nacionalidades: Record<string, string> = {
      BR: "brasileira",
      AR: "argentina",
      BO: "boliviana",
      CL: "chilena",
      CO: "colombiana",
      EC: "equatoriana",
      GF: "francesa",
      GY: "guianense",
      PY: "paraguaia",
      PE: "peruana",
      SR: "surinamesa",
      UY: "uruguaia",
      VE: "venezuelana",
      US: "americana",
      CA: "canadense",
      MX: "mexicana",
      PT: "portuguesa",
      ES: "espanhola",
      IT: "italiana",
      FR: "francesa",
      DE: "alemã",
      JP: "japonesa",
      CN: "chinesa",
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

  const onSubmit = (values: ProfileFormData) => {
    updateProfileAction.execute({
      patientId: patientData.id,
      ...values,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Seção 1: Dados Básicos de Identificação */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Básicos de Identificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={updateProfileAction.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        disabled={updateProfileAction.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        disabled={
                          updateProfileAction.isPending ||
                          form.watch("motherUnknown")
                        }
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
                        disabled={updateProfileAction.isPending}
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
                      disabled={updateProfileAction.isPending}
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
                      disabled={updateProfileAction.isPending}
                    >
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
                      <Input
                        {...field}
                        type="date"
                        disabled={updateProfileAction.isPending}
                      />
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
                      disabled={updateProfileAction.isPending}
                    >
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
          </CardContent>
        </Card>

        {/* Seção 2: Dados de Nacionalidade */}
        <Card>
          <CardHeader>
            <CardTitle>Dados de Nacionalidade</CardTitle>
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
                        // Atualizar nacionalidade automaticamente
                        const nacionalidade = determinarNacionalidade(value);
                        form.setValue("nationality", nacionalidade);
                      }}
                      value={field.value}
                      disabled={updateProfileAction.isPending}
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
                        disabled={true}
                        placeholder="Determinada automaticamente"
                        className="bg-gray-50"
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
                          <Input
                            {...field}
                            disabled={updateProfileAction.isPending}
                          />
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
                          <Input
                            {...field}
                            disabled={updateProfileAction.isPending}
                          />
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
                        <Input
                          {...field}
                          type="date"
                          disabled={updateProfileAction.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Seção 3: Documentos para Estrangeiros */}
        {isEstrangeiro && (
          <Card>
            <CardHeader>
              <CardTitle>Documentos para Estrangeiros</CardTitle>
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
                          disabled={updateProfileAction.isPending}
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
                        disabled={updateProfileAction.isPending}
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
                  name="passportIssueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Emissão</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          disabled={updateProfileAction.isPending}
                        />
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
                        <Input
                          {...field}
                          type="date"
                          disabled={updateProfileAction.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      disabled={updateProfileAction.isPending}
                      autoComplete="email"
                      inputMode="email"
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
                      disabled={updateProfileAction.isPending}
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
                        disabled={updateProfileAction.isPending}
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
                      <Input
                        {...field}
                        disabled={updateProfileAction.isPending}
                      />
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
                      <Input
                        {...field}
                        placeholder="Ex: Rua das Flores"
                        disabled={updateProfileAction.isPending}
                      />
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
                      disabled={updateProfileAction.isPending}
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
                      <Input
                        {...field}
                        placeholder="123"
                        disabled={updateProfileAction.isPending}
                      />
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
                      <Input
                        {...field}
                        placeholder="Apto 45, Bloco B"
                        disabled={updateProfileAction.isPending}
                      />
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
                  <FormLabel>Bairro/Distrito</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={updateProfileAction.isPending}
                    />
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
                    <FormLabel>Unidade Federativa (UF)</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Limpar cidade quando mudar o estado
                        form.setValue("city", "");
                        // Buscar municípios do novo estado
                        buscarMunicipios(value);
                      }}
                      value={field.value}
                      disabled={updateProfileAction.isPending}
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
                      disabled={
                        updateProfileAction.isPending ||
                        loadingMunicipios ||
                        !form.getValues("state")
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !form.getValues("state")
                                ? "Selecione primeiro o estado"
                                : loadingMunicipios
                                  ? "Carregando municípios..."
                                  : "Selecione o município"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {municipios.map((municipio) => (
                          <SelectItem key={municipio.id} value={municipio.nome}>
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

        {/* Seção 6: Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                        disabled={updateProfileAction.isPending}
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
                        disabled={updateProfileAction.isPending}
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

            {/* Campos do RG */}
            <div className="border-t pt-4">
              <h4 className="mb-3 text-sm font-medium text-gray-900">
                Registro de Identidade (RG)
              </h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="rgNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do RG</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={updateProfileAction.isPending}
                        />
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
                        <Input
                          {...field}
                          placeholder="Ex: X"
                          disabled={updateProfileAction.isPending}
                        />
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
                        disabled={updateProfileAction.isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ESTADOS_BRASILEIROS.map((estado) => (
                            <SelectItem key={estado.value} value={estado.value}>
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

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
                          disabled={updateProfileAction.isPending}
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
                        <Input
                          {...field}
                          type="date"
                          disabled={updateProfileAction.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Contato</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={updateProfileAction.isPending}
                      />
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
                        disabled={updateProfileAction.isPending}
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
                        disabled={updateProfileAction.isPending}
                      />
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
                      <FormLabel>Grau de Parentesco/Relacionamento *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={updateProfileAction.isPending}
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
                          disabled={updateProfileAction.isPending}
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
        )}

        {/* Botão de salvar */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateProfileAction.isPending}
            className="min-w-32"
          >
            {updateProfileAction.isPending
              ? "Salvando..."
              : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
