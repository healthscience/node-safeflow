import fs from 'fs/promises';
import csvParser from 'csv-parser';
import path from 'path';

class FileParser {
  constructor() {
    this.parser = null;
    // Store the base path for test files
    this.testDataPath = path.resolve(__dirname, '../../../test/systems/data');
  }

  // Helper method to get the full path to a test file
  getTestFilePath(relativePath) {
    return path.join(this.testDataPath, relativePath);
  }

  async parseCSV(filePath, options = {}) {
    try {
      const csvPath = this.getTestFilePath(filePath);
      const csvContent = await fs.readFile(csvPath, 'utf8');
      
      const parser = csvParser({
        mapHeaders: ({ header, index }) => header.trim(),
        mapValues: ({ value, index }) => value.trim(),
        ...options
      });

      const records = [];
      return new Promise((resolve, reject) => {
        parser.on('data', (data) => records.push(data));
        parser.on('end', () => resolve(records));
        parser.on('error', reject);
        parser.write(csvContent);
        parser.end();
      });
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw error;
    }
  }

  async parseJSON(filePath) {
    try {
      const jsonPath = this.getTestFilePath(filePath);
      const jsonContent = await fs.readFile(jsonPath, 'utf8');
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw error;
    }
  }

  async parseXML(filePath) {
    try {
      const xmlPath = this.getTestFilePath(filePath);
      const xmlContent = await fs.readFile(xmlPath, 'utf8');
      // Add XML parsing logic here
      return xmlContent;
    } catch (error) {
      console.error('Error parsing XML:', error);
      throw error;
    }
  }

  // Helper method to get file content without parsing
  async getFileContent(filePath) {
    try {
      const fullPath = this.getTestFilePath(filePath);
      const fileContent = await fs.readFile(fullPath, 'utf8');
      return fileContent;
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  // Helper method to get file stats
  async getFileStats(filePath) {
    try {
      const fullPath = this.getTestFilePath(filePath);
      const stats = await fs.stat(fullPath);
      return stats;
    } catch (error) {
      console.error('Error getting file stats:', error);
      throw error;
    }
  }
}

export default FileParser;