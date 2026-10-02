
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.cluster import KMeans
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder
import joblib
import json
import warnings
warnings.filterwarnings('ignore')


def load_and_preprocess_data(filepath):
    print("Cargando dataset...")
    df = pd.read_csv(filepath)
    print(f"Dataset cargado: {df.shape[0]} filas x {df.shape[1]} columnas")


    df_processed = df.copy()


    le_education = LabelEncoder()
    le_marital = LabelEncoder()

    df_processed['Education_encoded'] = le_education.fit_transform(df_processed['Education'])
    df_processed['Marital_Status_encoded'] = le_marital.fit_transform(df_processed['Marital_Status'])


    numeric_features = ['Income', 'Age', 'TotalSpend', 'TotalPurchases',
                       'Recency', 'NumWebVisitsMonth', 'Kidhome', 'Teenhome']


    scaler = StandardScaler()
    df_scaled = scaler.fit_transform(df_processed[numeric_features])

    return df_processed, df_scaled, le_education, le_marital, scaler, numeric_features


def train_kmeans(df_scaled, n_clusters=4):
    print(f"\nEntrenando K-Means con k={n_clusters}...")

    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(df_scaled)

    print(f"K-Means entrenado. Distribución de clusters:")
    unique, counts = np.unique(clusters, return_counts=True)
    for cluster, count in zip(unique, counts):
        print(f"  Cluster {cluster}: {count} clientes ({count/len(clusters)*100:.1f}%)")

    return kmeans, clusters


def train_decision_tree(df_processed):
    print("\nEntrenando Árbol de Decisión...")


    feature_columns = ['Age', 'Income', 'TotalSpend', 'TotalPurchases',
                      'Recency', 'NumWebVisitsMonth', 'Kidhome', 'Teenhome',
                      'Education_encoded', 'Marital_Status_encoded',
                      'MntWines', 'MntFruits', 'MntMeatProducts',
                      'MntFishProducts', 'MntSweetProducts', 'MntGoldProds',
                      'NumDealsPurchases', 'NumWebPurchases',
                      'NumCatalogPurchases', 'NumStorePurchases',
                      'AcceptedCmp1', 'AcceptedCmp2', 'AcceptedCmp3',
                      'AcceptedCmp4', 'AcceptedCmp5', 'Complain']

    X = df_processed[feature_columns]
    y = df_processed['Response']


    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )


    best_depth = 3
    best_accuracy = 0

    for depth in [3, 4, 5, 6, 7, 8]:
        dt = DecisionTreeClassifier(max_depth=depth, random_state=42)
        dt.fit(X_train, y_train)
        y_pred = dt.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        print(f"  max_depth={depth}: Accuracy={acc:.4f}")
        if acc > best_accuracy:
            best_accuracy = acc
            best_depth = depth


    dt_final = DecisionTreeClassifier(max_depth=best_depth, random_state=42)
    dt_final.fit(X_train, y_train)


    y_pred = dt_final.predict(X_test)
    print(f"\nMejor modelo: max_depth={best_depth}")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")

    return dt_final, feature_columns, best_depth


def train_apriori(df_processed):
    print("\nGenerando reglas de asociación (Apriori)...")


    df_assoc = pd.DataFrame()


    df_assoc['High_Income'] = (df_processed['Income'] > df_processed['Income'].median()).astype(int)
    df_assoc['High_Spend'] = (df_processed['TotalSpend'] > df_processed['TotalSpend'].median()).astype(int)
    df_assoc['High_Recency'] = (df_processed['Recency'] > df_processed['Recency'].median()).astype(int)
    df_assoc['Has_Kids'] = (df_processed['Kidhome'] > 0).astype(int)
    df_assoc['Has_Teens'] = (df_processed['Teenhome'] > 0).astype(int)
    df_assoc['Accepted_Campaign'] = df_processed['Response']


    df_assoc['Education'] = df_processed['Education']
    df_assoc['Marital_Status'] = df_processed['Marital_Status']


    transactions = []
    for _, row in df_assoc.iterrows():
        transaction = []
        if row['High_Income'] == 1:
            transaction.append('High_Income')
        if row['High_Spend'] == 1:
            transaction.append('High_Spend')
        if row['High_Recency'] == 1:
            transaction.append('High_Recency')
        if row['Has_Kids'] == 1:
            transaction.append('Has_Kids')
        if row['Has_Teens'] == 1:
            transaction.append('Has_Teens')
        if row['Accepted_Campaign'] == 1:
            transaction.append('Accepted_Campaign')
        transaction.append(f"Education_{row['Education']}")
        transaction.append(f"Marital_{row['Marital_Status']}")
        transactions.append(transaction)


    te = TransactionEncoder()
    te_ary = te.fit(transactions).transform(transactions)
    df_trans = pd.DataFrame(te_ary, columns=te.columns_)


    frequent_itemsets = apriori(df_trans, min_support=0.1, use_colnames=True)

    if len(frequent_itemsets) > 0:
        rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.5)
        rules = rules.sort_values('lift', ascending=False).head(10)

        print(f"Se encontraron {len(rules)} reglas de asociación")
        print("\nTop 5 reglas por lift:")
        for idx, rule in rules.head().iterrows():
            print(f"  {list(rule['antecedents'])} -> {list(rule['consequents'])}")
            print(f"    Soporte: {rule['support']:.3f}, Confianza: {rule['confidence']:.3f}, Lift: {rule['lift']:.3f}")
    else:
        rules = pd.DataFrame()
        print("No se encontraron reglas con los umbrales especificados")

    return rules


def save_models(kmeans, dt_final, le_education, le_marital, scaler,
                feature_columns, rules, numeric_features):
    print("\nGuardando modelos...")

    models = {
        'kmeans': kmeans,
        'decision_tree': dt_final,
        'label_encoder_education': le_education,
        'label_encoder_marital': le_marital,
        'scaler': scaler,
        'feature_columns': feature_columns,
        'numeric_features': numeric_features
    }

    joblib.dump(models, 'models.joblib')
    print("Modelos guardados en 'models.joblib'")


    if not rules.empty:
        rules_dict = []
        for _, rule in rules.iterrows():
            rules_dict.append({
                'antecedents': list(rule['antecedents']),
                'consequents': list(rule['consequents']),
                'support': float(rule['support']),
                'confidence': float(rule['confidence']),
                'lift': float(rule['lift'])
            })
        with open('association_rules.json', 'w') as f:
            json.dump(rules_dict, f, indent=2)
        print("Reglas guardadas en 'association_rules.json'")


def main():
    print("=" * 60)
    print("ENTRENAMIENTO DE MODELOS - MINERÍA DE DATOS")
    print("=" * 60)


    df_processed, df_scaled, le_education, le_marital, scaler, numeric_features =\
        load_and_preprocess_data('dataset_preparado.csv')


    kmeans, clusters = train_kmeans(df_scaled, n_clusters=4)
    dt_final, feature_columns, best_depth = train_decision_tree(df_processed)
    rules = train_apriori(df_processed)


    save_models(kmeans, dt_final, le_education, le_marital, scaler,
                feature_columns, rules, numeric_features)

    print("\n" + "=" * 60)
    print("ENTRENAMIENTO COMPLETADO EXITOSAMENTE")
    print("=" * 60)

if __name__ == '__main__':
    main()
