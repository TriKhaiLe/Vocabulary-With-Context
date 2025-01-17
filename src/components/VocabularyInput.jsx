import { useState } from 'react';
import { db, auth } from '../config/firebase';
import { collection, addDoc, doc } from 'firebase/firestore';
import { translateWithGemini } from '../services/gemini';
import { Link } from 'react-router-dom';
import './VocabularyInput.css';

const VocabularyInput = () => {
  const [sentence, setSentence] = useState('');
  const [word, setWord] = useState('');
  const [wordMeaning, setWordMeaning] = useState('');
  const [sentenceMeaning, setSentenceMeaning] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

      const vocabularyData = {
        word,
        wordMeaning,
        context: sentence,
        contextMeaning: sentenceMeaning,
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

      <button onClick={handleSave} disabled={isLoading}>
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