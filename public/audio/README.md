# Audio Files

Place your MP3 music files here.

## Reference in code:
```javascript
// Audio files are served from public/audio/
const musicUrl = '/audio/song-name.mp3';
```

### Existing implementation:
The game already uses `musicManager` (lib/musicManager.js) which loads audio files. Reference songs like:
- `/audio/main.mp3` - main theme
- `/audio/boss.mp3` - boss battle theme

Add your MP3 files here and reference them in code with the `/audio/` path prefix.
