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

// Mock file object
const mockFile = {
    fieldname: 'file',
    originalname: 'test-image.png',
    encoding: '7bit',
    mimetype: 'image/png',
    destination: 'uploads/temp/',
    filename: 'test-image-123.png',
    path: path.resolve('uploads/temp/test-image-123.png'),
    size: 1024
};

// Ensure temp directory exists
const tempDir = path.resolve('uploads/temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

// Create dummy file
fs.writeFileSync(mockFile.path, 'dummy content');

const test = async () => {
    // Dynamic import to pick up env vars
    const { StorageService } = await import('../services/storage.service.js');

    console.log('--- Starting Verification ---');
    
    try {
        // 1. Static Upload (Public)
        console.log('\n1. Testing Static Upload (Public)...');
        // We must re-create the file because previous runs might have moved it
        if (!fs.existsSync(mockFile.path)) fs.writeFileSync(mockFile.path, 'dummy content');
        
        const result = await StorageService.processStaticUpload(mockFile, 'public');
        console.log('Result:', result);
        
        if (result.url && result.key) {
            console.log('PASS: Upload returned key and url.');
        } else {
            console.error('FAIL: Missing key or url.');
        }
    } catch (e) {
        console.error('FAIL:', e);
    }

    try {
        // 2. Test Signed URL Generation (Streaming)
        console.log('\n2. Testing Signed URL generation (Streaming)...');
        const key = 'dummy-video-id';
        const url = StorageService.generateSignedUrl(key, 'streaming');
        console.log('URL:', url);
        
        if (url && (url.includes('token=') || url.includes('bunnycdn.com'))) {
            console.log('PASS: URL generated with token or correct domain.');
        } else {
            console.error('FAIL: URL format unexpected.');
        }
    } catch (e) {
        console.error('FAIL:', e);
    }

    console.log('\n--- Verification Complete ---');
};

test();
