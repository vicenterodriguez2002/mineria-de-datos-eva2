import pandas as pd
import requests
import json


df = pd.read_excel(r'C:\Users\Laboratorio\Downloads\Api-Backend\Api-Backend\backend\dataset_original.xlsx')

print('=' * 60)
print('DATOS DEL DATASET ORIGINAL')
print('=' * 60)
print(f'Total registros: {len(df)}')
print(f'Total columnas: {len(df.columns)}')
print(f'Response=1 (aceptaron): {(df["Response"]==1).sum()}')
print(f'Response=0 (rechazaron): {(df["Response"]==0).sum()}')
print(f'Z_CostContact (unitario): {df["Z_CostContact"].iloc[0]}')
print(f'Z_Revenue (unitario): {df["Z_Revenue"].iloc[0]}')


total_registros = len(df)
total_aceptaciones = int((df['Response']==1).sum())
total_rechazos = int((df['Response']==0).sum())
tasa_aceptacion = (total_aceptaciones / total_registros) * 100
costo_unitario = df['Z_CostContact'].iloc[0]
ingreso_unitario = df['Z_Revenue'].iloc[0]
costo_global = int(costo_unitario * total_registros)
ingreso_global = int(ingreso_unitario * total_aceptaciones)
deficit = ingreso_global - costo_global
punto_equilibrio = (costo_unitario / ingreso_unitario) * 100

print(f'\n{'=' * 60}')
print('METRICAS CALCULADAS DESDE DATASET')
print('=' * 60)
print(f'Base historica: {total_registros}')
print(f'Tasa aceptacion: {tasa_aceptacion:.1f}%')
print(f'Compradores: {total_aceptaciones}')
print(f'Rechazos: {total_rechazos}')
print(f'Desbalance: {total_rechazos - total_aceptaciones}')
print(f'Costo global: {costo_global}')
print(f'Ingreso global: {ingreso_global}')
print(f'Deficit: {deficit}')
print(f'Punto equilibrio: {punto_equilibrio:.1f}%')
print(f'Total columnas: {len(df.columns)}')


print(f'\n{'=' * 60}')
print('DATOS DE LA API (/diagnosticos_metricas)')
print('=' * 60)
try:
    response = requests.get('http://127.0.0.1:5000/diagnosticos_metricas')
    api_data = response.json()

    print(f'Base historica: {api_data["base_historica"]}')
    print(f'Tasa aceptacion: {api_data["tasa_aceptacion"]}%')
    print(f'Compradores: {api_data["total_compradores"]}')
    print(f'Rechazos: {api_data["total_rechazos"]}')
    print(f'Desbalance: {api_data["desbalance"]}')
    print(f'Costo global: {api_data["costo_global"]}')
    print(f'Ingreso global: {api_data["ingreso_global"]}')
    print(f'Deficit: {api_data["deficit_sin_segmentar"]}')
    print(f'Punto equilibrio: {api_data["punto_equilibrio"]}%')
    print(f'Total columnas: {api_data["total_columnas"]}')


    print(f'\n{'=' * 60}')
    print('COMPARACIÓN DATASET vs API')
    print('=' * 60)

    comparaciones = [
        ('Base historica', total_registros, api_data['base_historica']),
        ('Tasa aceptacion', round(tasa_aceptacion, 1), api_data['tasa_aceptacion']),
        ('Compradores', total_aceptaciones, api_data['total_compradores']),
        ('Rechazos', total_rechazos, api_data['total_rechazos']),
        ('Desbalance', total_rechazos - total_aceptaciones, api_data['desbalance']),
        ('Costo global', costo_global, api_data['costo_global']),
        ('Ingreso global', ingreso_global, api_data['ingreso_global']),
        ('Deficit', deficit, api_data['deficit_sin_segmentar']),
        ('Punto equilibrio', round(punto_equilibrio, 1), api_data['punto_equilibrio']),
        ('Total columnas', len(df.columns), api_data['total_columnas']),
    ]

    all_match = True
    for nombre, dataset_val, api_val in comparaciones:
        match = dataset_val == api_val
        status = '✅' if match else '❌'
        print(f'{status} {nombre}: Dataset={dataset_val} | API={api_val}')
        if not match:
            all_match = False

    print(f'\n{'=' * 60}')
    if all_match:
        print('✅ TODOS LOS DATOS COINCIDEN CORRECTAMENTE')
    else:
        print('❌ HAY DIFERENCIAS ENTRE DATASET Y API')
    print('=' * 60)

except Exception as e:
    print(f'❌ Error obteniendo datos de la API: {e}')
