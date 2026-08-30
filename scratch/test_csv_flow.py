import pandas as pd
import requests

df = pd.DataFrame({
    'product_name': ['Running Shoes', 'Cotton T-Shirt', 'Winter Jacket', 'Denim Jeans'],
    'category': ['Footwear', 'Apparel', 'Apparel', 'Apparel'],
    'revenue': [15200.50, 8400.00, 23500.00, 11200.75],
    'quantity': [120, 350, 85, 190]
})

csv_bytes = df.to_csv(index=False).encode('utf-8')

# 1. Upload CSV
res = requests.post(
    'http://127.0.0.1:8000/csv/upload',
    files={'file': ('sales_demo.csv', csv_bytes, 'text/csv')}
)
print('Upload status:', res.status_code)
upload_data = res.json()
print('Upload response:', upload_data)

# 2. Query CSV
dataset_id = upload_data['dataset_id']
query_res = requests.post(
    'http://127.0.0.1:8000/csv/query',
    json={
        'question': 'Which product has the highest revenue?',
        'dataset_id': dataset_id
    }
)
print('Query status:', query_res.status_code)
query_data = query_res.json()
print('Generated SQL:', query_data.get('sql'))
print('Data:', query_data.get('data'))
print('Answer:', query_data.get('answer'))
