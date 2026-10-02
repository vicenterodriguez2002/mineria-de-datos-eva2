
from flask import jsonify, request

from app.servicios import (
    buscar_clientes,
    obtener_clientes,
    obtener_estadisticas,
    obtener_ids_clientes,
    obtener_metricas_diagnostico,
)


def registrar_rutas(app, datos):
    @app.get("/")
    def inicio():
        return jsonify({
            "message": "API Minería de Datos - Santo Tomás",
            "version": "1.0.0",
            "endpoints": {
                "/health": "Estado del servicio",
                "/stats": "Estadísticas del dataset",
                "/diagnosticos_metricas": "Métricas de la campaña",
                "/api/clientes?buscar=ID&limite=20": "Busca clientes por ID",
                "/api/clientes-solo-id": "Solo los ID de los clientes",
                "/api/clientes/<id>": "Datos de un cliente por ID",
            },
        })

    @app.get("/health")
    def estado():
        dataset_loaded = not datos.empty
        return jsonify({
            "status": "ok" if dataset_loaded else "error",
            "dataset_loaded": dataset_loaded,
        })



    @app.get("/api/clientes")
    def datos_clientes():
        if datos.empty:
            return jsonify({"error": "Dataset no disponible"}), 500
        buscar = request.args.get("buscar", "").strip()
        try:
            limite = min(max(int(request.args.get("limite", 20)), 1), 20)
        except ValueError:
            return jsonify({"error": "limite debe ser un número entero"}), 400
        return jsonify(buscar_clientes(datos, buscar, limite))

    @app.get("/api/clientes-solo-id")
    def clientes_solo_id():
        if datos.empty:
            return jsonify({"error": "Dataset no disponible"}), 500
        return jsonify(obtener_ids_clientes(datos))

    @app.get("/api/clientes/<id>")
    def datos_cliente(id):
        if datos.empty:
            return jsonify({"error": "Dataset no disponible"}), 500
        try:
            resultado = obtener_clientes(datos, id)
        except Exception as error:
            return jsonify({"error": f"Error leyendo clientes: {error}"}), 500
        if resultado is None:
            return jsonify({"error": f"Cliente {id} no encontrado."}), 404
        return jsonify(resultado)
   
    @app.get("/stats")
    def estadisticas():
        if datos.empty:
            return jsonify({"error": "Dataset no disponible"}), 500
        return jsonify(obtener_estadisticas(datos))


    @app.get("/diagnosticos_metricas")
    def diagnosticos_metricas():
        try:
            return jsonify(obtener_metricas_diagnostico(datos))
        except Exception as error:
            return jsonify({"error": f"Error calculando métricas: {error}"}), 500

    @app.errorhandler(404)
    def ruta_no_encontrada(error):
        return jsonify({"error": "Endpoint no encontrado"}), 404

    @app.errorhandler(500)
    def error_interno(error):
        return jsonify({"error": "Error interno del servidor"}), 500
