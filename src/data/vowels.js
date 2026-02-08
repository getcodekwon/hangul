export const VOWELS = [
    { char: 'ㅏ', label: '아', color: '#FF6B6B' },
    { char: 'ㅐ', label: '애', color: '#4ECDC4' },
    { char: 'ㅣ', label: '이', color: '#45B7D1' },
    { char: 'ㅗ', label: '오', color: '#FFA07A' },
    { char: 'ㅜ', label: '우', color: '#98D8C8' }
];

export const CONSONANTS = [
    'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// Helper to combine consonant + vowel
// Using String.fromCharCode for Hangul composition
// Hangul Syllable = (Initial * 588) + (Medial * 28) + Final + 44032
// Intials: ㄱ,ㄲ,ㄴ,ㄷ,ㄸ,ㄹ,ㅁ,ㅂ,ㅃ,ㅅ,ㅆ,ㅇ,ㅈ,ㅉ,ㅊ,ㅋ,ㅌ,ㅍ,ㅎ (19 total)
// Vowels: ㅏ,ㅐ,ㅑ,ㅒ,ㅓ,ㅔ,ㅕ,ㅖ,ㅗ,ㅘ,ㅙ,ㅚ,ㅛ,ㅜ,ㅝ,ㅞ,ㅟ,ㅠ,ㅡ,ㅢ,ㅣ (21 total)
// We only need basic ones.

const INITIALS = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const MEDIALS = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];

export function combineHangul(consonant, vowel) {
    const initialIdx = INITIALS.indexOf(consonant);
    const medialIdx = MEDIALS.indexOf(vowel);

    if (initialIdx === -1 || medialIdx === -1) return consonant + vowel; // Fallback

    const code = 44032 + (initialIdx * 588) + (medialIdx * 28);
    return String.fromCharCode(code);
}
