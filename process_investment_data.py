import pandas as pd
import json
import os

def process_xls():
    companies_path = '260511 Empresas Hubspot Inversión.xls'
    contacts_path = '260511 Contactos Hubspot Inversión.xls'
    output_path = 'public/legacy/investment_data.json'

    os.makedirs('public/legacy', exist_ok=True)

    try:
        print(f"Reading {companies_path}...")
        companies_df = pd.read_excel(companies_path)
        companies_raw = json.loads(companies_df.to_json(orient='records', date_format='iso'))
    except Exception as e:
        print(f"Error reading companies: {e}")
        companies_raw = []

    try:
        print(f"Reading {contacts_path}...")
        contacts_df = pd.read_excel(contacts_path)
        contacts_raw = json.loads(contacts_df.to_json(orient='records', date_format='iso'))
    except Exception as e:
        print(f"Error reading contacts: {e}")
        contacts_raw = []

    data = {
        "total_companies": len(companies_raw),
        "total_contacts": len(contacts_raw),
        "companies_raw": companies_raw,
        "contacts_raw": contacts_raw
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully processed {data['total_companies']} investment companies and {data['total_contacts']} investment contacts.")

if __name__ == "__main__":
    process_xls()
