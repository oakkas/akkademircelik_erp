import pandas as pd
import os

DATA_DIR = '/Users/oakkas/repos/akkademircelik_raporlar'

def inspect_stock_types():
    print("--- Inspecting Stock Movement Types ---")
    
    files = {
        'In (Alış)': 'Genel alış stok hareket föyü.xlsx',
        'Out (Satış)': 'Genel  satış stok hareket föyü.xlsx'
    }
    
    for label, filename in files.items():
        path = os.path.join(DATA_DIR, filename)
        try:
            df = pd.read_excel(path)
            if 'EVRAK TİPİ' in df.columns:
                print(f"\n{label} - Unique Document Types:")
                print(df['EVRAK TİPİ'].unique().tolist())
                
                # Check if there are any production related terms
                prod_terms = ['ÜRETİM', 'SARF', 'İMALAT', 'HAMMADDE']
                found = df[df['EVRAK TİPİ'].astype(str).str.upper().str.contains('|'.join(prod_terms), na=False)]
                if not found.empty:
                    print(f"  Found production-related records: {len(found)}")
                    print(found[['EVRAK TİPİ', 'STOK İSMİ']].head(3).to_string())
            else:
                print(f"\n{label} - 'EVRAK TİPİ' column not found.")
                
        except Exception as e:
            print(f"Error reading {filename}: {e}")

if __name__ == "__main__":
    inspect_stock_types()
