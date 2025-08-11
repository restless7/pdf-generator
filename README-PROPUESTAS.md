# Sistema de Generación de Propuestas Optimizadas

## 🎯 Descripción General

Este sistema permite generar propuestas comerciales profesionales en PDF utilizando templates HTML con Handlebars y datos JSON estructurados. Cada sección de la propuesta se distribuye en páginas dedicadas para una mejor presentación.

## 📁 Estructura de Archivos

```
pdf-generator/
├── propuesta-optimizada.html          # Template HTML principal con 8 páginas
├── template-generic-data.json         # Plantilla genérica de datos
├── ice-colombia-data.json             # Datos específicos para ICE Colombia
├── generate-optimized-proposal.js     # Generador principal
├── logominimalapex.png                # Logo de la empresa
└── README-PROPUESTAS.md               # Esta documentación
```

## 🏗️ Estructura del Template

El template está dividido en **8 páginas** con saltos de página optimizados:

1. **Página 1**: Portada, Resumen Ejecutivo y Partes del Contrato
2. **Página 2**: Alcance y Módulos Incluidos
3. **Página 3**: Modelos de Entrega (SaaS vs On-Premise)
4. **Página 4**: Inversión y Precios con Descuentos
5. **Página 5**: Plan de Pagos a Plazos
6. **Página 6**: Cronograma de Trabajo por Fases
7. **Página 7**: Términos, Responsabilidades y Soporte
8. **Página 8**: Aceptación y Firmas

## 🚀 Cómo Usar

### Generación Básica
```bash
node generate-optimized-proposal.js
```

### Con Parámetros Personalizados
```bash
node generate-optimized-proposal.js --data mi-cliente-data.json --output Mi-Cliente
```

### Opciones Disponibles
- `--template <archivo>`: Template HTML a usar (default: propuesta-optimizada.html)
- `--data <archivo>`: Archivo JSON con datos (default: ice-colombia-data.json)
- `--output <prefijo>`: Prefijo del archivo de salida (default: Propuesta-Optimizada)
- `--help`: Mostrar ayuda completa

## 📊 Estructura de Datos JSON

### Campos Principales

```json
{
  "proposalTitle": "Título principal de la propuesta",
  "proposalSubtitle": "Subtítulo con cliente y empresa",
  "proposalDate": "Fecha de la propuesta",
  "proposalVersion": "Versión del documento",
  "companyName": "Nombre de tu empresa",
  "executiveSummary": "Resumen ejecutivo completo...",
  
  "providerCompany": "Datos del proveedor...",
  "clientCompany": "Datos del cliente...",
  
  "modules": [
    {
      "title": "Nombre del Módulo",
      "description": "Descripción detallada",
      "fullWidth": true // Opcional, para módulos que ocupen toda la fila
    }
  ],
  
  "pricingRows": [
    {
      "module": "Nombre",
      "subscription": "Precio mensual",
      "local": "Precio único",
      "isTotal": false, // true para fila de totales
      "isNote": false   // true para notas explicativas
    }
  ],
  
  "timeline": [
    {
      "phase": "Nombre de la Fase",
      "description": "Descripción y duración",
      "fullWidth": true // Opcional
    }
  ]
}
```

### Campos Especiales

- **Texto Plano**: Usa texto plano sin HTML. El formato se aplica automáticamente en el template.
- **Arrays**: Para listas de características, módulos, fases, etc.
- **Objetos Anidados**: Para estructuras complejas como responsabilidades, precios y pagos
- **Estructura de Precios**: Usa objetos separados para originalAmount, discountPercent, discountAmount, finalAmount
- **Estructura de Pagos**: Array de objetos con stage, description y amount

## 🎨 Personalización Visual

### CSS Variables Disponibles
```css
:root {
  --emerald: #10b981;    /* Color principal (verde)*/
  --text: #1f2937;       /* Texto principal */
  --muted: #6b7280;      /* Texto secundario */
  --border: #e5e7eb;     /* Bordes */
  --card: #ffffff;       /* Fondo de tarjetas */
}
```

### Clases CSS Útiles
- `.highlight`: Para destacar tarjetas importantes
- `.full-width`: Para elementos que ocupan todo el ancho
- `.badge`: Para etiquetas pequeñas
- `.avoid-break`: Para evitar saltos de página
- `.page-break`: Para forzar nueva página

## 📝 Creando Nuevas Propuestas

### 1. Duplicar Template de Datos
```bash
cp template-generic-data.json nuevo-cliente-data.json
```

### 2. Personalizar Contenido
Edita `nuevo-cliente-data.json` y reemplaza todos los placeholders `[CAMPO]` con la información específica:

- `[CLIENTE]` → Nombre del cliente
- `[FECHA]` → Fecha actual
- `[MÓDULO 1]` → Nombre del primer módulo
- `[PRECIO MENSUAL]` → Precios correspondientes
- Etc.

### 3. Generar PDF
```bash
node generate-optimized-proposal.js --data nuevo-cliente-data.json --output Propuesta-NuevoCliente
```

## 🔧 Funcionalidades Avanzadas

### Helpers de Handlebars Incluidos
- `{{#if condition}}` - Condicionales
- `{{#each array}}` - Iteraciones
- `{{#eq a b}}` - Comparación de igualdad
- `{{formatCurrency amount}}` - Formateo de moneda

### Saltos de Página
El sistema incluye CSS optimizado para:
- Evitar que las tarjetas se corten entre páginas
- Mantener títulos con su contenido
- Distribuir contenido equilibradamente

### Logo Automático
El logo se embebe automáticamente en base64, asegurando que aparezca en todos los entornos.

## 📋 Lista de Verificación

Antes de generar una propuesta, verifica:

- [ ] Todos los placeholders `[CAMPO]` han sido reemplazados
- [ ] Los precios están actualizados
- [ ] La información de contacto es correcta
- [ ] Las fechas son actuales
- [ ] Los módulos corresponden al cliente
- [ ] El cronograma es realista
- [ ] Los términos legales son apropiados

## 🐛 Solución de Problemas

### Error de JSON Inválido
- Verifica que todas las comillas estén escapadas: `\"texto\"`
- Asegúrate de que no falten comas entre elementos
- Usa un validador JSON online para verificar sintaxis

### PDF No Se Genera
- Verifica que Chrome/Chromium esté instalado
- Asegúrate de que el logo `logominimalapex.png` exista
- Revisa los permisos de escritura del directorio

### Contenido Cortado
- Reduce el contenido de secciones muy largas
- Usa `"fullWidth": true` para elementos grandes
- Ajusta los márgenes en el CSS si es necesario

## 🎯 Mejores Prácticas

1. **Consistencia**: Mantén el mismo tono y formato en toda la propuesta
2. **Claridad**: Usa bullets y listas para información compleja
3. **Profesionalismo**: Revisa ortografía y gramática antes de enviar
4. **Personalización**: Adapta el contenido específicamente al cliente
5. **Seguimiento**: Incluye fechas de validez y contactos claros

## 📈 Extensiones Futuras

El sistema está preparado para:
- Múltiples idiomas
- Templates alternativos
- Integración con CRM
- Firmas digitales
- Generación automática desde formularios web

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo o revisa los ejemplos incluidos.
