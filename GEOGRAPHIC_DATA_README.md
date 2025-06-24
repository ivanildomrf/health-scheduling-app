# 🌍 Sistema de Dados Geográficos - MendX

## Visão Geral

O sistema de perfil do paciente implementa um sistema híbrido inteligente para carregar dados geográficos (países, estados/províncias e cidades) com múltiplas fontes de dados e fallbacks robustos.

## 🎯 Funcionalidades

### ✅ Dados do Brasil

- **Fonte**: API do IBGE (gratuita, sem necessidade de API key)
- **Cobertura**: Todos os 26 estados + DF e suas respectivas cidades
- **Status**: ✅ Totalmente funcional

### ✅ Países Estrangeiros - Dados Estáticos

- **Argentina**: 23 províncias
- **Estados Unidos**: 50 estados
- **Canadá**: 13 províncias e territórios
- **México**: 32 estados
- **Status**: ✅ Carregamento instantâneo

### 🔧 Países Estrangeiros - API Externa (Opcional)

- **Fonte**: Country State City API
- **Requer**: API Key (variável `NEXT_PUBLIC_COUNTRY_STATE_CITY_API_KEY`)
- **Cobertura**: 190+ países
- **Status**: ⚠️ Opcional (funciona sem API key)

## 🛠️ Como Funciona

### Sistema de Fallback (3 Níveis)

1. **Dados Estáticos** (Prioridade 1)

   - Para países principais (Argentina, EUA, Canadá, México)
   - Carregamento instantâneo
   - Sem dependência externa

2. **API Externa** (Prioridade 2)

   - Para países não cobertos por dados estáticos
   - Requer API key
   - Carregamento dinâmico

3. **Input Livre** (Fallback Final)
   - Quando não há dados estáticos nem API key
   - Permite digitação manual
   - Sempre funcional

### Comportamento por Cenário

| Cenário | Brasil    | Argentina      | Outros Países (com API) | Outros Países (sem API) |
| ------- | --------- | -------------- | ----------------------- | ----------------------- |
| Estados | ✅ Select | ✅ Select      | ✅ Select               | 📝 Input livre          |
| Cidades | ✅ Select | ❌ Input livre | ✅ Select               | 📝 Input livre          |

## 🔧 Configuração da API (Opcional)

### 1. Obter API Key

```
https://countrystatecity.in/
```

### 2. Configurar Variável de Ambiente

```bash
# .env.local
NEXT_PUBLIC_COUNTRY_STATE_CITY_API_KEY="sua-api-key-aqui"
```

### 3. Reiniciar Servidor

```bash
npm run dev
```

## 🚨 Tratamento de Erros

### ✅ Sem Erros no Console

- O sistema não gera erros 401 ou warnings desnecessários
- Fallback silencioso quando API não está disponível
- UX consistente independente da configuração

### ✅ Degradação Elegante

- Sistema funciona 100% sem API key
- Dados estáticos garantem boa experiência para países principais
- Input livre como fallback universal

## 📊 Países com Dados Estáticos

### 🇦🇷 Argentina (23 províncias)

Buenos Aires, Catamarca, Chaco, Chubut, Córdoba, Corrientes, Entre Ríos, Formosa, Jujuy, La Pampa, La Rioja, Mendoza, Misiones, Neuquén, Río Negro, Salta, San Juan, San Luis, Santa Cruz, Santa Fe, Santiago del Estero, Tierra del Fuego, Tucumán

### 🇺🇸 Estados Unidos (50 estados)

Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware, Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana, Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana, Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina, North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina, South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia, Wisconsin, Wyoming

### 🇨🇦 Canadá (13 províncias/territórios)

Alberta, British Columbia, Manitoba, New Brunswick, Newfoundland and Labrador, Northwest Territories, Nova Scotia, Nunavut, Ontario, Prince Edward Island, Quebec, Saskatchewan, Yukon

### 🇲🇽 México (32 estados)

Aguascalientes, Baja California, Baja California Sur, Campeche, Chiapas, Chihuahua, Ciudad de México, Coahuila, Colima, Durango, Guanajuato, Guerrero, Hidalgo, Jalisco, México, Michoacán, Morelos, Nayarit, Nuevo León, Oaxaca, Puebla, Querétaro, Quintana Roo, San Luis Potosí, Sinaloa, Sonora, Tabasco, Tamaulipas, Tlaxcala, Veracruz, Yucatán, Zacatecas

## 🎯 Benefícios

### ✅ Performance

- Carregamento instantâneo para países principais
- Cache de dados estáticos
- Menos dependência de APIs externas

### ✅ Confiabilidade

- Sistema funciona offline para dados estáticos
- Não quebra se API externa estiver indisponível
- Fallback sempre disponível

### ✅ UX Consistente

- Experiência uniforme independente da configuração
- Sem erros visíveis para o usuário
- Feedback claro sobre carregamento

### ✅ Escalabilidade

- Fácil adicionar novos países aos dados estáticos
- API externa para cobertura global
- Sistema preparado para crescimento

## 🔄 Manutenção

### Adicionar Novos Países aos Dados Estáticos

1. Editar `ESTADOS_PAISES_ESTATICOS` em `patient-profile-form.tsx`
2. Adicionar array com estados/províncias do país
3. Testar funcionamento

### Atualizar Lista de Países

1. Editar constante `PAISES`
2. Usar códigos ISO 3166-1 alpha-2
3. Manter ordem alfabética

## 📈 Métricas de Uso

- **Brasil**: 100% cobertura via API IBGE
- **Países com dados estáticos**: 4 países principais
- **Cobertura total**: 190+ países (com API key)
- **Taxa de sucesso**: 100% (com fallbacks)
