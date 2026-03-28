import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

// MOCK ENV BEFORE IMPORTING SERVICE
process.env.STORAGE_PROVIDER = 'local';
process.env.API_URL = 'http://localhost:4000';
process.env.STORAGE_SECRET = 'test-secret';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure temp directory exists
const tempDir = path.resolve('uploads/temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Mock Video File
// Note: Verification of actual transcoding requires a valid video file. 
// We will skip actual transcoding if no video file, but test the "put" logic if possible or just URL gen.
// For this test, we just test STATIC adapter upload and URL gen for Stream adapter.

const test = async () => {
    // Dynamic import to pick up env vars
    const { StorageService } = await import('../services/storage.service.js');

    console.log('--- Starting Verification (Split Adapter) ---');
    
    // 1. Static Upload
    console.log('\n1. Testing Static Upload (Public)...');
    try {
        const mockFile = {
            fieldname: 'file',
            originalname: 'test-img.png',
            mimetype: 'image/png',
            path: path.join(tempDir, 'test-img.png'),
            size: 1024
        };
        fs.writeFileSync(mockFile.path, 'data');
        
        const result = await StorageService.processStaticUpload(mockFile);
        console.log('Result:', result);
        
        if (result.url.includes('/uploads/')) console.log('PASS: Static URL correct.');
        else console.error('FAIL: Static URL malformed: ' + result.url);
        
    } catch (error) {
        console.error('FAIL Static:', error);
    }

    // 2. Stream URL Gen
    console.log('\n2. Testing Stream URL Gen (HLS)...');
    try {
        const key = 'test-uuid';
        // Verify we can get a signed URL for a theoretical HLS playlist
        // Note: We can't easily validatAndGetPath without creating the file structure first.
        
        const url = await StorageService.generateSignedUrl(key, 'streaming');
        console.log('URL:', url);
        
        if (url.includes('playlist.m3u8') && url.includes('token=')) console.log('PASS: HLS URL generated.');
        else console.error('FAIL: HLS URL malformed.');

        // 3. Mock Validation (Manually create structure)
        const streamDir = path.resolve('uploads/stream/test-uuid');
        if (!fs.existsSync(streamDir)) fs.mkdirSync(streamDir, { recursive: true });
        fs.writeFileSync(path.join(streamDir, 'playlist.m3u8'), '#EXTM3U');
        
        // Extract token from URL to test validation
        const urlObj = new URL(url);
        const token = urlObj.searchParams.get('token');
        const expires = urlObj.searchParams.get('expires');
        const generatedKey = urlObj.searchParams.get('key'); // should be test-uuid/playlist.m3u8
        
        console.log(`\nValidating path for key: ${generatedKey}`);
        
        // Mock the file existence because validateAndGetPath checks it
        const filePathToCheck = path.resolve('uploads/stream', generatedKey);
        const folder = path.dirname(filePathToCheck);
        if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(filePathToCheck, '#EXTM3U');

        const filePath = StorageService.validateAndGetPath(generatedKey, expires, token, 'streaming');
        console.log('Resolved Path:', filePath);
        
        if (filePath.endsWith('playlist.m3u8')) console.log('PASS: Validation successful.');

    } catch (error) {
        console.error('FAIL Stream:', error);
    }
    
    console.log('\n--- Complete ---');
};

test();
