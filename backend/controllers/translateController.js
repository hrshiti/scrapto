import axios from 'axios';

// Simple in-memory cache to save API calls
const translationCache = new Map();

/**
 * Translate text using Google Cloud Translation API
 * Handles both single 'text' and batch 'texts' inputs.
 */
export const translateText = async (req, res) => {
    try {
        let { text, texts, targetLanguage, targetLang } = req.body;

        // Normalize inputs
        const inputTexts = texts || text;
        const target = targetLanguage || targetLang;

        if (!inputTexts || !target) {
            return res.status(400).json({
                success: false,
                message: 'Text(s) and target language are required'
            });
        }

        // Return original if target is English (default)
        if (target === 'en') {
            const isBatch = Array.isArray(inputTexts);
            return res.status(200).json({
                success: true,
                translatedText: inputTexts,
                translations: isBatch ? inputTexts : [inputTexts],
                data: {
                    translations: isBatch ? inputTexts : [inputTexts]
                }
            });
        }

        const q = Array.isArray(inputTexts) ? inputTexts : [inputTexts];
        const API_KEY = process.env.GOOGLE_CLOUD_TRANSLATE_API_KEY;

        // Check cache for all items
        const cacheKey = `${q.join('|')}_${target}`;
        if (translationCache.has(cacheKey)) {
            const cached = translationCache.get(cacheKey);
            return res.status(200).json({
                success: true,
                translatedText: Array.isArray(inputTexts) ? cached : cached[0],
                translations: cached,
                data: {
                    translations: cached
                },
                cached: true
            });
        }

        // MOCK TRANSLATION (Fallback)
        if (!API_KEY) {
            const translations = q.map(t => `[${target}] ${t}`);
            translationCache.set(cacheKey, translations);

            return res.status(200).json({
                success: true,
                translatedText: Array.isArray(inputTexts) ? translations : translations[0],
                translations: translations,
                data: {
                    translations: translations
                },
                warning: "Running in mock mode. Add GOOGLE_CLOUD_TRANSLATE_API_KEY to .env for real translations."
            });
        }

        // REAL TRANSLATION using Google Cloud Translation API
        const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

        // Google API supports multiple 'q' parameters
        const response = await axios.post(url, {
            q: q,
            target: target,
            format: 'text'
        });

        const apiTranslations = response.data.data.translations.map(t => t.translatedText);

        // Cache the result
        translationCache.set(cacheKey, apiTranslations);

        res.status(200).json({
            success: true,
            translatedText: Array.isArray(inputTexts) ? apiTranslations : apiTranslations[0],
            translations: apiTranslations,
            data: {
                translations: apiTranslations
            }
        });

    } catch (error) {
        console.error('Translation error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: 'Translation failed',
            error: error.response?.data?.error?.message || error.message
        });
    }
};
