import pandas as pd
import os
import datetime

DATA_DIR = '/Users/oakkas/repos/akkademircelik_raporlar'
OUTPUT_FILE = os.path.join(DATA_DIR, 'Full_Expense_List.md')

def generate_expense_list():
    print("Generating Full Expense List...")
    try:
        df = pd.read_excel(os.path.join(DATA_DIR, 'Masraf durum raporu.xls'))
        
        # Clean data
        if 'Hesap adı' in df.columns:
            df = df[df['Hesap adı'].notna()]
            df = df[~df['Hesap adı'].astype(str).str.upper().str.contains('TOPLAM')]
            df = df[~df['Hesap adı'].astype(str).str.upper().str.contains('RAPOR')]
        
        # Sort by amount descending
        if 'TL Borç' in df.columns:
            df = df.sort_values('TL Borç', ascending=False)
        
        lines = []
        lines.append("# Full Expense List")
        lines.append(f"Date: {datetime.datetime.now().strftime('%Y-%m-%d')}")
        lines.append(f"Total Items: {len(df)}")
        lines.append(f"Total Amount: {df['TL Borç'].sum():,.2f} TL")
        lines.append("\n| Expense Account | Amount (TL) |")
        lines.append("|---|---|")
        
        for _, row in df.iterrows():
            name = row['Hesap adı'] if 'Hesap adı' in df.columns else 'Unknown'
            amount = row['TL Borç'] if 'TL Borç' in df.columns else 0
            lines.append(f"| {name} | {amount:,.2f} |")
            
        with open(OUTPUT_FILE, 'w') as f:
            f.write("\n".join(lines))
            
        print(f"Expense list saved to {OUTPUT_FILE}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_expense_list()
