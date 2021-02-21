import Predictions from '@aws-amplify/predictions';

export const translate = async (text, language = 'de', targetLanguage = 'en') => {
    const translation = await Predictions.convert({
        translateText: {
            source: {
                text,
                language // defaults configured on aws-exports.js
                // supported languages https://docs.aws.amazon.com/translate/latest/dg/how-it-works.html#how-it-works-language-codes
            },
            targetLanguage
        }
    })
    if (!translation || !translation.text) {
        console.error(`There was an error translating phrase ${text}`);
        return;
    }

    return translation.text;
}

export const convertToSpeech = async (text, language = 'en') => {
    const speech = await Predictions.convert({
        textToSpeech: {
            source: {
                text
            },
            voiceId:  language === 'de'? 'Marlene' : 'Joanna'
        }
    })
    return speech;
}