
from flask import Flask

from app.rutas import registrar_rutas
from app.servicios import cargar_dataset


app = Flask(__name__)
app.json.sort_keys = False
datos = cargar_dataset()
registrar_rutas(app, datos)


if __name__ == "__main__":
    print("Iniciando API Flask...")
    print(f"Dataset cargado: {not datos.empty}")
    app.run(host="0.0.0.0", port=5000, debug=True)
