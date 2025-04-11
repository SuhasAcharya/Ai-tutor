import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { NextResponse } from 'next/server';

// Ensure credentials are handled correctly (usually via GOOGLE_APPLICATION_CREDENTIALS env var)
const ttsClient = new TextToSpeechClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const text = body.text;
    const languageCode = body.languageCode || 'kn-IN'; // Default to Kannada
    const voiceName = body.voiceName || 'kn-IN-Wavenet-A'; // Default to a high-quality Kannada voice (Female)
    // Other options: 'kn-IN-Wavenet-B' (Male) - Check Google Cloud docs for latest voices

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log(`TTS Request: Language=${languageCode}, Voice=${voiceName}, Text="${text}"`);

    const request = {
      input: { text: text },
      // Select the language code and SSML voice name
      voice: { languageCode: languageCode, name: voiceName },
      // Select the type of audio encoding
      audioConfig: { audioEncoding: 'MP3' }, // MP3 is widely supported
    };

    // Performs the text-to-speech request
    const [response] = await ttsClient.synthesizeSpeech(request);

    // Get the audio content from the response
    const audioContent = response.audioContent;

    // Return the audio content as base64 encoded string
    return NextResponse.json({ audioBase64: audioContent.toString('base64') });

  } catch (error) {
    console.error('Error in TTS API:', error);
    // Provide a more specific error message if possible
    const errorMessage = error.details || error.message || 'Failed to synthesize speech';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 