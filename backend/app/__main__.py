from app import app, association_rules, df, models


def main():
    print("Iniciando API Flask...")
    print(f"Modelos cargados: {models is not None}")
    print(f"Dataset cargado: {not df.empty}")
    print(f"Reglas de asociación: {len(association_rules)}")
    app.run(host="0.0.0.0", port=5000, debug=True)


if __name__ == "__main__":
    main()
