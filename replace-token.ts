import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Path to your YAML file
const yamlFilePath = path.join(__dirname, 'movie-stream-connector.yml');
const yamlFileBackupPath = path.join(__dirname, 'movie-stream-backup.yml');

// Check if the YAML file exists
if (!fs.existsSync(yamlFilePath)) {
    console.error(`Error: The file ${yamlFilePath} does not exist.`);
    process.exit(1);
}

// Read the YAML file
let yamlContent = fs.readFileSync(yamlFilePath, 'utf8');

// Replace placeholder with actual token
yamlContent = yamlContent.replace('${TOKEN_AUTH}', process.env.TOKEN_AUTH ?? '');

// Write the updated content to a new file
fs.writeFileSync(yamlFileBackupPath, yamlContent, 'utf8');

console.log('YAML file updated with API token.');
