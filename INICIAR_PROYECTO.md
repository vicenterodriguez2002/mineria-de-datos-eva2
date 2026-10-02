# Cómo iniciar el proyecto

Estas instrucciones usan PowerShell en Windows. Abre **dos terminales** en la carpeta raíz del repositorio (`MINERIA`): una para el backend y otra para el frontend. Necesitas Python 3.11 o posterior y Node.js con npm. Docker Desktop es opcional.

## 1. Iniciar el backend

En la primera terminal:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m app.main
```

Si `.venv` ya existe, omite `python -m venv .venv`. Deja esta terminal abierta. Comprueba `http://127.0.0.1:5000/health`: debe mostrar `"dataset_loaded": true`. Las métricas están en `http://127.0.0.1:5000/diagnosticos_metricas` y las estadísticas en `http://127.0.0.1:5000/stats`.

El backend lee `backend/data/dataset_que_usaremos_oficial.xlsx`. No hay que mover ni cambiar de nombre el Excel.

### Alternativa con Docker

Con Docker Desktop iniciado, desde `backend` ejecuta en lugar de los comandos Python:

```powershell
docker compose up --build
```

Usa las mismas direcciones del puerto 5000. Para detenerlo, presiona `Ctrl+C` en esa terminal.
Los cambios en archivos `.py` de `backend/app/` recargan la API dentro de Docker automáticamente. Para cambios en dependencias o en el Excel, reinicia o reconstruye el contenedor.
No ejecutes a la vez el backend local y el de Docker: ambos usan el puerto 5000. Si quedó un contenedor de una versión anterior reiniciándose, detén el backend local y ejecuta `docker compose up -d --build --force-recreate` desde `backend`.

## 2. Iniciar el frontend

En la segunda terminal, desde la raíz `MINERIA`:

```powershell
cd mineriadedatosv1
Copy-Item .env.example .env.local
npm ci
npm run dev
```

Abre `http://localhost:3000`. Si `.env.local` ya existe, conserva su contenido y verifica que tenga `API_URL=http://127.0.0.1:5000`.

La página de diagnóstico obtiene las métricas reales del backend. El selector muestra los primeros 20 ID al abrirse y busca hasta 20 coincidencias por consulta. Al elegir uno, Next.js pide `/api/clientes/<id>` y rellena el formulario. Los campos nulos y las cantidades `Kidhome` o `Teenhome` iguales a `0` no se muestran; las campañas se eligen con «No/Sí» y ningún número puede ser negativo. El cliente se puede evaluar aunque falten datos: si falta `Income`, la evaluación de demostración usa los demás datos sin inventar un ingreso. Junto al buscador, **Bloquear formulario** impide editar los campos sin impedir la evaluación; **Restablecer datos** recupera los valores originales del cliente seleccionado sin perder su ID. `ID`, `Response`, `Z_CostContact` y `Z_Revenue` vienen en el detalle, pero no son campos editables del evaluador. Evaluación y resultado siguen usando datos de demostración mientras no existan sus endpoints en Flask.

## Si algo no inicia

- `ModuleNotFoundError`: ejecuta la instalación de `requirements.txt` con el Python de `.venv` indicado arriba.
- Puerto 5000 ocupado: detén otra instancia del backend antes de iniciarlo.
- Diagnóstico en modo demo: revisa que el backend siga abierto y que `.env.local` tenga la URL indicada; reinicia `npm run dev` después de cambiarla.
- Para detener cada servidor local, presiona `Ctrl+C` en su terminal.
