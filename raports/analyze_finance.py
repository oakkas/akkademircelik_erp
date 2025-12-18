import pandas as pd
import os
import glob
import datetime

DATA_DIR = '/Users/oakkas/repos/akkademircelik_raporlar'
REPORT_FILE = os.path.join(DATA_DIR, 'Financial_Analysis_Report.md')

def load_bank_data():
    print("Loading Bank Data...")
    bank_txns = []
    
    # Kuveyt (HTML as XLS)
    kuveyt_files = glob.glob(os.path.join(DATA_DIR, '*Kuveyt*.xls'))
    for f in kuveyt_files:
        try:
            dfs = pd.read_html(f)
            if dfs:
                df = dfs[0]
                # Identify columns. Usually: Tarih, Tutar, Açıklama, Bakiye etc.
                # Based on debug: 0: Tarih, ...
                # Let's standardize.
                # Assuming columns exist. We'll rename them if we can map them.
                # Kuveyt usually has: Tarih, İşlem Kodu, Açıklama, Borç, Alacak, Bakiye
                # We need to inspect columns to be sure, but let's try to normalize.
                df['Source'] = 'Kuveyt'
                bank_txns.append(df)
        except Exception as e:
            print(f"Error loading {os.path.basename(f)}: {e}")

    # Ziraat (HTML as XLSX or XLS)
    ziraat_files = glob.glob(os.path.join(DATA_DIR, '*Ziraat*.xlsx'))
    for f in ziraat_files:
        try:
            # Try HTML first
            dfs = pd.read_html(f)
            if dfs:
                df = dfs[0]
                df['Source'] = 'Ziraat'
                bank_txns.append(df)
                continue
        except Exception:
            pass
            
        try:
            # Fallback to excel
            df = pd.read_excel(f)
            df['Source'] = 'Ziraat'
            bank_txns.append(df)
        except Exception as e:
            print(f"Error loading {os.path.basename(f)}: {e}")

    # Akbank (Header offset)
    akbank_files = glob.glob(os.path.join(DATA_DIR, '*Akbank*.xlsx')) + glob.glob(os.path.join(DATA_DIR, '*Akka*.xlsx'))
    # Avoid duplicates if Akka is same as Akbank
    akbank_files = list(set(akbank_files))
    
    for f in akbank_files:
        if 'Ziraat' in f: continue # Safety check
        try:
            df = pd.read_excel(f, header=9)
            df['Source'] = 'Akbank'
            bank_txns.append(df)
        except Exception as e:
            print(f"Error loading {os.path.basename(f)}: {e}")
            
    return bank_txns

def load_report_data():
    print("Loading Report Data...")
    reports = {}
    
    # Sales
    try:
        reports['Sales'] = pd.read_excel(os.path.join(DATA_DIR, 'Aylık cari satış raporu.xls'))
    except Exception as e: print(f"Error loading Sales: {e}")
        
    # Purchases
    try:
        reports['Purchases'] = pd.read_excel(os.path.join(DATA_DIR, 'Aylık ciro alış raporu.xls'))
    except Exception as e: print(f"Error loading Purchases: {e}")
        
    # Expenses
    try:
        reports['Expenses'] = pd.read_excel(os.path.join(DATA_DIR, 'Masraf durum raporu.xls'))
    except Exception as e: print(f"Error loading Expenses: {e}")
        
    # Debt/Credit (Cari Bakiye)
    try:
        reports['Balances'] = pd.read_excel(os.path.join(DATA_DIR, 'Cari bakiye durum raporu.xls'))
    except Exception as e: print(f"Error loading Balances: {e}")
    
    # Stock
    try:
        reports['Stock_In'] = pd.read_excel(os.path.join(DATA_DIR, 'Genel alış stok hareket föyü.xlsx'))
        reports['Stock_Out'] = pd.read_excel(os.path.join(DATA_DIR, 'Genel  satış stok hareket föyü.xlsx'))
    except Exception as e: print(f"Error loading Stock: {e}")
        
    return reports

def analyze_cash_flow(bank_txns):
    print("Analyzing Cash Flow...")
    summary = []
    total_in = 0
    total_out = 0
    
    for df in bank_txns:
        source = df['Source'].iloc[0] if not df.empty else 'Unknown'
        summary.append(f"Bank: {source}, Rows: {len(df)}")
        
        # Debug info
        print(f"Processing {source}. Columns: {df.columns.tolist()}")
        
        # Search for header in first 10 rows regardless of current columns
        header_found = False
        for i in range(min(10, len(df))):
            row_values = df.iloc[i].astype(str).str.lower().tolist()
            # Check for key columns
            if any('tutar' in v for v in row_values) or (any('borç' in v for v in row_values) and any('alacak' in v for v in row_values)):
                print(f"  Found header at row {i}: {df.iloc[i].tolist()}")
                df.columns = df.iloc[i]
                df = df.iloc[i+1:].reset_index(drop=True)
                header_found = True
                break
        
        if not header_found:
            print("  No header found in first 10 rows.")
        
        # Normalize columns
        df.columns = [str(c).lower().strip() for c in df.columns]
        
        b_col = next((c for c in df.columns if 'borç' in c and 'alacak' not in c and '/' not in c), None) # Strict Borç
        a_col = next((c for c in df.columns if 'alacak' in c and 'borç' not in c and '/' not in c), None) # Strict Alacak
        t_col = next((c for c in df.columns if 'tutar' in c), None)
        
        def to_float(series):
            if pd.api.types.is_numeric_dtype(series):
                return series
            # Turkish format: 1.234,56 -> 1234.56
            return series.astype(str).str.replace('.', '').str.replace(',', '.').apply(pd.to_numeric, errors='coerce')

        current_in = 0
        current_out = 0
        
        if t_col:
            print(f"  Found Tutar: {t_col}")
            try:
                vals = to_float(df[t_col])
                val_sum = vals.sum()
                summary.append(f"  - Net Tutar: {val_sum:,.2f}")
                
                # Calculate In/Out based on sign
                pos_sum = vals[vals > 0].sum()
                neg_sum = vals[vals < 0].sum()
                current_in += pos_sum
                current_out += abs(neg_sum)
                
            except Exception as e:
                print(f"  Error summing: {e}")
                summary.append(f"  - Error summing Tutar: {e}")
        elif b_col and a_col:
            print(f"  Found Borç/Alacak: {b_col}, {a_col}")
            try:
                b_val = to_float(df[b_col]).sum()
                a_val = to_float(df[a_col]).sum()
                current_out += b_val
                current_in += a_val
                summary.append(f"  - Out (Borç): {b_val:,.2f}")
                summary.append(f"  - In (Alacak): {a_val:,.2f}")
            except Exception as e:
                print(f"  Error summing: {e}")
                summary.append(f"  - Error summing Borç/Alacak: {e}")
        else:
            print("  No amount columns found.")
            summary.append("  - No amount columns found.")
        
        total_in += current_in
        total_out += current_out

    summary.append(f"\n**Total Inflow**: {total_in:,.2f}")
    summary.append(f"**Total Outflow**: {total_out:,.2f}")
    return "\n".join(summary)

def generate_report(reports, bank_summary):
    print("Generating Report...")
    lines = []
    lines.append("# Financial Analysis Report")
    lines.append(f"Date: {datetime.datetime.now().strftime('%Y-%m-%d')}")
    lines.append("\n## 1. Cash Flow Overview")
    lines.append(bank_summary)
    
    def clean_df(df, name_col):
        # Remove rows where name is NaN or contains TOPLAM
        if name_col not in df.columns: return df
        df = df[df[name_col].notna()]
        df = df[~df[name_col].astype(str).str.upper().str.contains('TOPLAM')]
        return df

    if 'Sales' in reports:
        df = reports['Sales']
        df = clean_df(df, 'Cari hesap adı')
        total_sales = df['Ciro'].sum()
        lines.append("\n## 2. Sales Performance")
        lines.append(f"- **Total Sales (Ciro)**: {total_sales:,.2f} TL")
        lines.append("- **Top 5 Customers**:")
        top5 = df.sort_values('Ciro', ascending=False).head(5)
        for _, row in top5.iterrows():
            lines.append(f"  - {row['Cari hesap adı']}: {row['Ciro']:,.2f}")

    if 'Purchases' in reports:
        df = reports['Purchases']
        df = clean_df(df, 'Cari hesap adı')
        total_purchases = df['Ciro'].sum()
        lines.append("\n## 3. Purchase Analysis")
        lines.append(f"- **Total Purchases**: {total_purchases:,.2f} TL")
        lines.append("- **Top 5 Suppliers**:")
        top5 = df.sort_values('Ciro', ascending=False).head(5)
        for _, row in top5.iterrows():
            lines.append(f"  - {row['Cari hesap adı']}: {row['Ciro']:,.2f}")

    if 'Expenses' in reports:
        df = reports['Expenses']
        df = clean_df(df, 'Hesap adı')
        total_expenses = df['TL Borç'].sum()
        lines.append("\n## 4. Expense Analysis")
        lines.append(f"- **Total Expenses**: {total_expenses:,.2f} TL")
        lines.append("- **Top Expenses**:")
        top5 = df.sort_values('TL Borç', ascending=False).head(5)
        for _, row in top5.iterrows():
            lines.append(f"  - {row['Hesap adı']}: {row['TL Borç']:,.2f}")

    if 'Balances' in reports:
        df = reports['Balances']
        df = clean_df(df, 'Cari hesap adı')
        total_debt_bal = df['TL Borç Bakiye'].sum()
        total_credit_bal = 0
        if 'TL Alacak Bakiye' in df.columns:
            total_credit_bal = df['TL Alacak Bakiye'].sum()
             
        lines.append("\n## 5. Account Balances")
        lines.append(f"- **Total Debit Balance (Borç Bakiye)**: {total_debt_bal:,.2f} TL")
        if total_credit_bal > 0:
            lines.append(f"- **Total Credit Balance (Alacak Bakiye)**: {total_credit_bal:,.2f} TL")

    if 'Stock_In' in reports and 'Stock_Out' in reports:
        in_df = reports['Stock_In']
        out_df = reports['Stock_Out']
        lines.append("\n## 6. Stock Analysis")
        lines.append(f"- **Total Items In**: {in_df['MİKTAR'].sum():,.0f}")
        lines.append(f"- **Total Items Out**: {out_df['MİKTAR'].sum():,.0f}")
        lines.append(f"- **Total Value In**: {in_df['NET TUTAR'].sum():,.2f} TL")
        lines.append(f"- **Total Value Out**: {out_df['NET TUTAR'].sum():,.2f} TL")

    with open(REPORT_FILE, 'w') as f:
        f.write("\n".join(lines))
    
    print(f"Report generated at {REPORT_FILE}")
    print("\n".join(lines))

if __name__ == "__main__":
    bank_data = load_bank_data()
    report_data = load_report_data()
    bank_summary = analyze_cash_flow(bank_data)
    generate_report(report_data, bank_summary)
