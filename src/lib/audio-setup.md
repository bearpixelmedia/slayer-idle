# Audio Setup for Base44

## Where to place MP3 files:
In Base44, create a `public/audio/` folder in your project root (same level as `src/`).

```
your-project/
├── src/
├── public/          ← Create this if it doesn't exist
│   └── audio/       ← Place MP3 files here
│       ├── main.mp3
│       └── boss.mp3
├── index.html
└── package.json
```

## How to reference in code:
```javascript
const musicUrl = '/audio/main.mp3';
const soundUrl = '/audio/coin-collect.mp3';
```

The `musicManager` (lib/musicManager.js) already loads audio from this path. Just drop your MP3 files into `public/audio/` and they'll be accessible.