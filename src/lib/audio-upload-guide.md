# How to Add MP3 Files in Base44

Base44 doesn't have a traditional `public/` folder. Instead, upload your MP3s using the built-in file upload system.

## Option 1: Upload via GameSettings Page
Go to **GameSettings** page → **Other** tab → add an upload field for your music URLs.

## Option 2: Upload Programmatically in Code
```javascript
import { base44 } from '@/api/base44Client';

// Upload an MP3 file
const response = await base44.integrations.Core.UploadFile({ 
  file: mp3File 
});
const musicUrl = response.file_url;

// Store the URL in settings or localStorage
localStorage.setItem('music_url', musicUrl);
```

## Option 3: Reference in musicManager
The `musicManager` (lib/musicManager.js) loads music. Store uploaded URLs and pass them to the music system:

```javascript
// After uploading, use the returned URL
musicManager.loadTrack('main', uploadedMusicUrl);
```

**Just upload your MP3s and use the returned URLs in your code!**