import pandas as pd
import os
import glob

DATA_DIR = '/Users/oakkas/repos/akkademircelik_raporlar'

def debug_full():
    # Akbank
    files = glob.glob(os.path.join(DATA_DIR, '*Akbank*.xlsx'))
    for f in files:
        print(f"\n--- Akbank: {os.path.basename(f)} ---")
        try:
            df = pd.read_excel(f, header=9)
            print("Columns:", df.columns.tolist())
            print("First row:", df.iloc[0].tolist())
        except Exception as e:
            print(f"Error: {e}")

    # Kuveyt
    files = glob.glob(os.path.join(DATA_DIR, '*Kuveyt*.xls'))
    for f in files:
        print(f"\n--- Kuveyt: {os.path.basename(f)} ---")
        try:
            dfs = pd.read_html(f)
            if dfs:
                df = dfs[0]
                print("Row 3 values:", df.iloc[3].tolist())
                print("Row 0 values:", df.iloc[0].tolist())
        except Exception as e:
            print(f"Error: {e}")

    # Ziraat
    files = glob.glob(os.path.join(DATA_DIR, '*Ziraat*.xlsx'))
    for f in files:
        print(f"\n--- Ziraat: {os.path.basename(f)} ---")
        try:
            # Try HTML first
            dfs = pd.read_html(f)
            if dfs:
                df = dfs[0]
                print("HTML - Row 0:", df.iloc[0].tolist())
                print("HTML - Columns:", df.columns.tolist())
            else:
                df = pd.read_excel(f)
                print("Excel - Columns:", df.columns.tolist())
        except Exception:
            try:
                df = pd.read_excel(f)
                print("Excel - Columns:", df.columns.tolist())
            except Exception as e:
                print(f"Error: {e}")

if __name__ == "__main__":
    debug_full()
