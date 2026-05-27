import csv
import json
import os
from collections import Counter

def process_csvs():
    companies_path = 'TODAS_LAS_EMPRESAS_SEGMENTADAS.csv'
    contacts_path = 'TODOS_LOS_CONTACTOS_SEGMENTADOS.csv'
    output_path = 'public/legacy/dashboard_data.json'

    # Ensure output directory exists
    os.makedirs('public/legacy', exist_ok=True)

    data = {
        "total_companies": 0,
        "total_contacts": 0,
        "revenue_growth": 18.2,  # Baseline
        "active_users": 12,      # Baseline
        "companies_by_segment": [],
        "top_cities": [],
        "companies_raw": [],
        "contacts_raw": []
    }

    # Process Companies
    segments = []
    cities = []
    try:
        with open(companies_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data["total_companies"] += 1
                if row.get("Segmento de Mercado"):
                    segments.append(row["Segmento de Mercado"])
                if row.get("Ciudad"):
                    cities.append(row["Ciudad"])
                
                data["companies_raw"].append(row)
    except Exception as e:
        print(f"Error processing companies: {e}")

    # Process Contacts
    try:
        with open(contacts_path, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data["total_contacts"] += 1
                data["contacts_raw"].append(row)
    except Exception as e:
        print(f"Error processing contacts: {e}")

    # Aggregate Segment Stats
    segment_counts = Counter(segments)
    total_seg = sum(segment_counts.values()) or 1
    data["companies_by_segment"] = [
        {"name": k, "count": v, "percentage": round((v/total_seg)*100, 1)}
        for k, v in segment_counts.most_common(5)
    ]

    # Aggregate City Stats
    city_counts = Counter(cities)
    data["top_cities"] = [
        {"city": k, "count": v}
        for k, v in city_counts.most_common(5)
    ]

    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully processed {data['total_companies']} companies and {data['total_contacts']} contacts.")

if __name__ == "__main__":
    process_csvs()
