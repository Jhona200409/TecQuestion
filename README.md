# TecQuestion - Plataforma de Exámenes

**TecQuestion** es una aplicación web Full Stack (MERN) para la creación, gestión y aplicación de exámenes en tiempo real. Este repositorio contiene todo el código fuente necesario para desplegar el proyecto.

---

##  Guía de Instalación en una Nueva PC (Paso a Paso)

Si deseas descargar y ejecutar este proyecto en una computadora diferente (por ejemplo, para evaluación o desarrollo en otro equipo), sigue estas instrucciones detalladas.

### 1. Requisitos Previos (Instalar primero)
Antes de clonar el proyecto, asegúrate de tener instalado este software:

*   **Node.js (LTS):** [Descargar aquí](https://nodejs.org/) (Incluye npm).
*   **Git Bash:** [Descargar aquí](https://git-scm.com/).
*   **VS Code (Opcional):** Para editar el código.

---

### 2. Descargar (Clonar) el Proyecto
Abre tu terminal (o Git Bash) en la carpeta donde quieras guardar el proyecto y escribe:

```bash
git clone https://github.com/Jhona200409/TecQuestion.git
cd TecQuestion
```

---

### 3. Instalar Dependencias (Librerías)
El proyecto se divide en dos partes: Servidor (`server`) y Cliente (`client`). Necesitas instalar las "piezas" de ambas partes.

**Ejecuta estos comandos uno por uno en la terminal (dentro de la carpeta TecQuestion):**

1.  **Instalar librerías del Servidor:**
    ```bash
    cd server
    npm install
    ```

2.  **Instalar librerías del Cliente:**
    ```bash
    cd ../client
    npm install
    ```

3.  **Volver a la carpeta principal:**
    ```bash
    cd ..
    ```

---

### 4. Configurar las Claves Secretas (.env)
Por seguridad, las contraseñas no se descargan con el código. Debes crearlas tú mismo.

1.  Entra a la carpeta `server`.
2.  Crea un nuevo archivo y nómbralo exactamente: `.env`
3.  Abre el archivo `.env` con el Bloc de Notas o VS Code y pega esto:

```env
PORT=5001
MONGO_URI=mongodb+srv://admin:tecquestion2025@cluster0.1ykf3wo.mongodb.net/?appName=Cluster0
JWT_SECRET=supersecret_clave_segura_desarrollo
```

> **Nota:** La `MONGO_URI` anterior es una base de datos de prueba compartida. Para producción, usa tu propia cadena de conexión de MongoDB Atlas.

---

### 5. Iniciar la Aplicación
¡Ya casi estás! Ahora encendemos el sistema.

Abre una terminal en la carpeta principal `TecQuestion` y escribe:

```bash
npm run dev
```

Este comando mágico iniciará tanto el **Backend** como el **Frontend** al mismo tiempo.
*   Verás mensajes como "Server running on port 5001" y "VITE v4.x.x ready".
*   El navegador se abrirá automáticamente (o puedes ir a `http://localhost:5173`).

---

### 6. Datos de Acceso (Usuarios de Prueba)

El sistema tiene dos roles principales. Usa estas credenciales para probar:

####  Rol: Profesor (Administrador)
*   **Email:** `admin@tecquestion.com`
*   **Contraseña:** `admin123`
*   *Permisos:* Crear, Editar y Borrar Exámenes.

####  Rol: Estudiante
*   Para probar como estudiante, primero regístrate en la página de Login con un nuevo correo.
*   *Nota:* Si el registro público está desactivado, el profesor deberá crear el usuario desde la base de datos (o usar el script `node seed.js` en el servidor si se requiere restaurar el admin).

---

##  Solución de Problemas

*   **Error: "command not found" (git o npm):** Reinstala Node.js y Git, y asegúrate de reiniciar tu terminal.
*   **Error de Conexión (Network Error):** Asegúrate de que el archivo `.env` en la carpeta `server` existe y tiene la `MONGO_URI` correcta.
*   **Pantalla en Blanco:** Abre la consola del navegador (F12) para ver si hay errores de React.

---
Hecho por el equipo de TecQuestion.
