# TecQuestion - Plataforma de Exámenes 🎓

Bienvenido al repositorio de **TecQuestion**, una aplicación web Full Stack (MERN) diseñada para la gestión y aplicación de exámenes en línea, con roles diferenciados para Profesores y Estudiantes.

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu PC:

1.  **Node.js** (Versión 18 o superior): [Descargar aquí](https://nodejs.org/)
2.  **Git**: [Descargar aquí](https://git-scm.com/)
3.  **MongoDB Atlas** (Cuenta y Cluster creado) o **MongoDB Local**.

---

## 🛠️ Instalación y Configuración

Sigue estos pasos para descargar y poner en marcha el proyecto:

### 1. Clonar el repositorio
Abre tu terminal (PowerShell, CMD o Terminal de VS Code) y ejecuta:

```bash
git clone https://github.com/Jhona200409/TecQuestion.git
cd TecQuestion
```

### 2. Instalar dependencias
El proyecto tiene dos partes: `client` (Frontend) y `server` (Backend). Debes instalar las librerías en ambas carpetas.

**Desde la raíz del proyecto, ejecuta:**
```bash
# Instala dependencias del Backend
cd server
npm install

# Instala dependencias del Frontend
cd ../client
npm install

# Regresa a la raíz
cd ..
```

---

## ⚙️ Configuración de Variables de Entorno

Necesitas configurar las claves secretas para que el sistema funcione.

1.  Ve a la carpeta `server`.
2.  Crea un archivo llamado `.env` (si no existe, puedes duplicar un ejemplo si lo hay).
3.  Agrega el siguiente contenido dentro de `server/.env`:

```env
PORT=5001
# Reemplaza <password> con tu contraseña real de MongoDB Atlas
MONGO_URI=mongodb+srv://admin:<TU_PASSWORD_AQUI>@cluster0.1ykf3wo.mongodb.net/?appName=Cluster0
JWT_SECRET=supersecret_clave_segura_desarrollo
STUDENT_ACCESS_CODE=TecQuestion2024
```
> **Nota:** `STUDENT_ACCESS_CODE` es la clave maestra que usarán los estudiantes para registrarse si se habilita, o para validar su acceso.

---

## ▶️ Ejecución del Proyecto

Para desarrollar, puedes correr ambos servidores (Frontend y Backend) simultáneamente.

### Opción A: Usando el comando todo-en-uno (Recomendado)
Desde la carpeta raíz `TecQuestion`:
```bash
npm run dev
```
Esto encenderá:
- **Backend** en `http://localhost:5001`
- **Frontend** en `http://localhost:5173`

### Opción B: Ejecución manual
1. **Terminal 1 (Backend):**
   ```bash
   cd server
   npm run dev
   ```
2. **Terminal 2 (Frontend):**
   ```bash
   cd client
   npm run dev
   ```

---

## 👨‍🏫 Creación de Usuario Administrador (Profesor)

Como el registro público de estudiantes está restringido, necesitas un usuario "Profesor" inicial.

1.  Ve a la carpeta `server`.
2.  Ejecuta el script de "semilla" (seed):
    ```bash
    node seed.js
    ```
3.  Esto creará un usuario admin con:
    *   **Email:** `admin@tecquestion.com`
    *   **Password:** `admin123`

¡Listo! Ahora puedes ir a `http://localhost:5173`, iniciar sesión como Profesor y comenzar a crear exámenes.

---

## ⚠️ Solución de Problemas Comunes

*   **Error de Conexión a MongoDB:**
    *   Verifica que tu IP esté permitida en "Network Access" de MongoDB Atlas.
    *   Asegúrate de que la `MONGO_URI` en el archivo `.env` sea correcta y no tenga espacios extra.
*   **Error CORS:**
    *   Si el navegador bloquea la conexión, asegúrate de que el Backend (`server/index.js`) tenga configurado `app.use(cors())`.
*   **Puerto Ocupado:**
    *   Si el puerto 5001 o 5173 está en uso, cierra las terminales de Node.js abiertas o reinicia tu PC.

---

Hecho con 💙 por el equipo de TecQuestion.
