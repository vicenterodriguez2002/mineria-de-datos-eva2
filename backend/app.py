
from flask import Flask, jsonify, request
import joblib
import pandas as pd
import numpy as np
import json
import os

app = Flask(__name__)


def load_models():
    try:

        models = joblib.load('models.joblib')


        rules = []
        if os.path.exists('association_rules.json'):
            with open('association_rules.json', 'r') as f:
                rules = json.load(f)


        df = pd.read_csv('dataset_preparado.csv')

        return models, rules, df
    except Exception as e:
        print(f"Error cargando modelos: {e}")
        return None, [], pd.DataFrame()


models, association_rules, df = load_models()


@app.get("/health")
def health():
    status = "ok" if models is not None else "error"
    return jsonify({
        "status": status,
        "models_loaded": models is not None,
        "dataset_loaded": not df.empty
    })

@app.get("/")
def index():
    return jsonify({
        "message": "API Minería de Datos - Santo Tomás",
        "version": "1.0.0",
        "endpoints": {
            "/health": "Estado del servicio",
            "/stats": "Estadísticas del dataset",
            "/predict": "Predicción de respuesta (POST)",
            "/cluster": "Asignación de cluster (POST)",
            "/rules": "Reglas de asociación",
            "/clusters/info": "Información de clusters"
        }
    })


@app.get("/stats")
def get_stats():
    if df.empty:
        return jsonify({"error": "Dataset no disponible"}), 500

    stats = {
        "total_clientes": int(len(df)),
        "columnas": int(len(df.columns)),
        "respuestas_positivas": int(df['Response'].sum()),
        "tasa_conversion": float(df['Response'].mean()),
        "ingreso_promedio": float(df['Income'].mean()),
        "edad_promedio": float(df['Age'].mean()),
        "gasto_promedio": float(df['TotalSpend'].mean()),
        "educacion_distribution": df['Education'].value_counts().to_dict(),
        "estado_civil_distribution": df['Marital_Status'].value_counts().to_dict(),
        "campañas_aceptadas": {
            "campaña_1": int(df['AcceptedCmp1'].sum()),
            "campaña_2": int(df['AcceptedCmp2'].sum()),
            "campaña_3": int(df['AcceptedCmp3'].sum()),
            "campaña_4": int(df['AcceptedCmp4'].sum()),
            "campaña_5": int(df['AcceptedCmp5'].sum())
        }
    }

    return jsonify(stats)


@app.get("/diagnosticos_metricas")
def diagnosticos_metricas():
    try:

        df_original = pd.read_csv('dataset_original.csv')


        total_registros = len(df_original)


        total_aceptaciones = int(df_original['Response'].sum())


        total_rechazos = int((df_original['Response'] == 0).sum())


        tasa_aceptacion = (total_aceptaciones / total_registros) * 100 if total_registros else 0


        costo_unitario = df_original['Z_CostContact'].iloc[0] if total_registros > 0 else 0
        costo_global = int(costo_unitario * total_registros)


        ingreso_unitario = df_original['Z_Revenue'].iloc[0] if total_registros > 0 else 0
        ingreso_global = int(ingreso_unitario * total_aceptaciones)


        deficit = ingreso_global - costo_global


        punto_equilibrio = (costo_unitario / ingreso_unitario) * 100 if ingreso_unitario > 0 else 0


        total_columnas = int(len(df_original.columns))

        return jsonify({
            "base_historica": total_registros,
            "tasa_aceptacion": round(tasa_aceptacion, 1),
            "total_compradores": total_aceptaciones,
            "total_rechazos": total_rechazos,
            "desbalance": total_rechazos - total_aceptaciones,
            "costo_global": costo_global,
            "ingreso_global": ingreso_global,
            "deficit_sin_segmentar": deficit,
            "punto_equilibrio": round(punto_equilibrio, 1),
            "total_columnas": total_columnas,
        })
    except Exception as e:
        return jsonify({"error": f"Error calculando métricas: {str(e)}"}), 500


@app.post("/predict")
def predict():
    if models is None:
        return jsonify({"error": "Modelos no cargados"}), 500

    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Se requiere body JSON"}), 400


        education_encoded = models['label_encoder_education'].transform([data.get('Education', 'Graduation')])[0]
        marital_encoded = models['label_encoder_marital'].transform([data.get('Marital_Status', 'Married')])[0]


        features = [[
            data.get('Age', 50),
            data.get('Income', 50000),
            data.get('TotalSpend', 1000),
            data.get('TotalPurchases', 20),
            data.get('Recency', 30),
            data.get('NumWebVisitsMonth', 5),
            data.get('Kidhome', 0),
            data.get('Teenhome', 0),
            education_encoded,
            marital_encoded,
            data.get('MntWines', 0),
            data.get('MntFruits', 0),
            data.get('MntMeatProducts', 0),
            data.get('MntFishProducts', 0),
            data.get('MntSweetProducts', 0),
            data.get('MntGoldProds', 0),
            data.get('NumDealsPurchases', 0),
            data.get('NumWebPurchases', 0),
            data.get('NumCatalogPurchases', 0),
            data.get('NumStorePurchases', 0),
            data.get('AcceptedCmp1', 0),
            data.get('AcceptedCmp2', 0),
            data.get('AcceptedCmp3', 0),
            data.get('AcceptedCmp4', 0),
            data.get('AcceptedCmp5', 0),
            data.get('Complain', 0)
        ]]


        prediction = models['decision_tree'].predict(features)[0]
        probability = models['decision_tree'].predict_proba(features)[0]

        return jsonify({
            "prediccion": int(prediction),
            "respondera": bool(prediction == 1),
            "probabilidad_no_responder": float(probability[0]),
            "probabilidad_responder": float(probability[1]),
            "confianza": float(max(probability))
        })

    except Exception as e:
        return jsonify({"error": f"Error en predicción: {str(e)}"}), 400


@app.post("/cluster")
def assign_cluster():
    if models is None:
        return jsonify({"error": "Modelos no cargados"}), 500

    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Se requiere body JSON"}), 400


        features = [[
            data.get('Income', 50000),
            data.get('Age', 50),
            data.get('TotalSpend', 1000),
            data.get('TotalPurchases', 20),
            data.get('Recency', 30),
            data.get('NumWebVisitsMonth', 5),
            data.get('Kidhome', 0),
            data.get('Teenhome', 0)
        ]]


        features_scaled = models['scaler'].transform(features)


        cluster = models['kmeans'].predict(features_scaled)[0]


        centroid = models['kmeans'].cluster_centers_[cluster]
        distance = np.linalg.norm(features_scaled[0] - centroid)

        return jsonify({
            "cluster": int(cluster),
            "distancia_centroide": float(distance),
            "descripcion": get_cluster_description(int(cluster))
        })

    except Exception as e:
        return jsonify({"error": f"Error en clustering: {str(e)}"}), 400

def get_cluster_description(cluster):
    descriptions = {
        0: "Clientes de alto valor - Alto ingreso y alto gasto",
        1: "Clientes moderados - Ingreso y gasto medio",
        2: "Clientes de bajo valor - Bajo ingreso y bajo gasto",
        3: "Clientes potenciales - Alto potencial de conversión"
    }
    return descriptions.get(cluster, f"Cluster {cluster}")


@app.get("/rules")
def get_rules():
    if not association_rules:
        return jsonify({"error": "No hay reglas disponibles"}), 404

    return jsonify({
        "total_reglas": len(association_rules),
        "reglas": association_rules
    })


@app.get("/clusters/info")
def get_clusters_info():
    if models is None or df.empty:
        return jsonify({"error": "Modelos o dataset no disponibles"}), 500

    try:

        numeric_features = models['numeric_features']
        df_scaled = models['scaler'].transform(df[numeric_features])
        clusters = models['kmeans'].predict(df_scaled)
        df['Cluster'] = clusters


        cluster_info = []
        for cluster_id in sorted(df['Cluster'].unique()):
            cluster_df = df[df['Cluster'] == cluster_id]

            info = {
                "cluster": int(cluster_id),
                "cantidad_clientes": int(len(cluster_df)),
                "porcentaje": float(len(cluster_df) / len(df) * 100),
                "ingreso_promedio": float(cluster_df['Income'].mean()),
                "edad_promedio": float(cluster_df['Age'].mean()),
                "gasto_promedio": float(cluster_df['TotalSpend'].mean()),
                "tasa_conversion": float(cluster_df['Response'].mean()),
                "descripcion": get_cluster_description(int(cluster_id))
            }
            cluster_info.append(info)

        return jsonify({
            "total_clusters": len(cluster_info),
            "clusters": cluster_info
        })

    except Exception as e:
        return jsonify({"error": f"Error obteniendo info de clusters: {str(e)}"}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint no encontrado"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Error interno del servidor"}), 500


if __name__ == '__main__':
    print("Iniciando API Flask...")
    print(f"Modelos cargados: {models is not None}")
    print(f"Dataset cargado: {not df.empty}")
    print(f"Reglas de asociación: {len(association_rules)}")
    app.run(host='0.0.0.0', port=5000, debug=True)
