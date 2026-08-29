from pathlib import Path
import pandas as pd


DATA_DIR = Path(r"C:\QueryAI\data")


def profile_file(file_path):
    df = pd.read_csv(file_path)

    print("\n" + "=" * 80)
    print(f"FILE: {file_path.name}")
    print("=" * 80)

    print(f"Rows: {len(df):,}")
    print(f"Columns: {len(df.columns)}")

    print("\nColumn Information:")
    print(df.dtypes.to_string())

    print("\nMissing Values:")
    missing = df.isna().sum()
    missing = missing[missing > 0]

    if missing.empty:
        print("No missing values.")
    else:
        for column, count in missing.items():
            percentage = (count / len(df)) * 100
            print(
                f"{column}: {count:,} "
                f"({percentage:.2f}%)"
            )

    print("\nDuplicate Rows:")
    print(df.duplicated().sum())

    print("\nFirst 3 Rows:")
    print(df.head(3).to_string(index=False))


def main():
    csv_files = sorted(DATA_DIR.glob("*.csv"))

    if not csv_files:
        print(f"No CSV files found in {DATA_DIR}")
        return

    print(f"Found {len(csv_files)} CSV files.")

    for file_path in csv_files:
        profile_file(file_path)


if __name__ == "__main__":
    main()