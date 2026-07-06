# Innovatech Chile | Backend DevOps

Backend de la plataforma **Innovatech Chile**, desarrollado con Node.js, Express y MySQL. El proyecto forma parte de la **Evaluación Final Transversal** de la asignatura **ISY1101 – Introducción a Herramientas DevOps**.

La solución implementa contenedorización local con Docker Compose, publicación de imágenes en Docker Hub, automatización CI/CD con GitHub Actions y despliegue orquestado en Amazon EKS.

---

## Integrantes

- Jaime Manzo
- Martin Silva

---

## Objetivo

Implementar y desplegar una API REST para Innovatech Chile, integrando:

- Backend Node.js con Express.
- Base de datos MySQL.
- Contenedores Docker.
- Ejecución local mediante Docker Compose.
- Publicación de imágenes versionadas en Docker Hub.
- Pipeline CI/CD mediante GitHub Actions.
- Despliegue automatizado en Amazon EKS.

---

## Arquitectura general

```text
Usuario
  |
  v
Load Balancer público de AWS
  |
  v
Frontend (2 réplicas)
  |
  v
backend-service:3000
  |
  v
Backend Node.js + Express (2 réplicas)
  |
  v
MySQL
```

Flujo CI/CD:

```text
Push a rama deploy
  |
  v
GitHub Actions
  |
  ├── Instala dependencias
  ├── Ejecuta pruebas disponibles
  ├── Construye imagen Docker
  ├── Publica imagen en Docker Hub
  ├── Se conecta a Amazon EKS
  └── Actualiza el Deployment del backend
```

---

## Tecnologías utilizadas

- Node.js
- Express
- MySQL 8.0
- Docker
- Docker Compose
- Git y GitHub
- GitHub Actions
- Docker Hub
- Amazon Web Services
- Amazon EKS
- Kubernetes
- Nginx
- React / Vite

---

## Estructura del proyecto

```text
innovatech-backend
├── .github/
│   └── workflows/
│       └── backend-eks.yml
├── src/
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

---

## Servicios de la solución

| Servicio | Tecnología | Puerto | Función |
|---|---|---:|---|
| Frontend | React + Nginx | 8080 local / 80 cloud | Interfaz visual pública |
| Backend | Node.js + Express | 3000 | API REST y lógica de negocio |
| MySQL | MySQL 8.0 | 3306 | Persistencia de productos |
| EKS | Kubernetes administrado | - | Orquestación en la nube |

---

## Variables de entorno

El backend utiliza las siguientes variables:

```env
PORT=3000
DB_HOST=mysql-db
DB_USER=root
DB_PASSWORD=root
DB_NAME=innovatech
DB_PORT=3306
```

| Variable | Descripción |
|---|---|
| `PORT` | Puerto donde se ejecuta el backend |
| `DB_HOST` | Host de MySQL |
| `DB_USER` | Usuario de MySQL |
| `DB_PASSWORD` | Contraseña de MySQL |
| `DB_NAME` | Nombre de la base de datos |
| `DB_PORT` | Puerto de MySQL |

> En Docker Compose, `DB_HOST` utiliza el nombre del servicio `mysql-db`.  
> En Kubernetes, el backend se comunica mediante el servicio interno de MySQL.

Las credenciales reales no deben almacenarse en GitHub. Para CI/CD se utilizan GitHub Secrets.

---

## Endpoints disponibles

### Estado del backend

```http
GET /api/health
```

Permite comprobar que el backend se encuentra activo.

Ejemplo:

```json
{
  "servicio": "innovatech-backend",
  "estado": "activo"
}
```

### Productos DevOps

```http
GET /api/productos
```

Obtiene los productos almacenados en MySQL.

Ejemplo de datos:

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

# Ejecución local con Docker Compose

## Requisitos

- Docker Desktop instalado y ejecutándose.
- Repositorios ubicados en carpetas vecinas:

```text
innovatech-ep2
├── innovatech-backend
└── innovatech-frontend
```

## Levantar todos los servicios

Ubicarse dentro de la carpeta `innovatech-backend` y ejecutar:

```bash
docker compose up --build
```

Este comando levanta:

```text
innovatech-frontend
innovatech-backend
innovatech-mysql
```

También crea:

- Red interna `innovatech-network`.
- Volumen persistente `mysql_data`.

## Ejecución en segundo plano

```bash
docker compose up -d --build
```

## Verificar contenedores activos

```bash
docker ps
```

Se deben visualizar los servicios:

```text
innovatech-frontend
innovatech-backend
innovatech-mysql
```

## Detener contenedores

```bash
docker compose down
```

## Eliminar contenedores y volumen local

```bash
docker compose down -v
```

> El parámetro `-v` elimina también los datos locales almacenados en el volumen MySQL.

---

## Pruebas locales

Frontend:

```text
http://localhost:8080
```

Estado del backend:

```text
http://localhost:3000/api/health
```

Productos:

```text
http://localhost:3000/api/productos
```

---

# Dockerfile y seguridad

El backend utiliza una imagen basada en:

```text
node:24-alpine
```

Buenas prácticas aplicadas:

- Imagen base liviana Alpine.
- Instalación de dependencias de producción.
- Archivo `.dockerignore`.
- Usuario no root dentro del contenedor.
- Puerto mínimo expuesto: `3000`.
- Configuración mediante variables de entorno.

Estas medidas reducen el tamaño de la imagen y limitan privilegios innecesarios del proceso.

---

# Persistencia local

Docker Compose utiliza un volumen llamado:

```text
mysql_data
```

El volumen se conecta a:

```text
/var/lib/mysql
```

Esto permite que MySQL mantenga los datos aunque los contenedores se detengan o reinicien.

---

# Imágenes Docker Hub

Las imágenes publicadas son:

```text
jaimeing/innovatech-backend
jaimeing/innovatech-frontend
```

Cada pipeline publica dos tipos de tags:

```text
latest
hash-del-commit
```

Ejemplo:

```text
jaimeing/innovatech-backend:latest
jaimeing/innovatech-backend:c43a6dc...
```

Los tags por hash permiten trazabilidad entre:

```text
Commit de GitHub
→ GitHub Actions
→ Imagen Docker Hub
→ Deployment desplegado en EKS
```

---

# CI/CD con GitHub Actions

El workflow principal del backend está ubicado en:

```text
.github/workflows/backend-eks.yml
```

Se ejecuta cuando existe un push en la rama:

```text
deploy
```

Etapas del pipeline:

1. Descargar código.
2. Configurar Node.js.
3. Instalar dependencias con `npm ci`.
4. Ejecutar pruebas disponibles.
5. Iniciar sesión en Docker Hub.
6. Construir la imagen Docker.
7. Publicar imagen con `latest` y hash de commit.
8. Configurar credenciales temporales AWS.
9. Conectar con el clúster EKS.
10. Actualizar la imagen del Deployment `backend`.
11. Esperar que el rollout finalice correctamente.

El despliegue utiliza una actualización gradual de Kubernetes, evitando interrumpir completamente el servicio durante la publicación de una nueva versión.

---

## GitHub Secrets utilizados

Los valores nunca se publican dentro del repositorio.

```text
DOCKER_USERNAME
DOCKER_PASSWORD
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN
```

Variables no sensibles:

```text
AWS_REGION=us-east-1
EKS_CLUSTER=innovatech-eks
```

---

# Despliegue en Amazon EKS

La solución fue desplegada en el clúster:

```text
innovatech-eks
```

Namespace utilizado:

```text
innovatech
```

Recursos desplegados:

```text
Frontend: 2 réplicas
Backend: 2 réplicas
MySQL: 1 réplica
Frontend Service: LoadBalancer público
Backend Service: ClusterIP interno
MySQL Service: ClusterIP interno
```

Comandos de validación utilizados:

```bash
kubectl get nodes
kubectl get pods -n innovatech
kubectl get svc -n innovatech
kubectl get deployments -n innovatech
```

Validación de la imagen desplegada:

```bash
kubectl get deployment backend -n innovatech \
  -o jsonpath='{.spec.template.spec.containers[0].image}'; echo
```

---

## Validación interna del backend

Prueba de salud del backend dentro de Kubernetes:

```bash
kubectl run prueba-backend \
  -n innovatech \
  --rm -i \
  --restart=Never \
  --image=curlimages/curl:8.10.1 \
  -- curl -s http://backend-service:3000/api/health
```

Prueba de productos y conexión con MySQL:

```bash
kubectl run prueba-productos \
  -n innovatech \
  --rm -i \
  --restart=Never \
  --image=curlimages/curl:8.10.1 \
  -- curl -s http://backend-service:3000/api/productos
```

Estas pruebas permitieron comprobar la comunicación:

```text
Frontend
→ backend-service
→ Backend Node.js
→ MySQL
```

---

# Observabilidad

Durante la validación se utilizaron:

```bash
kubectl get pods -n innovatech
kubectl get deployments -n innovatech
kubectl get svc -n innovatech
kubectl logs deployment/backend -n innovatech --tail=50
```

También se revisaron los logs de GitHub Actions para validar las etapas de build, test, push y deploy.

---

# Limitaciones y mejoras futuras

Durante el laboratorio AWS Academy se aplicaron restricciones de presupuesto y permisos IAM.

Limitaciones identificadas:

- El autoscaling automático mediante HPA no quedó implementado.
- Frontend y backend utilizan dos réplicas fijas para disponibilidad básica.
- MySQL en EKS quedó como demostración, sin persistencia productiva validada mediante EBS CSI.
- El presupuesto del laboratorio AWS Academy se agotó después de completar el despliegue y las validaciones.

Mejoras propuestas:

1. Implementar Horizontal Pod Autoscaler para frontend y backend.
2. Configurar PersistentVolumeClaim con EBS CSI para MySQL.
3. Migrar MySQL a Amazon RDS para un entorno productivo.
4. Configurar GitHub OIDC con IAM Role, evitando credenciales temporales.
5. Agregar análisis automático de vulnerabilidades.
6. Incorporar monitoreo persistente mediante CloudWatch.

---

# Estado del proyecto

| Elemento | Estado |
|---|---|
| Backend Node.js + Express | Implementado |
| MySQL en Docker | Implementado |
| Dockerfile optimizado | Implementado |
| Docker Compose local | Implementado |
| Frontend + Backend + MySQL local | Implementado |
| Docker Hub con tags | Implementado |
| GitHub Actions backend | Implementado |
| GitHub Actions frontend | Implementado |
| EKS con frontend y backend | Implementado |
| Load Balancer público | Implementado |
| Réplicas de frontend y backend | Implementado |
| HPA automático | Mejora futura |
| Persistencia productiva MySQL en EKS | Mejora futura |

---

# Conclusión

Innovatech Chile implementa una solución DevOps basada en contenedores, automatización y orquestación en la nube.

El proyecto demuestra un flujo completo desde desarrollo local hasta despliegue en Kubernetes:

```text
Docker Compose local
→ GitHub
→ GitHub Actions
→ Docker Hub
→ Amazon EKS
→ Aplicación disponible mediante Load Balancer
```

La solución permite mantener trazabilidad mediante tags de imágenes, automatizar actualizaciones mediante pipelines y operar frontend, backend y base de datos como servicios separados.