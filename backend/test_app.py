import unittest
import json
import app as app_module


class TestApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app_module.app.testing = True
        cls.client = app_module.app.test_client()

    def test_health(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "ok")
        self.assertTrue(data["models_loaded"])
        self.assertTrue(data["dataset_loaded"])

    def test_index(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("endpoints", data)
        self.assertIn("/predict", data["endpoints"])
        self.assertIn("/cluster", data["endpoints"])

    def test_stats(self):
        response = self.client.get("/stats")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["total_clientes"], 2052)
        self.assertGreater(data["tasa_conversion"], 0)
        self.assertLess(data["tasa_conversion"], 1)

    def test_diagnosticos_metricas(self):
        response = self.client.get("/diagnosticos_metricas")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["base_historica"], 2240)
        self.assertEqual(data["tasa_aceptacion"], 14.9)
        self.assertEqual(data["total_compradores"], 334)
        self.assertEqual(data["total_rechazos"], 1906)
        self.assertEqual(data["costo_global"], 6720)
        self.assertEqual(data["ingreso_global"], 3674)
        self.assertEqual(data["deficit_sin_segmentar"], -3046)
        self.assertEqual(data["punto_equilibrio"], 27.3)

    def test_predict_valido(self):
        payload = {
            "Age": 50,
            "Income": 50000,
            "TotalSpend": 1000,
            "TotalPurchases": 20,
            "Recency": 30,
            "NumWebVisitsMonth": 5,
            "Kidhome": 0,
            "Teenhome": 1,
            "Education": "Graduation",
            "Marital_Status": "Married",
            "MntWines": 500,
            "MntFruits": 50,
            "MntMeatProducts": 200,
            "MntFishProducts": 100,
            "MntSweetProducts": 50,
            "MntGoldProds": 50,
            "NumDealsPurchases": 2,
            "NumWebPurchases": 5,
            "NumCatalogPurchases": 3,
            "NumStorePurchases": 10,
            "AcceptedCmp1": 0,
            "AcceptedCmp2": 0,
            "AcceptedCmp3": 0,
            "AcceptedCmp4": 0,
            "AcceptedCmp5": 0,
            "Complain": 0
        }
        response = self.client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn(data["prediccion"], [0, 1])
        self.assertIsInstance(data["respondera"], bool)
        self.assertAlmostEqual(
            data["probabilidad_no_responder"] + data["probabilidad_responder"],
            1.0,
            places=5
        )

    def test_predict_sin_body(self):
        response = self.client.post("/predict", json=None)
        self.assertEqual(response.status_code, 400)

    def test_cluster_valido(self):
        payload = {
            "Income": 50000,
            "Age": 50,
            "TotalSpend": 1000,
            "TotalPurchases": 20,
            "Recency": 30,
            "NumWebVisitsMonth": 5,
            "Kidhome": 0,
            "Teenhome": 1
        }
        response = self.client.post("/cluster", json=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn(data["cluster"], [0, 1, 2, 3])
        self.assertIn("descripcion", data)
        self.assertGreaterEqual(data["distancia_centroide"], 0)

    def test_cluster_sin_body(self):
        response = self.client.post("/cluster", json=None)
        self.assertEqual(response.status_code, 400)

    def test_rules(self):
        response = self.client.get("/rules")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertGreater(data["total_reglas"], 0)
        primera = data["reglas"][0]
        self.assertIn("support", primera)
        self.assertIn("confidence", primera)
        self.assertIn("lift", primera)

    def test_clusters_info(self):
        response = self.client.get("/clusters/info")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["total_clusters"], 4)
        total = sum(c["cantidad_clientes"] for c in data["clusters"])
        self.assertEqual(total, 2052)

    def test_404(self):
        response = self.client.get("/endpoint_inexistente")
        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()
