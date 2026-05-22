
# Innovatech Backend - EP2 DevOps

Backend desarrollado para la Evaluación Parcial N°2 de la asignatura **ISY1101 Introducción a Herramientas DevOps**.

Este proyecto implementa una API REST utilizando **Node.js**, **Express** y **MySQL**, ejecutada mediante contenedores Docker. La solución utiliza **Docker Compose** para levantar el Backend junto con la base de datos, aplicando persistencia de datos mediante volúmenes Docker.

El proyecto forma parte de la etapa 2 del caso **Innovatech Chile**, donde se requiere contenedorización, despliegue en AWS EC2, persistencia de datos y automatización mediante CI/CD.

---

## Integrantes

- Jaime Manzo
- Martin Silva

---

## Objetivo del proyecto

El objetivo de este repositorio es implementar el servicio Backend de Innovatech Chile, permitiendo:

- Ejecutar una API REST en un contenedor Docker.
- Conectar el Backend con una base de datos MySQL.
- Mantener persistencia de datos mediante volúmenes Docker.
- Preparar el servicio para despliegue en una instancia EC2 privada.
- Integrar el Backend con un Frontend desplegado en una instancia EC2 pública.
- Preparar el repositorio para automatización mediante GitHub Actions.

---

## Tecnologías utilizadas

- Node.js
- Express
- MySQL
- Docker
- Docker Compose
- Git
- GitHub
- GitHub Actions
- AWS EC2

---

## Estructura del proyecto

```text
innovatech-backend
├── server.js
├── package.json
├── package-lock.json
├── .env
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
└── README.md
````

---

## Descripción de archivos principales

### server.js

Archivo principal del Backend. Define la API REST, los endpoints disponibles y la conexión con la base de datos MySQL.

### package.json

Archivo de configuración del proyecto Node.js. Contiene los scripts y dependencias necesarias.

### .env

Archivo de variables de entorno para configurar puerto, base de datos, usuario y contraseña.

### Dockerfile

Archivo utilizado para construir la imagen Docker del Backend.

### docker-compose.yml

Archivo que permite levantar el Backend y la base de datos MySQL como servicios contenerizados.

### .dockerignore

Archivo que evita copiar archivos innecesarios dentro de la imagen Docker.

---

## Arquitectura del Backend

El Backend está compuesto por dos servicios principales:

```text
Backend Node.js + Express  --->  MySQL
```

Ambos servicios se ejecutan mediante Docker Compose y se comunican por una red interna de Docker.

Servicios definidos:

* `backend`: API REST desarrollada en Node.js y Express.
* `mysql-db`: Base de datos MySQL 8.0.
* `mysql_data`: Volumen Docker para persistencia de datos.
* `innovatech-network`: Red interna para comunicación entre contenedores.

---

## Endpoints disponibles

### Endpoint principal

```http
GET /
```

Respuesta esperada:

```json
{
  "mensaje": "Backend Innovatech Chile funcionando correctamente",
  "estado": "OK"
}
```

---

### Estado del Backend

```http
GET /api/health
```

Respuesta esperada:

```json
{
  "servicio": "innovatech-backend",
  "estado": "activo",
  "fecha": "2026-05-22T21:08:27.768Z"
}
```

Este endpoint permite comprobar que el Backend se encuentra activo y respondiendo correctamente.

---

### Lista de servicios DevOps

```http
GET /api/productos
```

Respuesta esperada:

```json
[
  {
    "id": 1,
    "nombre": "Servicio Cloud",
    "descripcion": "Migración Lift & Shift en AWS"
  },
  {
    "id": 2,
    "nombre": "Contenedorización",
    "descripcion": "Aplicaciones desplegadas con Docker"
  },
  {
    "id": 3,
    "nombre": "CI/CD",
    "descripcion": "Automatización con GitHub Actions"
  }
]
```

Este endpoint se conecta con MySQL, crea la tabla `productos` si no existe e inserta datos iniciales si la tabla está vacía.

---

## Variables de entorno

El proyecto utiliza las siguientes variables:

```env
PORT=3000
DB_HOST=mysql-db
DB_USER=root
DB_PASSWORD=root
DB_NAME=innovatech
DB_PORT=3306
```

Descripción:

| Variable    | Descripción                         |
| ----------- | ----------------------------------- |
| PORT        | Puerto donde se ejecuta el Backend  |
| DB_HOST     | Nombre del host de la base de datos |
| DB_USER     | Usuario de MySQL                    |
| DB_PASSWORD | Contraseña de MySQL                 |
| DB_NAME     | Nombre de la base de datos          |
| DB_PORT     | Puerto de MySQL                     |

En ejecución local sin Docker, `DB_HOST` puede ser `localhost`.

En ejecución con Docker Compose, `DB_HOST` debe ser `mysql-db`, porque ese es el nombre del servicio de MySQL dentro de la red Docker.

---

## Instalación local sin Docker

Para ejecutar el Backend sin Docker, primero se deben instalar las dependencias:

```bash
npm install
```

Luego se ejecuta el proyecto:

```bash
npm start
```

La API quedará disponible en:

```text
http://localhost:3000
```

Endpoint de prueba:

```text
http://localhost:3000/api/health
```

---

## Ejecución con Docker Compose

Para construir y levantar los contenedores:

```bash
docker compose up --build
```

Este comando construye la imagen del Backend y levanta los servicios definidos en `docker-compose.yml`.

Servicios levantados:

```text
innovatech-backend
innovatech-mysql
```

Para detener los servicios:

```bash
docker compose down
```

Para levantar los servicios en segundo plano:

```bash
docker compose up -d --build
```

Para ver los contenedores activos:

```bash
docker ps
```

Para ver los logs:

```bash
docker compose logs -f
```

---

## Dockerfile

El Dockerfile permite construir la imagen del Backend.

Características aplicadas:

* Uso de imagen liviana `node:24-alpine`.
* Directorio de trabajo `/app`.
* Instalación de dependencias con `npm install --omit=dev`.
* Copia de archivos necesarios.
* Creación de usuario no root.
* Exposición del puerto `3000`.
* Ejecución mediante `npm start`.

El uso de un usuario no root mejora la seguridad del contenedor, evitando que la aplicación se ejecute con privilegios de administrador.

---

## Docker Compose

El archivo `docker-compose.yml` define el stack del Backend.

Incluye:

* Servicio Backend.
* Servicio MySQL.
* Variables de entorno.
* Puertos expuestos.
* Red interna.
* Volumen persistente.
* Dependencia entre servicios.

La comunicación entre el Backend y MySQL se realiza a través de la red:

```yaml
innovatech-network
```

El Backend se conecta a MySQL usando el nombre del servicio:

```text
mysql-db
```

---

## Persistencia de datos

La persistencia de datos se implementa mediante un volumen Docker llamado:

```yaml
mysql_data
```

Este volumen se monta en la ruta interna de MySQL:

```text
/var/lib/mysql
```

Esto permite que los datos almacenados en la base de datos no se pierdan cuando los contenedores se detienen o reinician.

Se utiliza un **named volume** porque Docker administra su almacenamiento, lo que permite mayor orden, seguridad y facilidad de mantenimiento en comparación con un bind mount local.

---

## Prueba de persistencia

Para comprobar la persistencia:

1. Levantar los contenedores:

```bash
docker compose up --build
```

2. Acceder al endpoint:

```text
http://localhost:3000/api/productos
```

3. Detener los contenedores:

```bash
docker compose down
```

4. Volver a levantarlos:

```bash
docker compose up
```

5. Consultar nuevamente:

```text
http://localhost:3000/api/productos
```

Los datos seguirán existiendo gracias al volumen `mysql_data`.

---

## Comandos útiles

Construir y levantar servicios:

```bash
docker compose up --build
```

Levantar en segundo plano:

```bash
docker compose up -d --build
```

Detener servicios:

```bash
docker compose down
```

Detener servicios y eliminar volumen:

```bash
docker compose down -v
```

Ver contenedores activos:

```bash
docker ps
```

Ver imágenes Docker:

```bash
docker images
```

Ver logs:

```bash
docker compose logs -f
```

---

## Despliegue esperado en AWS EC2

Según la arquitectura definida para Innovatech Chile, el Backend debe desplegarse en una instancia EC2 privada.

La arquitectura esperada es:

```text
Internet
   |
EC2 Pública - Frontend
   |
EC2 Privada - Backend
   |
Base de datos MySQL
```

El Backend no debe ser accesible directamente desde Internet. Solo debe recibir tráfico desde la instancia del Frontend mediante reglas configuradas en los Security Groups.

---

## Seguridad

Medidas consideradas:

* El Backend se ejecuta en una instancia privada.
* La aplicación dentro del contenedor usa usuario no root.
* La base de datos se comunica solo dentro de la red Docker.
* Las credenciales deben manejarse mediante variables de entorno.
* En producción, las credenciales no deben almacenarse directamente en el repositorio.
* Para CI/CD se deben utilizar GitHub Secrets.

---

## CI/CD esperado

El pipeline de GitHub Actions debe ejecutarse al hacer push sobre la rama:

```text
deploy
```

Flujo esperado:

```text
Push a rama deploy
        |
GitHub Actions
        |
Build imagen Docker
        |
Push a Docker Hub o ECR
        |
Deploy automático en EC2 privada
```

Este flujo permite automatizar la entrega continua del Backend y reducir errores manuales durante el despliegue.

---

## Relación con DevOps

Este proyecto aplica principios DevOps mediante:

* Contenedorización con Docker.
* Automatización con Docker Compose.
* Separación de servicios.
* Uso de variables de entorno.
* Persistencia de datos.
* Preparación para CI/CD.
* Control de versiones con Git.
* Despliegue en infraestructura cloud AWS.

Estas prácticas favorecen la escalabilidad, mantenibilidad, trazabilidad y automatización del sistema.

---

## Estado actual del proyecto

Funcionalidades implementadas:

* API REST funcionando.
* Endpoint `/api/health`.
* Endpoint `/api/productos`.
* Conexión con MySQL.
* Creación automática de tabla.
* Inserción automática de datos iniciales.
* Dockerfile configurado.
* Docker Compose configurado.
* Volumen persistente configurado.
* Red interna Docker configurada.
* Backend probado localmente.
* Backend probado con Docker Compose.

---

## Evidencia de funcionamiento

Endpoints probados correctamente:

```text
http://localhost:3000/api/health
```

```text
http://localhost:3000/api/productos
```

Respuesta obtenida desde `/api/productos`:

```json
[
  {
    "id": 1,
    "nombre": "Servicio Cloud",
    "descripcion": "Migración Lift & Shift en AWS"
  },
  {
    "id": 2,
    "nombre": "Contenedorización",
    "descripcion": "Aplicaciones desplegadas con Docker"
  },
  {
    "id": 3,
    "nombre": "CI/CD",
    "descripcion": "Automatización con GitHub Actions"
  }
]
```

---

## Conclusión

El Backend de Innovatech Chile fue implementado correctamente utilizando Node.js, Express, MySQL, Docker y Docker Compose.

La solución permite ejecutar la API y la base de datos en contenedores separados, manteniendo la persistencia mediante volúmenes Docker. Además, queda preparada para ser desplegada en AWS EC2 y automatizada mediante GitHub Actions, cumpliendo con los requerimientos de contenedorización, persistencia, integración y despliegue solicitados en la Evaluación Parcial N°2.

```

Este README cubre lo que pide la pauta: documentación del repositorio, Dockerfile, Compose, persistencia, ejecución y explicación técnica. :contentReference[oaicite:0]{index=0}
```
