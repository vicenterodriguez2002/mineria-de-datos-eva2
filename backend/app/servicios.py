
from pathlib import Path

import pandas as pd


RUTA_DATASET = Path(__file__).resolve().parents[1] / "data" / "dataset_que_usaremos_oficial.xlsx"


def cargar_dataset():
    if not RUTA_DATASET.exists():
        print(f"Dataset no encontrado: {RUTA_DATASET}")
        return pd.DataFrame()
    return pd.read_excel(RUTA_DATASET)


def obtener_estadisticas(datos):
    columnas_gasto = [
        "MntWines", "MntFruits", "MntMeatProducts",
        "MntFishProducts", "MntSweetProducts", "MntGoldProds",
    ]
    return {
        "total_clientes": int(len(datos)),
        "columnas": int(len(datos.columns)),
        "respuestas_positivas": int(datos["Response"].sum()),
        "tasa_conversion": float(datos["Response"].mean()),
        "ingreso_promedio": float(datos["Income"].mean()),
        "edad_promedio": float((2014 - datos["Year_Birth"]).mean()),
        "gasto_promedio": float(datos[columnas_gasto].sum(axis=1).mean()),
        "educacion_distribution": datos["Education"].value_counts().to_dict(),
        "estado_civil_distribution": datos["Marital_Status"].value_counts().to_dict(),
        "campañas_aceptadas": {
            f"campaña_{numero}": int(datos[f"AcceptedCmp{numero}"].sum())
            for numero in range(1, 6)
        },
    }


COLUMNAS_CLIENTE = [
    "ID",
    "Year_Birth",
    "Education",
    "Marital_Status",
    "Income",
    "Kidhome",
    "Teenhome",
    "Dt_Customer",
    "Recency",
    "MntWines",
    "MntFruits",
    "MntMeatProducts",
    "MntFishProducts",
    "MntSweetProducts",
    "MntGoldProds",
    "NumDealsPurchases",
    "NumWebPurchases",
    "NumCatalogPurchases",
    "NumStorePurchases",
    "NumWebVisitsMonth",
    "AcceptedCmp1",
    "AcceptedCmp2",
    "AcceptedCmp3",
    "AcceptedCmp4",
    "AcceptedCmp5",
    "Complain",
    "Z_CostContact",
    "Z_Revenue",
    "Response",
]


def _valor_json(valor):
    if valor is None or pd.isna(valor):
        return None
    if isinstance(valor, pd.Timestamp):
        return valor.strftime("%Y-%m-%d")
    if hasattr(valor, "item"):
        valor = valor.item()
    if isinstance(valor, float) and valor.is_integer():
        return int(valor)
    return valor


def obtener_clientes(datos, cliente_id=None):
    columnas = [columna for columna in COLUMNAS_CLIENTE if columna in datos.columns]
    frame = datos.loc[:, columnas]
    if cliente_id is not None and str(cliente_id).strip():
        buscado = str(cliente_id).strip()
        frame = frame[frame["ID"].astype(str) == buscado]
        if frame.empty:
            return None
        fila = frame.iloc[0]
        return {columna: _valor_json(fila[columna]) for columna in columnas}

    registros = []
    for _, fila in frame.iterrows():
        registros.append({columna: _valor_json(fila[columna]) for columna in columnas})
    return {"count": len(registros), "clientes": registros}


def obtener_ids_clientes(datos):
    return {"clientes": [{"ID": _valor_json(valor)} for valor in datos["ID"]]}


def buscar_clientes(datos, buscar, limite):
    coincidencias = datos
    if buscar:
        coincidencias = datos[datos["ID"].astype(str).str.contains(buscar, regex=False, na=False)]
    clientes = obtener_ids_clientes(coincidencias.head(limite))["clientes"]
    return {"count": len(clientes), "clientes": clientes}


def obtener_metricas_diagnostico(datos):
    total_registros = len(datos)
    total_aceptaciones = int(datos["Response"].sum())
    total_rechazos = int((datos["Response"] == 0).sum())
    tasa_aceptacion = (total_aceptaciones / total_registros) * 100 if total_registros else 0
    costo_unitario = datos["Z_CostContact"].iloc[0] if total_registros else 0
    costo_global = int(costo_unitario * total_registros)
    ingreso_unitario = datos["Z_Revenue"].iloc[0] if total_registros else 0
    ingreso_global = int(ingreso_unitario * total_aceptaciones)
    deficit = ingreso_global - costo_global
    punto_equilibrio = (costo_unitario / ingreso_unitario) * 100 if ingreso_unitario > 0 else 0

    return {
        "base_historica": total_registros,
        "tasa_aceptacion": round(tasa_aceptacion, 1),
        "total_compradores": total_aceptaciones,
        "total_rechazos": total_rechazos,
        "desbalance": total_rechazos - total_aceptaciones,
        "costo_global": costo_global,
        "ingreso_global": ingreso_global,
        "deficit_sin_segmentar": deficit,
        "punto_equilibrio": round(punto_equilibrio, 1),
        "total_columnas": int(len(datos.columns)),
        "z_cost": int(costo_unitario),
        "z_revenue": int(ingreso_unitario),
    }
