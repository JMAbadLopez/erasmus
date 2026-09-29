# Portal de Gestión e Información: Erasmus+ y Eurotrainee (GVA)

Repositorio documental en formato Markdown para la generación del portal web estático con **MkDocs** (Material for MkDocs), orientado a la coordinación, profesorado y alumnado de Formación Profesional y Educación Superior en centros educativos de la **Generalitat Valenciana (GVA)**.

---

## Contenido del Repositorio

- **Eurotrainee (GVA):**
  - **Eurotrainee Alumnado:** 666 plazas para alumnado de 1º y 2º de Grado Medio y Grado Superior, estancias prácticas de 4 o 6 semanas en empresas europeas cofinanciadas por el Fondo Social Europeo Plus (FSE+), convalidación de horas de Formación en Empresa (FE) o FCT en la plataforma **SAÒ** (ITACA 3).
  - **Eurotrainee Profesorado:** 909 plazas distribuidas en 5 lotes, estancias formativas de 1 semana en la UE para docentes de FP en servicio activo, baremo de hasta 100 puntos y certificación oficial en el Registro de Formación Permanente del Profesorado.
  - Documentos oficiales de la Dirección General de Formación Profesional (DGFP) descargables en PDF.
- **Erasmus+ Educación Superior (KA1):**
  - Gestión exclusiva de la **Acción Clave 1 (KA1 - KA131-HED)** para Ciclos Formativos de Grado Superior.
  - Movilidades de prácticas de alumnado (**SMP** para FCT y recién titulados).
  - Movilidades de personal docente (**STA**) y formación técnica (**STT**).
  - Reconocimiento curricular en créditos **ECTS**, Suplemento Europeo al Título (**SET**), **Europass Movilidad** y compromisos de la **Carta ECHE**.
- **Gestión y Coordinación de Centro:**
  - Listas de control (*checklists*) paso a paso para la gestión ágil de convocatorias.
  - Protocolo y modelos de difusión interna obligatoria en el claustro y departamentos didácticos.

---

## Puesta en Marcha Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/JMAbadLopez/erasmus.git
cd erasmus
```

### 2. Crear y activar entorno virtual
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 4. Iniciar servidor de desarrollo
```bash
mkdocs serve
```
El portal estará accesible en [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

### 5. Compilar el sitio web estático
```bash
mkdocs build
```
Generará los archivos HTML optimizados en la carpeta `site/`.

Para publicar directamente en GitHub Pages:
```bash
mkdocs gh-deploy
```
