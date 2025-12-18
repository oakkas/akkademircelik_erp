import pandas as pd
import os

DATA_DIR = '/Users/oakkas/repos/akkademircelik_raporlar'

def debug_kuveyt():
    print("\n--- Debugging Kuveyt (HTML as XLS) ---")
    files = [f for f in os.listdir(DATA_DIR) if 'Kuveyt' in f and f.endswith('.xls')]
    for f in files:
        path = os.path.join(DATA_DIR, f)
        print(f"Reading {f}...")
        try:
            # Try reading as HTML
            dfs = pd.read_html(path)
            print(f"Success! Found {len(dfs)} tables.")
            if dfs:
                print(dfs[0].head())
        except Exception as e:
            print(f"Failed to read as HTML: {e}")

def debug_ziraat():
    print("\n--- Debugging Ziraat (Style Error) ---")
    files = [f for f in os.listdir(DATA_DIR) if 'Ziraat' in f]
    for f in files:
        path = os.path.join(DATA_DIR, f)
        print(f"Reading {f}...")
        try:
            # Try reading with openpyxl, ignoring styles if possible (pandas doesn't expose this easily, but let's try basic read)
            df = pd.read_excel(path, engine='openpyxl')
            print("Success with openpyxl!")
            print(df.head())
        except Exception as e:
            print(f"Failed with openpyxl: {e}")
            try:
                # Maybe it's HTML too?
                dfs = pd.read_html(path)
                print("Success as HTML!")
                print(dfs[0].head())
            except Exception as e2:
                print(f"Failed as HTML: {e2}")

def debug_akbank():
    print("\n--- Debugging Akbank (Header Offset) ---")
    files = [f for f in os.listdir(DATA_DIR) if 'Akbank' in f or 'Akka' in f]
    for f in files:
        path = os.path.join(DATA_DIR, f)
        print(f"Reading {f}...")
        try:
            # Try finding the header
            df = pd.read_excel(path, header=None)
            print("Raw first 10 rows:")
            print(df.head(10))
        except Exception as e:
            print(f"Failed: {e}")

if __name__ == "__main__":
    # Install lxml or html5lib if needed, usually lxml is better
    try:
        import lxml
    except ImportError:
        print("lxml not found, might need to install it for read_html")
    
    debug_kuveyt()
    debug_ziraat()
    debug_akbank()
