const { PDFGenerator } = require('../dist/index.js');
const fs = require('fs');
const path = require('path');

async function generateMuseoBrandVoice() {
    const pdfGenerator = new PDFGenerator();
    
    const brandData = {
        brandName: "Museo del Coleccionista",
        generationDate: new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        brandSummary: `La voz del Museo del Coleccionista es **culturalmente enriching**, **warmly authoritative**, y **heritage-driven**. Fusiona la sabiduría de preservar 16,000+ piezas de arte y cultura con la dedicación apasionada de un coleccionista que comparte tesoros con el mundo.`,
        content: `

## Museo del Coleccionista Brand Voice

La brand voice de Museo del Coleccionista es **culturalmente enriquecedora**, **cálidamente autoritativa**, y **heritage-driven**. Fusiona la sabiduría de preservar 16,000+ piezas de arte y cultura con la dedicación apasionada de un coleccionista que comparte tesoros con el mundo. Cada mensaje canaliza un tono de custodia cultural—brillando con apreciación artística y alimentado por misión educativa. 

Hablamos como curamos: **thoughtfully**, **inclusively**, y con profundo respeto por el legado cultural. Nuestras metáforas provienen del coleccionismo, la preservación, y los puentes culturales—destacando nuestra misión de conectar pasado, presente, y futuro a través del arte.

---

## 1. Website Copy (Home Page)

> **Bienvenidos al Museo del Coleccionista—donde cada pieza cuenta una historia, y cada visita construye puentes culturales.**
> 
> Preservamos más de 16,000 obras que narran la riqueza de nuestro patrimonio, desde culturas precolombinas hasta expresiones contemporáneas. Nuestro compromiso trasciende la exhibición: somos guardianes de memoria, educadores de corazón, y facilitadores de encuentros transformadores con el arte.
> 
> ¿Listos para descubrir? Cada obra espera compartir su historia contigo.

---

## 2. Social Media Post (LinkedIn)

> **El arte no es solo contemplación—es diálogo con nuestra identidad cultural.**
> 
> En el Museo del Coleccionista, cada exposición conecta visitantes con narrativas que han moldeado nuestra región. Nuestra colección de arte precolombino acaba de recibir 200 visitantes internacionales esta semana, construyendo puentes de entendimiento cultural.
> 
> #PatrimonioCultural #MuseoDelColeccionista #ArteColombia

---

## 3. Social Media Post (Instagram)

> **✨ Historia viva. Memoria preservada. Futuro inspirado.**
> 
> Recién inauguramos la sala "Identidad y Expresión" con piezas que celebran la diversidad cultural de nuestro territorio.
> 
> 🎨🏛️ **El arte es el idioma universal del alma.**
> 
> #MuseoDelColeccionista #ArteVivo #PatrimonioCultural

---

## 4. Donor/Partner Proposal Introduction

> **Estimado/a [Nombre del Socio],**
> 
> Usted está contemplando una oportunidad única de impacto cultural—una donde la preservación y la educación no son solo programas, sino legados fundamentales para las futuras generaciones.
> 
> En el Museo del Coleccionista, no ofrecemos exhibiciones estáticas—cultivamos experiencias transformadoras. Esta propuesta presenta una estrategia de colaboración cultural respaldada por nuestras 16,000+ piezas y un enfoque educativo inspirado en el poder del arte para unir comunidades.
> 
> Desde programas educativos hasta exposiciones itinerantes, encontrará aquí un camino para liderar—no solo apoyar—el renacimiento cultural de nuestra región.

---

## 5. Email Newsletter

**Subject:** 🎨🏛️ Crónicas Culturales – El Boletín del Coleccionista

> **Hola [Nombre],**
> 
> Cada mes, compartimos descubrimientos desde nuestras galerías. Nuestra misión es equipar tu curiosidad con las historias que han moldeado nuestra identidad cultural.
> 
> **Señales de este mes:**
> 
> - **Nuevas Adquisiciones:** Piezas de arte contemporáneo que dialogan con tradiciones ancestrales.
> - **Talleres Familiares:** Espacios donde el arte se vive, no solo se observa.
> - **Colecciones Digitales:** Democratizando el acceso a nuestro patrimonio.
> 
> 🌟 En esta era de transformación digital, el arte sigue siendo nuestro puente más auténtico hacia la comprensión mutua.
> 
> [Explora las Nuevas Exposiciones]
> 
> Con gratitud cultural,
> 
> —Equipo Museo del Coleccionista

---

## 6. Blog Post Introduction

### Coleccionar es Preservar: Cómo el Arte Construye Puentes Generacionales

> **La memoria cultural recompensa la preservación, no solo la admiración.**
> 
> En el Museo del Coleccionista, estamos pionereando una nueva dimensión de curaduría cultural—construida sobre diálogo intergeneracional, preservación activa, y acceso democratizado al patrimonio.
> 
> En este artículo, exploramos los principios de la curaduría participativa y por qué las colecciones privadas están evolucionando hacia espacios públicos de encuentro cultural. Bienvenidos a la era del arte como patrimonio vivo.

---

## 7. Visitor Follow-up Email

**Subject:** Conexión Cultural: Tu Visita Sigue Resonando

> **Hola [Nombre del Visitante],**
> 
> Comparto este breve reflejo sobre cómo tu visita contribuye a nuestro tejido cultural:
> 
> ✅ Tu participación en el taller familiar inspiró a 12 niños más
> 
> ✅ Las obras que fotografiaste se han compartido 89 veces en redes
> 
> ✅ Tu donación voluntaria apoyará la restauración de 3 piezas precolombinas
> 
> El arte sigue viviendo a través de conexiones como la tuya. He adjuntado un catálogo digital de las piezas que más te gustaron, junto con algunas recomendaciones para tu próxima visita.
> 
> ¿Listo para profundizar más en nuestra colección? Conversemos sobre membresías culturales.
> 
> Preservando juntos,
> 
> [Tu Nombre]
> 
> Curador de Experiencias, Museo del Coleccionista

---

## Voice Summary

### Culturalmente Enriquecedor. Cálidamente Educativo. Profundamente Conectado.

La voz del Museo del Coleccionista fusiona el lenguaje de la preservación cultural con una metáfora cálida de coleccionismo compartido y educación transformadora. Donde otras instituciones pueden ser distantes, el Museo del Coleccionista es **accesible**, **inspirador**, y **comunitario**. 

El tono se adapta a través de plataformas—desde propuestas institucionales hasta posts casuales de Instagram—manteniéndose siempre arraigado en nuestro valor central: **el arte como puente cultural entre generaciones, comunidades, y culturas**.

---

## 🔑 Palabras Clave y Frases Clave

Estas palabras resumen la identidad del Museo del Coleccionista y pueden ser utilizadas estratégicamente en comunicados, contenido web, presentaciones y campañas:

1. **Preservación Viva**
2. **Puentes Culturales**  
3. **Guardianes de Memoria**
4. **Herencia Compartida**
5. **Arte que Conecta**
6. **Colección Dinámica**
7. **Narrativas Vivas**
8. **Educación a Través del Arte**
9. **Diálogo Cultural**
10. **Diversidad en Exhibición**
11. **Exploración Significativa**
12. **Cultura como Conexión**
13. **Expresiones de Identidad**
14. **Tesoros Ancestrales**
15. **Encuentros Transformadores**

### 💡 Ejemplos de uso:

- "En el Museo del Coleccionista, cada obra es un **puente cultural**, conectando historias y corazones."
- "No somos solo un museo; somos **guardianes de memoria compartida** a través del tiempo."
- "Vive el arte como nunca antes—como un **diálogo cultural** en constante evolución."

---

## 🔬 Valores y Creencias Fundamentales

### 1. Vínculos Culturales
Creamos un espacio donde el arte es un puente que une distintas culturas, generando entendimiento y empatía.

**Reflejo en tono de voz:** accesible, inclusivo, invitador.

**Ejemplo:** "Cada pieza en nuestra colección es un vínculo que conecta generaciones y culturas."

### 2. Preservación Dinámica
Nos comprometemos a mantener viva la memoria cultural, no solo preservando objetos, sino también fomentando un diálogo continuo.

**Reflejo en tono de voz:** vivo, inspirador, en constante conversación.

**Ejemplo:** "Nuestro compromiso es hacer de la preservación una experiencia dinámica y participativa."

### 3. Educación Transformadora
Creemos en el poder del arte como herramienta educativa que enriquece y transforma perspectivas.

**Reflejo en tono de voz:** educativo, enriquecedor, estimulante.

**Ejemplo:** "El aprendizaje nunca termina en nuestras galerías—es allí donde realmente comienza."

### 4. Inclusividad Abierta
Somos un lugar donde todos tienen un espacio, y cada historia es valorada y compartida.

**Reflejo en tono de voz:** acogedor, diverso, empático.

**Ejemplo:** "El Museo del Coleccionista es un espacio abierto, donde cada voz y cada historia son bienvenidas."

### 5. Innovación Cultural
Aprovechamos la tecnología moderna para hacer que el arte sea accesible y atractivo para una audiencia global.

**Reflejo en tono de voz:** progresista, innovador, accesible.

**Ejemplo:** "Nuestras colecciones digitales están a solo un clic, llevando la cultura directamente a tus manos."

### 6. Herencia Viva
Cada pieza en nuestra colección es un testimonio vivo de nuestra herencia cultural, esperando ser explorado y entendido.

**Reflejo en tono de voz:** reverente, vibrante, significativo.

**Ejemplo:** "Las obras que preservamos cuentan historias que aún resuenan hoy."

---

## 🗣️ Tono de Voz

| Carácter | Descripción |
|----------|-------------|
| 🎨 **Culturalmente Rico** | Lleno de historia y significado, pero accesible para todos. |
| 🌿 **Vivo e Inspirador** | Presentamos el arte como una experiencia enriquecedora en constante evolución. |
| 🏺 **Respetuoso y Cercano** | Reconocemos y honramos todas las historias culturales con empatía. |
| 🖼️ **Inclusivo y Abierto** | Abierto a todas las voces y perspectivas. |
| 🌐 **Innovador y Accesible** | Integramos tecnología para democratizar el acceso al arte. |

**El Museo del Coleccionista transmite calor y sabiduría cultural.** Su tono se adapta a múltiples plataformas, ofreciendo siempre un espacio donde el arte y la cultura trascienden barreras, promoviendo encuentros y conexiones significativas a nivel personal y comunitario.

---

## 🏛️ Museo del Coleccionista – Brand Voice Guide

*Esta guía de voz de marca es un documento vivo que evoluciona con nuestro compromiso de preservar, educar y conectar a través del arte.*

`
    };

    try {
        console.log('🎨 Generando PDF del Brand Voice del Museo del Coleccionista...');
        
        const pdfBuffer = await pdfGenerator.generatePDF('brand-voice', brandData, {
            format: 'A4',
            printBackground: true,
            margin: { 
                top: '2cm', 
                right: '1.5cm', 
                bottom: '2cm', 
                left: '1.5cm' 
            }
        });

        const outputPath = path.join(__dirname, 'Museo-del-Coleccionista-Brand-Voice.pdf');
        fs.writeFileSync(outputPath, pdfBuffer);
        
        console.log(`✅ PDF generado exitosamente: ${outputPath}`);
        console.log(`📄 Tamaño del archivo: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);
        
        // Clean up
        await pdfGenerator.closeBrowser();
        
    } catch (error) {
        console.error('❌ Error generando el PDF:', error);
        await pdfGenerator.closeBrowser();
        process.exit(1);
    }
}

// Execute the function
generateMuseoBrandVoice();
