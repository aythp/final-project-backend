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

## Licencia
Este proyecto está bajo la Licencia MIT. 