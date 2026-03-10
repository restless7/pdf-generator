Esta propuesta presupuestal ha sido diseñada bajo una estructura financiera profesional, alineada con los estándares de gestión de proyectos tecnológicos (PMBOK) y adaptada a la realidad económica del desarrollo de software en Colombia.

El presupuesto se divide en CAPEX (Gastos de Capital - Desarrollo e Infraestructura) y OPEX (Gastos Operativos - Recurrentes y Campo). Se ha tomado como referencia la documentación técnica suministrada  y se ha ajustado la Fase 1 para ejecutar un Piloto en el Departamento de Santander, aprovechando su topografía compleja (cañones y montañas) como escenario ideal de prueba para las tecnologías LoRa y Edge Computing.

Presupuesto Maestro: Proyecto Manglar AI
Moneda: Dólares Americanos (USD) - Estándar para convocatorias internacionales (BID, Green Climate Fund). Horizonte: 5 Años (Faseada).

FASE 1: Validación y Piloto "Santander Resiliente" (Meses 0-12)
Objetivo: Desarrollo del MVP (Producto Mínimo Viable), validación de arquitectura Offline-First y despliegue en 3 municipios de Santander con topografía diversa (ej. Cepitá, Tona, Rionegro).

1.1 Desarrollo Tecnológico (R&D)

Ítem,Descripción,Costo Estimado (USD),Justificación Técnica
Equipo de Ingeniería (Core Team),"1 Tech Lead (Backend/Cloud), 1 Mobile Dev (React Native/Offline), 1 Data Scientist (NLP/LSTM).","$72,000",Salarios competitivos locales para retener talento senior necesario para la arquitectura Edge.
Infraestructura Cloud (Dev),AWS/GCP (Entrenamiento modelos) + Firebase.,"$5,000",Costos iniciales de entrenamiento de redes neuronales (LSTM) con datos históricos del IDEAM.
Licenciamiento y Herramientas,"GitHub Enterprise, Jira, Docker, Mapbox (Commercial Tier).","$3,500",Herramientas para gestión ágil y mapas vectoriales offline.
Hardware de Pruebas,"10 Smartphones gama baja, 5 gama media (para pruebas de estrés).","$2,500",Validación de TensorFlow Lite en dispositivos de recursos limitados.
Subtotal Desarrollo,,"$83,000",

1.2 Infraestructura IoT y Despliegue en Campo (Santander)

Ítem,Descripción,Costo Estimado (USD),Justificación Técnica
Kits IoT Piloto (x30),Sensores de nivel freático y pluvial (Arduino/ESP32) + Baterías Solares.,"$4,500",Sensores de bajo costo para monitoreo hídrico en las 3 zonas piloto.
Red LoRaWAN (Santander),6 Gateways LoRa de largo alcance (para topografía de cañón).,"$3,000",Conectividad independiente de redes 4G para zonas de silencio digital.
Logística de Campo,"Viáticos, transporte (Santander), talleres comunitarios.","$12,000","Co-creación con líderes comunitarios y calibración de ""verdad terreno""."
Subtotal Campo,,"$19,500",

1.3 Administrativo y Legal

Ítem,Descripción,Costo Estimado (USD),Justificación Técnica
Consultoría Legal,"Habeas Data, Constitución SAS, Propiedad Intelectual.","$5,000",Cumplimiento estricto Ley 1581 y protocolos de datos éticos.
Gastos Administrativos,"Oficina (Coworking Bucaramanga), Contabilidad.","$6,000",Base operativa local.
Subtotal Admin,,"$11,000",

TOTAL FASE 1 (PILOTO SANTANDER): $113,500 USD Burn Rate Mensual Promedio: ~$9,400 USD

FASE 2: Expansión Regional y Tech-Transfer (Meses 13-36)
Objetivo: Escalamiento a La Guajira y Chocó (según documento original), integración con UNGRD y optimización de modelos.

Categoría,Ítem de Gasto,Costo Anual (USD),Detalle Estratégico
Talento Humano (Escalado),Equipo de 8 personas (Incluye UX/UI y DevOps).,"$160,000",Se suman perfiles para optimización de la App y seguridad de microservicios.
Infraestructura Cloud,Escalado de BD (PostgreSQL + PostGIS) y API Gateway.,"$25,000",Soporte para mayor concurrencia y almacenamiento geoespacial masivo.
Despliegue IoT Regional,200 Nodos IoT + 50 Sirenas Comunitarias.,"$45,000",Implementación en La Guajira (Pozos) y Chocó (Cuencas).
Blockchain & Seguridad,Auditoría de Smart Contracts y nodos privados.,"$15,000",Garantía de soberanía de datos para comunidades indígenas.
Marketing & B2G,"Cabildeo (Lobby), Ferias GovTech, Relaciones Públicas.","$30,000",Gestión para lograr contratos con Alcaldías y el zero-rating con Telcos.

FASE 3: Nacionalización y Sostenibilidad (Meses 37-60)
Objetivo: Cobertura en 32 departamentos y venta de servicios B2B (Seguros/Logística).

Categoría,Ítem de Gasto,Costo Anual (USD),Detalle Estratégico
Operación Nacional,"Mantenimiento, Soporte 24/7, Customer Success.","$200,000",Soporte para >100k usuarios simultáneos y SLAs gubernamentales.
I+D Avanzado,Centro de Excelencia Andino (Modelos Climáticos Regionales).,"$80,000",Adaptación del modelo para exportación a Ecuador/Perú.
Costos de Venta (B2B),Equipo comercial para sector Seguros y Agro.,"$70,000",Generación de ingresos recurrentes propios para sostenibilidad.

TOTAL FASE 3 (24 MESES): $700,000 USD Nota: En esta etapa, el OPEX debería ser cubierto parcialmente por ingresos B2B/B2G.

Resumen Ejecutivo del Presupuesto (5 Años)

FASE,TIEMPO,INVERSIÓN (USD),HITOS CLAVE
1. Piloto Santander,Año 1,"$113,500","MVP, Validación Offline, 3 Municipios Santander."
2. Expansión,Años 2-3,"$550,000","Caribe/Pacífico, Integración UNGRD, IoT Masivo."
3. Nacionalización,Años 4-5,"$700,000","32 Deptos, B2B Sostenible, Exportación Andina."
Contingencia,Global,"$136,350",10% sobre el total (Riesgo cambiario/Tecnológico).
TOTAL PROYECTO,5 AÑOS,"$1,499,850",

Indicadores de Viabilidad Financiera

Costo por Usuario (Año 5): Estimando 1 millón de usuarios , el costo de infraestructura por usuario se proyecta en <$0.50 USD/año gracias a la arquitectura Edge Computing que reduce la dependencia de servidores centrales costosos.




Eficiencia de Hardware: El uso de gateways solares y LoRa reduce el gasto energético y de mantenimiento en zonas remotas.

Este presupuesto asegura los recursos necesarios para construir una plataforma robusta, segura y escalable, priorizando la inversión en talento humano e infraestructura de campo durante la etapa crítica del piloto en Santander.