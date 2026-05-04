# Language Assistant — Mobile App (React Native)

Real-time multilingual speech-to-speech translation app.

## Features
- 🎙 Voice recording + STT (self-hosted Whisper or Groq fallback)
- 🌍 Multi-language translation: EN, VI, ZH, JA, KO, FR, DE, ES
- 🗣 Live Conversation mode (two-side real-time translation)
- 📝 Text translate screen
- 🔊 Native TTS (Android / iOS)
- 📖 Phrasebook + in-memory cache (multi-layer translation)
- 💾 Session history
- 🔐 Supabase auth

## Setup

### 1. Install dependencies
```bash
cd mobile
npm install
```

### 2. Set environment variables
Create `mobile/.env`:
```
STT_URL=https://internship.pharmacountry.com
STT_KEY=your_shared_key
GROQ_API_KEY=your_groq_key
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

### 3. Android setup
- Install [JDK 17](https://adoptium.net/)
- Install [Android Studio](https://developer.android.com/studio)
- Set env vars:
  ```powershell
  $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
  $env:Path += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator"
  ```
- Create a virtual device in Android Studio (AVD Manager)

### 4. Run
```bash
# Start Metro bundler
npm start

# Run on Android (in another terminal)
npm run android

# Run on iOS (macOS only)
npm run ios
```

## Project Structure
```
mobile/
├── index.js                  ← Entry point
├── src/
│   ├── App.tsx               ← Root component
│   ├── navigation/
│   │   ├── RootNavigator.tsx ← Auth gating + stack
│   │   └── MainTabs.tsx      ← Bottom tabs
│   ├── screens/
│   │   ├── home/             ← Voice recording + STT
│   │   ├── translate/        ← Text translate
│   │   ├── conversation/     ← Live two-side conversation
│   │   ├── history/          ← Session history
│   │   ├── profile/          ← User profile
│   │   └── auth/             ← Login / signup
│   ├── components/
│   │   ├── LanguagePicker    ← Language selector modal
│   │   └── ResultCard        ← Transcript + translation display
│   ├── services/
│   │   ├── sttService.ts     ← STT (tunnel → Groq fallback)
│   │   ├── translateService.ts ← Multi-layer translation
│   │   ├── phrasebook.ts     ← Predefined phrases
│   │   ├── translationCache.ts ← In-memory cache
│   │   ├── ttsService.ts     ← Native TTS
│   │   └── supabase.ts       ← Supabase client
│   └── store/
│       ├── authStore.ts      ← Auth state (Zustand)
│       ├── settingsStore.ts  ← Language settings
│       └── historyStore.ts   ← Session history
```

## Translation Architecture
```
Input text
  ↓ 1. Phrasebook (exact match, instant)
  ↓ 2. Memory cache (session, instant)
  ↓ 3. Argos remote (self-hosted Docker, ~100ms)
     → pivot: any lang → EN → any lang
  ↓ 4. Groq LLM fallback (cloud)
```

## Supported Languages
| Code | Language   |
|------|-----------|
| en   | English   |
| vi   | Tiếng Việt|
| zh   | 中文       |
| ja   | 日本語     |
| ko   | 한국어     |
| fr   | Français  |
| de   | Deutsch   |
| es   | Español   |
