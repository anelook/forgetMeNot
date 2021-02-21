import React, {useState} from 'react';
import './App.css';
import Amplify from 'aws-amplify';
import  {AmazonAIPredictionsProvider} from '@aws-amplify/predictions';
import awsconfig from './aws-exports';
import {convertToSpeech, translate} from './helpers';

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());

function App() {
    const [text, setText] = useState('');
    const [recordings, setRecordings] = useState([]);

    const onChange = (event) => {
        setText(event.target.value);
    };

    const generateText = async () => {
        const phrasesToLearn = text.split(/\r?\n/);

        const phrases = [];
        for (const toLearn of phrasesToLearn) {
            const original = await translate(toLearn);
            phrases.push({
                original, toLearn
            })
        }

        for (const phrase of phrases) {
            if (!phrase.original || !phrase.toLearn) {
                console.error(`Could not process one of the phrases. Original or text to lear is empty.
                            original: ${phrase.original} toLearn:${phrase.toLearn}`)
                continue;
            }

            const recordingOriginal = await convertToSpeech(`Translate '${phrase.original}'`);
            const recordingToLearn = await convertToSpeech(`Die richtige Antwort ist '${phrase.toLearn}'`, 'de');

            if (recordingOriginal.speech && recordingToLearn.speech) {
                const newRecording = [
                    {url: recordingOriginal.speech.url, volume: 1}, //question
                    {url: recordingOriginal.speech.url, volume: 0}, // time to remember the phrase
                    {url: recordingToLearn.speech.url, volume: 1} // answer
                ];
                setRecordings(recordings => [...recordings, ...newRecording]);
            }
        }
    }

    const playPhrases = () => {
        let i = 0;
        const audio = new Audio();
        audio.src = recordings[i].url;
        audio.play();
        audio.onended = () => {
            if (i < recordings.length - 1) {
                i++;
                audio.src = recordings[i].url;
                audio.volume = recordings[i].volume;
                audio.play();
            }
        };
    }

    return (
        <div className="App">
            <h1>Forget me not &#127891;</h1>
            <h2>Generate audio to practice words you've learned</h2>
            <textarea rows="10" cols="50" name="text" placeholder="Enter list of phrases you want to practice"
                      value={text} onChange={onChange}/>
            <br/>
            <div className='buttons'>
                <button type="button" onClick={generateText}>Generate</button>
                <button type="button" onClick={playPhrases}>Play</button>
            </div>
        </div>
    );
}

export default App;
