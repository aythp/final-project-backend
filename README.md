# API de Películas y Series - Backend

## Descripción
Este es el backend de una aplicación web para gestionar películas y series. Proporciona una API RESTful que permite a los usuarios registrarse, iniciar sesión, y gestionar sus listas de películas y series favoritas, vistas y pendientes.

## Tecnologías Utilizadas
- **Node.js**: Entorno de ejecución para JavaScript
- **Express**: Framework web para Node.js
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticación basada en tokens
- **Bcrypt**: Encriptación de contraseñas
- **Dotenv**: Gestión de variables de entorno

## Estructura del Proyecto
```
final-project-backend/
├── config/             # Configuración de la aplicación
├── db/                 # Configuración de la base de datos
├── error-handling/     # Manejo de errores
├── middleware/         # Middleware personalizado
├── models/             # Modelos de datos (Mongoose)
│   ├── Movie.model.js  # Modelo para películas
│   ├── Series.model.js # Modelo para series
│   └── User.model.js   # Modelo para usuarios
├── routes/             # Rutas de la API
│   ├── auth.routes.js  # Rutas de autenticación
│   ├── index.routes.js # Rutas principales
│   ├── movie.routes.js # Rutas para películas
│   ├── series.routes.js# Rutas para series
│   └── user.routes.js  # Rutas para usuarios
├── .env                # Variables de entorno
├── .gitignore          # Archivos ignorados por Git
├── app.js              # Configuración de Express
├── package.json        # Dependencias del proyecto
└── server.js           # Punto de entrada de la aplicación
```

## Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd final-project-backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
```
PORT=5005
ORIGIN=http://localhost:3000
TOKEN_SECRET=tuTokenSecreto
MONGODB_URI=mongodb://localhost:27017/nombre-de-tu-base-de-datos
```

4. Inicia el servidor:
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## API Endpoints

### Autenticación
- `POST /auth/signup`: Registro de usuario
- `POST /auth/login`: Inicio de sesión
- `GET /auth/verify`: Verificación de token

### Películas
- `GET /api/movies`: Obtener todas las películas
- `GET /api/movies/:id`: Obtener detalles de una película
- `POST /api/movies`: Crear una nueva película
- `PUT /api/movies/:id`: Actualizar una película
- `DELETE /api/movies/:id`: Eliminar una película

### Series
- `GET /api/series`: Obtener todas las series
- `GET /api/series/:id`: Obtener detalles de una serie
- `POST /api/series`: Crear una nueva serie
- `PUT /api/series/:id`: Actualizar una serie
- `DELETE /api/series/:id`: Eliminar una serie

### Usuarios
- `GET /api/users`: Obtener todos los usuarios
- `GET /api/users/:id`: Obtener detalles de un usuario
- `PUT /api/users/:id`: Actualizar un usuario
- `DELETE /api/users/:id`: Eliminar un usuario

## Contribución
Para contribuir al proyecto, por favor sigue estos pasos:
1. Haz un fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia
Este proyecto está bajo la Licencia MIT. 