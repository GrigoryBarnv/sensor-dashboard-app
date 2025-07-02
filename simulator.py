# import time
# import requests
# import random

# while True:
#     data = {
#         "MQ2": round(random.uniform(100, 300), 2),
#         "MQ3_1": round(random.uniform(10, 30), 2),
#         "MQ3_10": round(random.uniform(20, 40), 2),
#         "MQ4": round(random.uniform(180, 220), 2),
#         "MQ5": round(random.uniform(200, 260), 2),
#         "MQ6": round(random.uniform(120, 140), 2),
#         "MQ8": round(random.uniform(130, 150), 2),
#         "MQ9": round(random.uniform(130, 150), 2),
#         "MQ135": round(random.uniform(170, 190), 2),
#         "MQ136": round(random.uniform(20, 30), 2),
#         "MQ137": round(random.uniform(30, 40), 2),
#         "MQ138": round(random.uniform(28, 32), 2)
#     }
#     try:
#         r = requests.post("http://web:5000/api/data", json=data)
#         print("Sent:", data)
#     except Exception as e:
#         print("Error:", e)
#     time.sleep(2)
