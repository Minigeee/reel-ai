import fs from 'fs';
import path from 'path';

interface JpDictEntry {
  word: string;
  reading: string;
  definitions: string[];
  partsOfSpeech: string[];
  sortId: number;
}

async function processFile(
  filePath: string,
  seenWords: Set<string>
): Promise<JpDictEntry[]> {
  const content = await fs.promises.readFile(filePath, 'utf8');
  const entries = JSON.parse(content);
  const uniqueEntries: JpDictEntry[] = [];

  for (const entry of entries) {
    if (!seenWords.has(entry[0])) {
      seenWords.add(entry[0]);
      uniqueEntries.push({
        word: entry[0],
        reading: entry[1],
        definitions: entry[5],
        partsOfSpeech: entry[2].split(' '),
        sortId: entry[4],
      });
    }
  }

  return uniqueEntries;
}

function escapeCSV(str: string): string {
  if (typeof str !== 'string') {
    str = JSON.stringify(str);
  }
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function writeCSV(entries: JpDictEntry[], outputPath: string) {
  const header = 'language,word,definitions,part_of_speech,extra,metadata\n';
  await fs.promises.writeFile(outputPath, header);

  const writeStream = fs.createWriteStream(outputPath, { flags: 'a' });

  for (const entry of entries) {
    const csvLine =
      [
        'ja',
        escapeCSV(entry.word),
        escapeCSV(JSON.stringify(entry.definitions)),
        escapeCSV(entry.partsOfSpeech[0]),
        escapeCSV(
          JSON.stringify({
            reading: entry.reading,
            allPartsOfSpeech: entry.partsOfSpeech,
            sortId: entry.sortId,
          })
        ),
        '{}', // empty metadata
      ].join(',') + '\n';

    writeStream.write(csvLine);
  }

  return new Promise((resolve, reject) => {
    writeStream.end((err: Error | null) => {
      if (err) reject(err);
      else resolve(null);
    });
  });
}

async function main() {
  const directoryPath = process.argv[2];
  if (!directoryPath) {
    console.error('Please provide a directory path');
    process.exit(1);
  }

  try {
    const files = await fs.promises.readdir(directoryPath);
    const jsonFiles = files.filter(
      (file) => file.startsWith('term_bank_') && file.endsWith('.json')
    );
    const allEntries: JpDictEntry[] = [];
    const seenWords = new Set<string>();

    console.log(`Found ${jsonFiles.length} dictionary files`);

    for (const file of jsonFiles) {
      console.log(`Processing ${file}...`);
      const entries = await processFile(
        path.join(directoryPath, file),
        seenWords
      );
      allEntries.push(...entries);
    }

    console.log(`Total unique words: ${seenWords.size}`);
    const outputPath = path.join(process.cwd(), 'japanese-dictionary.csv');
    await writeCSV(allEntries, outputPath);
    console.log(`CSV file created at: ${outputPath}`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
