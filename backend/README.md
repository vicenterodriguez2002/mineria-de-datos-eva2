# API de Minería de Datos

Backend Flask para consultar el dataset oficial y las métricas de la campaña.

## Estructura

- `app/main.py`: inicia Flask, carga el Excel y registra las rutas.
- `app/rutas.py`: define los endpoints y las respuestas HTTP.
- `app/servicios.py`: ubica y lee el Excel; calcula estadísticas y métricas.
- `data/dataset_que_usaremos_oficial.xlsx`: dataset oficial sin modificaciones.

## Iniciar localmente

Desde la carpeta `backend`, instalar dependencias y ejecutar:

```powershell
python -m pip install -r requirements.txt
python -m app.main
```

La API queda disponible en `http://127.0.0.1:5000`. Para revisar su estado: `http://127.0.0.1:5000/health`.

## Endpoints disponibles

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/` | Lista los endpoints disponibles. |
| GET | `/health` | Indica si el dataset se cargó. |
| GET | `/stats` | Devuelve estadísticas del dataset. |
| GET | `/diagnosticos_metricas` | Devuelve métricas de la campaña. |
| GET | `/api/clientes?buscar=5524&limite=20` | Busca por ID y devuelve hasta 20 ID. Sin `buscar`, devuelve los primeros 20. |
| GET | `/api/clientes-solo-id` | Devuelve `{"clientes": [{"ID": 5524}, ...]}`. |
| GET | `/api/clientes/<id>` | Devuelve las 29 columnas originales de un cliente, incluidos los valores vacíos como `null`. |

## Iniciar con Docker

Desde la carpeta `backend`:

```powershell
docker compose up --build
```

Con Docker Compose, los cambios en archivos `.py` de `app/` recargan la API automáticamente. Si cambias `requirements.txt`, el `Dockerfile` o el Excel, vuelve a construir o reiniciar el contenedor.

`/stats` y `/diagnosticos_metricas` consultan el Excel oficial. `edad_promedio` se calcula con respecto a 2014, el año de la campaña histórica, y `gasto_promedio` suma las seis columnas `Mnt...` para cada cliente. Estos cálculos no modifican el archivo.
