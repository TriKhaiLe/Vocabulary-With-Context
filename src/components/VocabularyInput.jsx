import { useState } from 'react';
import { db, auth } from '../config/firebase';
import { collection, addDoc, doc } from 'firebase/firestore';
import { translateWithGemini } from '../services/gemini';
import { Link } from 'react-router-dom';
import './VocabularyInput.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const VocabularyInput = () => {
  const [sentence, setSentence] = useState('');
  const [word, setWord] = useState('');
  const [wordMeaning, setWordMeaning] = useState('');
  const [sentenceMeaning, setSentenceMeaning] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [audio, setAudio] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPhraseMode, setIsPhraseMode] = useState(false);

  const checkSpelling = async (word) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await response.json();

      if (data.title === "No Definitions Found") {
        return { isValid: false, data: null };
      }

      const phonetic = data[0].phonetics.find(p => p.text && p.audio);
      return {
        isValid: true,
        data: {
          text: phonetic ? phonetic.text : '',
          audio: phonetic ? phonetic.audio : ''
        }
      };
    } catch (error) {
      console.error('Spelling check error:', error);
      return { isValid: false, data: null };
    }
  };

  const handleTranslate = async () => {
    // Reset states
    setError('');
    setIsLoading(true);

    try {
      // Validate if word exists in sentence
      if (!sentence.toLowerCase().includes(word.toLowerCase())) {
        setError('Từ vựng không tồn tại trong câu!');
        return;
      }

      if (!isPhraseMode) {
        // Check spelling
        const spellingResult = await checkSpelling(word);
        if (!spellingResult.isValid) {
          setError('Từ vựng không hợp lệ hoặc sai chính tả!');
          return;
        }

        // Save phonetic and audio to state
        setPhonetic(spellingResult.data.text);
        setAudio(spellingResult.data.audio);
      }

      // Translate both word and sentence
      const [wordTranslation, sentenceTranslation] = await Promise.all([
        translateWithGemini(word, true),
        translateWithGemini(sentence, false)
      ]);

      setWordMeaning(wordTranslation);
      setSentenceMeaning(sentenceTranslation);
    } catch (err) {
      setError('Có lỗi xảy ra khi dịch. Vui lòng thử lại!');
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sentence || !word || !wordMeaning || !sentenceMeaning) {
      setError('Vui lòng điền đầy đủ thông tin trước khi lưu!');
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Bạn cần đăng nhập để lưu từ vựng!');
        return;
      }

      const trimmedWord = word.trim();
      const vocabularyData = {
        trimmedWord,
        wordMeaning,
        context: sentence,
        contextMeaning: sentenceMeaning,
        phonetic: isPhraseMode ? '' : phonetic,
        audio: isPhraseMode ? '' : audio,
        createdAt: new Date(),
        userId: user.uid
      };

      const userDocRef = doc(db, 'users', user.uid);
      await addDoc(collection(userDocRef, 'vocabulary'), vocabularyData);
      
      // Clear form after successful save
      setSentence('');
      setWord('');
      setWordMeaning('');
      setSentenceMeaning('');
      setPhonetic('');
      setAudio('');
      
      alert('Lưu từ vựng thành công!');
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu. Vui lòng thử lại!');
      console.error('Save error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="vocabulary-input">
      <h2>Nhập Từ Vựng</h2>
      
      <div className="input-group">
        <label>Câu tiếng Anh:</label>
        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder="Nhập câu tiếng Anh..."
          disabled={isLoading}
        />
      </div>

      <div className="input-group">
        <label>Từ vựng cần học:</label>
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Nhập từ vựng..."
          disabled={isLoading}
        />
      </div>

      <div className="input-group">
        <label>
          <input
            type="checkbox"
            checked={isPhraseMode}
            onChange={(e) => setIsPhraseMode(e.target.checked)}
          />
          Chế độ nhập cụm từ
        </label>
      </div>

      <button onClick={handleTranslate} disabled={isLoading}>
        {isLoading ? 'Đang dịch...' : 'Dịch'}
      </button>

      <div className="input-group">
        <label>Nghĩa của từ:</label>
        <input
          type="text"
          value={wordMeaning}
          onChange={(e) => setWordMeaning(e.target.value)}
          placeholder="Nghĩa của từ..."
          disabled={isLoading}
        />
      </div>

      <div className="input-group">
        <label>Nghĩa của câu:</label>
        <textarea
          value={sentenceMeaning}
          onChange={(e) => setSentenceMeaning(e.target.value)}
          placeholder="Nghĩa của câu..."
          disabled={isLoading}
        />
      </div>

      {audio && !isPhraseMode && (
        <div className="input-group">
          <label>Phát âm:</label>
          <audio controls>
            <source src={audio} type="audio/mpeg" />
            Trình duyệt của bạn không hỗ trợ thẻ audio.
          </audio>
        </div>
      )}

      <button className="btn btn-primary" onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Đang lưu...' : 'Lưu'}
      </button>

      {error && <div className="error-message">{error}</div>}

      <div className="navigation-links">
        <Link to="/review">Ôn Tập Từ Vựng</Link>
      </div>
    </div>
  );
};

export default VocabularyInput;