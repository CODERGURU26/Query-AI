with open('src/components/CsvUploader.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for i, line in enumerate(lines[200:210], start=201):
        print(f'{i}: {repr(line)}')