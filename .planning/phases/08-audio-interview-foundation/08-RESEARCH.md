# Phase 8: Audio Interview Foundation - Research

**Researched:** 2026-03-14
**Domain:** Audio recording, speech-to-text transcription, step-by-step form wizards
**Confidence:** HIGH

## Summary

Web audio recording with automatic transcription requires coordinating browser MediaRecorder API, file upload handling, and external transcription services. The MediaRecorder API provides robust cross-browser audio capture with proper format detection, while OpenAI Whisper offers the most accurate and cost-effective transcription. React step wizards benefit from headless state management libraries that separate navigation logic from UI rendering.

**Primary recommendation:** Use MediaRecorder API with format fallbacks, OpenAI Whisper for transcription, and react-step-wizard for navigation state management.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- One question per screen with full-screen focus for clean, focused experience
- Include comprehensive guidance: question text plus context, recording tips, and helpful information
- Question prominent, guidance secondary: large question text with supporting guidance in smaller text below
- Question numbers visible on each screen ("Question 3 of 12" style numbering)
- Step indicator showing visual steps/dots with current position and completed sections
- Auto-save after each question: save audio and progress immediately when user moves to next question
- Immediate submission: automatically submit once final question is answered (no review screen)
- Next steps explanation: show what happens next including advisor review process and timeline expectations

### Claude's Discretion
- Specific visual styling and spacing for question/guidance hierarchy
- Step indicator design details (dots vs progress steps vs other visual approach)
- Auto-save technical implementation and error handling
- Exact wording for next steps explanation

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MediaRecorder API | Native | Audio recording | Browser native, no dependencies |
| OpenAI Whisper API | Latest | Audio transcription | Most accurate, $0.006/min (cheapest) |
| react-step-wizard | ^5.3.0 | Wizard state management | Headless, flexible, mature |
| react-hook-form | ^7.50.0 | Form state | Standard for React forms |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| FormData API | Native | File upload | Audio blob uploading |
| React Context | Native | State sharing | Cross-component state |
| @hookform/resolvers | ^3.3.0 | Form validation | If validation needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| OpenAI Whisper | Azure Speech | More expensive ($0.017/min vs $0.006/min) |
| react-step-wizard | react-multistep | Less mature, fewer features |
| Native MediaRecorder | RecordRTC library | Extra dependency, not needed for basic recording |

**Installation:**
```bash
npm install react-step-wizard react-hook-form @hookform/resolvers
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── AudioRecorder/     # Recording UI and logic
│   ├── StepIndicator/     # Progress visualization
│   └── QuestionDisplay/   # Question/guidance layout
├── hooks/
│   ├── useAudioRecorder.js  # Recording state management
│   ├── useTranscription.js  # API integration
│   └── useAutoSave.js      # Progress persistence
└── services/
    ├── transcriptionApi.js  # OpenAI Whisper integration
    └── storage.js          # Auto-save implementation
```

### Pattern 1: Headless Wizard State
**What:** Separate state management from UI rendering
**When to use:** Complex multi-step flows with custom UI requirements
**Example:**
```typescript
// Source: https://github.com/jcmcneal/react-step-wizard
import StepWizard from 'react-step-wizard';

const InterviewWizard = () => (
  <StepWizard>
    <QuestionStep stepName="question-1" />
    <QuestionStep stepName="question-2" />
  </StepWizard>
);
```

### Pattern 2: Audio Recording with Format Detection
**What:** Progressive format detection for cross-browser compatibility
**When to use:** When supporting all modern browsers including Safari
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
const getPreferredMimeType = () => {
  const types = [
    'audio/webm;codecs=opus',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/webm',
    'audio/mp4'
  ];
  return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
};
```

### Pattern 3: Auto-save with Progress Persistence
**What:** Save state immediately after each step completion
**When to use:** Long forms where users might lose progress
**Example:**
```typescript
const useAutoSave = (stepData, currentStep) => {
  useEffect(() => {
    const saveProgress = async () => {
      await localStorage.setItem('interview-progress', JSON.stringify({
        currentStep,
        data: stepData,
        timestamp: Date.now()
      }));
    };
    saveProgress();
  }, [stepData, currentStep]);
};
```

### Anti-Patterns to Avoid
- **Hardcoded MIME types:** Browser support varies, always check isTypeSupported()
- **Manual Content-Type headers:** FormData sets boundary automatically
- **Synchronous audio processing:** Use async/await for all audio operations

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio format conversion | Custom encoder | Server-side conversion or multiple recording formats | Complex codec handling, browser inconsistencies |
| Step navigation state | Custom stepper logic | react-step-wizard | Mature validation, navigation patterns |
| Audio transcription | Client-side speech recognition | OpenAI Whisper API | Accuracy, language support, noise handling |
| File upload progress | Custom progress tracking | Native fetch with progress events | Browser optimization, error handling |

**Key insight:** Audio handling has many edge cases (codec support, mobile limitations, file size limits) that mature libraries solve.

## Common Pitfalls

### Pitfall 1: Safari Audio Format Incompatibility
**What goes wrong:** Recording in Chrome/Firefox produces WebM files that Safari can't process
**Why it happens:** Different browsers support different audio codecs by default
**How to avoid:** Always use MediaRecorder.isTypeSupported() to detect format capabilities
**Warning signs:** Transcription failures on iOS devices, "unsupported format" errors

### Pitfall 2: MediaRecorder HTTPS Requirement
**What goes wrong:** getUserMedia() fails in production but works in development
**Why it happens:** Browser security requires HTTPS for microphone access (localhost is exempt)
**How to avoid:** Ensure HTTPS in all non-localhost environments
**Warning signs:** "NotAllowedError" or "permission denied" in production

### Pitfall 3: Mobile Audio Recording Limitations
**What goes wrong:** Recording stops unexpectedly on mobile devices
**Why it happens:** Mobile browsers limit CPU usage and memory for background processes
**How to avoid:** Implement shorter recording segments, proper error handling
**Warning signs:** Inconsistent recording behavior on mobile, memory errors

### Pitfall 4: Blob Memory Leaks
**What goes wrong:** Application memory grows with each recording
**Why it happens:** createObjectURL() creates URLs that aren't automatically garbage collected
**How to avoid:** Always call URL.revokeObjectURL() after use
**Warning signs:** Increasing memory usage over time, browser slowdown

## Code Examples

Verified patterns from official sources:

### Cross-Browser Audio Recording
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getPreferredMimeType();
    const mediaRecorder = new MediaRecorder(stream, { mimeType });

    const chunks = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      handleRecordingComplete(blob);
    };

    mediaRecorder.start();
    return mediaRecorder;
  } catch (error) {
    console.error('Recording failed:', error);
    throw error;
  }
};
```

### File Upload with FormData
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_FormData_Objects
const uploadAudioFile = async (blob, filename) => {
  const formData = new FormData();
  formData.append('audio', blob, filename);
  formData.append('questionId', questionId);

  try {
    const response = await fetch('/api/upload-audio', {
      method: 'POST',
      body: formData
      // Don't set Content-Type - browser sets multipart boundary
    });

    if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
```

### OpenAI Whisper Integration
```typescript
// Source: https://developers.openai.com/api/docs/guides/speech-to-text
const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData
  });

  return response.json();
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flash-based recording | MediaRecorder API | 2018-2020 | Native browser support, no plugins |
| Google Speech API | OpenAI Whisper | 2022-2023 | Better accuracy, lower cost |
| Custom form state | Headless libraries | 2021-2022 | Separation of concerns, reusability |
| Manual progress tracking | Auto-save patterns | 2020-2021 | Better UX, data persistence |

**Deprecated/outdated:**
- Flash-based audio recording: Security issues, browser deprecation
- WebRTC recording libraries: Native MediaRecorder now sufficient
- Client-side speech recognition: Accuracy and privacy concerns

## Open Questions

1. **Audio file size limits for mobile devices**
   - What we know: 25MB limit for OpenAI Whisper API
   - What's unclear: Optimal recording duration before auto-submit
   - Recommendation: Test with 5-10 minute segments, implement chunking if needed

2. **Offline functionality for recording**
   - What we know: MediaRecorder works offline
   - What's unclear: Storage limitations for cached audio files
   - Recommendation: Implement IndexedDB storage with sync on reconnection

## Sources

### Primary (HIGH confidence)
- [MediaRecorder - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Speech to text | OpenAI API](https://developers.openai.com/api/docs/guides/speech-to-text)
- [Using FormData Objects - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest_API/Using_FormData_Objects)

### Secondary (MEDIUM confidence)
- [Best Speech-to-Text APIs in 2026: A Comprehensive Comparison Guide](https://deepgram.com/learn/best-speech-to-text-apis-2026)
- [React step-wizard - npm](https://www.npmjs.com/package/react-step-wizard)
- [Build a Multistep Form With React Hook Form | ClarityDev blog](https://claritydev.net/blog/build-a-multistep-form-with-react-hook-form)

### Tertiary (LOW confidence)
- [MediaRecorder API | Can I use... Support tables](https://caniuse.com/mediarecorder)
- [Beyond the Progress Bar: The Art of Stepper UI Design | Medium](https://medium.com/@david.pham_1649/beyond-the-progress-bar-the-art-of-stepper-ui-design-cfa270a8e862)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - MediaRecorder and Whisper are well-documented with clear pricing/features
- Architecture: MEDIUM - Patterns verified through official docs, some implementation details need testing
- Pitfalls: HIGH - Browser compatibility issues well-documented, common problems identified

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (30 days - stable APIs with clear documentation)