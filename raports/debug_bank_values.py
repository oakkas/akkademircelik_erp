import pandas as pd
import os
import glob

DATA_DIR = '/Users/oakkas/repos/akkademircelik_raporlar'

def debug_values():
    # Akbank
    files = glob.glob(os.path.join(DATA_DIR, '*Akbank*.xlsx')) + glob.glob(os.path.join(DATA_DIR, '*Akka*.xlsx'))
    files = list(set(files))
    for f in files:
        if 'Ziraat' in f: continue
        print(f"\n--- Inspecting {os.path.basename(f)} ---")
        try:
            df = pd.read_excel(f, header=9)
            df.columns = [str(c).lower().strip() for c in df.columns]
            b_col = next((c for c in df.columns if 'borç' in c), None)
            a_col = next((c for c in df.columns if 'alacak' in c), None)
            
            if b_col:
                print(f"Column '{b_col}' sample values:")
                print(df[b_col].head(5).tolist())
            if a_col:
                print(f"Column '{a_col}' sample values:")
                print(df[a_col].head(5).tolist())
        except Exception as e:
            print(f"Error: {e}")

    # Kuveyt
    files = glob.glob(os.path.join(DATA_DIR, '*Kuveyt*.xls'))
    for f in files:
        print(f"\n--- Inspecting {os.path.basename(f)} ---")
        try:
            dfs = pd.read_html(f)
            if dfs:
                df = dfs[0]
                print("First 5 rows raw:")
                print(df.head(5))
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    debug_values()
