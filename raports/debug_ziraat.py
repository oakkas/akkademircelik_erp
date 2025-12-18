import pandas as pd
import os
import glob

DATA_DIR = '/Users/oakkas/repos/akkademircelik_raporlar'

def debug_ziraat_only():
    print("--- Debugging Ziraat Files ---")
    files = glob.glob(os.path.join(DATA_DIR, '*Ziraat*.xlsx'))
    print(f"Found {len(files)} Ziraat files.")
    
    for f in files:
        print(f"\nFile: {os.path.basename(f)}")
        try:
            # Try HTML
            print("Attempting read_html...")
            dfs = pd.read_html(f)
            if dfs:
                print(f"Success (HTML)! Found {len(dfs)} tables.")
                df = dfs[0]
                print("Columns:", df.columns.tolist())
                print("Row 0:", df.iloc[0].tolist())
            else:
                print("read_html returned empty list.")
        except Exception as e:
            print(f"read_html failed: {e}")
            
        try:
            # Try Excel
            print("Attempting read_excel...")
            df = pd.read_excel(f)
            print("Success (Excel)!")
            print("Columns:", df.columns.tolist())
        except Exception as e:
            print(f"read_excel failed: {e}")

if __name__ == "__main__":
    debug_ziraat_only()
