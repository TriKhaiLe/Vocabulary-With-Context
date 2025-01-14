import { useState } from 'react';

const VocabularyInput = () => {
  const [sentence, setSentence] = useState('');
  const [word, setWord] = useState('');
  const [wordMeaning, setWordMeaning] = useState('');
  const [sentenceMeaning, setSentenceMeaning] = useState('');
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    // Reset error
    setError('');

    // Validate if word exists in sentence
    if (!sentence.toLowerCase().includes(word.toLowerCase())) {
      setError('Từ vựng không tồn tại trong câu!');
      return;
    }

    try {
      // TODO: Implement Gemini API call here
      // For now, we'll just set placeholder translations
      setWordMeaning('Nghĩa của từ sẽ hiển thị ở đây');
      setSentenceMeaning('Nghĩa của câu sẽ hiển thị ở đây');
    } catch (err) {
      setError('Có lỗi xảy ra khi dịch. Vui lòng thử lại!');
    }
  };

  const handleSave = () => {
    // TODO: Implement database save functionality
    if (!sentence || !word || !wordMeaning || !sentenceMeaning) {
      setError('Vui lòng điền đầy đủ thông tin trước khi lưu!');
      return;
    }
    
    const vocabularyData = {
      word,
      wordMeaning,
      context: sentence,
      contextMeaning: sentenceMeaning,
    };
    
    console.log('Saving data:', vocabularyData);
    // TODO: Add actual database save logic
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
        />
      </div>

      <div className="input-group">
        <label>Từ vựng cần học:</label>
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Nhập từ vựng..."
        />
      </div>

      <button onClick={handleTranslate}>Dịch</button>

      <div className="input-group">
        <label>Nghĩa của từ:</label>
        <input
          type="text"
          value={wordMeaning}
          onChange={(e) => setWordMeaning(e.target.value)}
          placeholder="Nghĩa của từ..."
        />
      </div>

      <div className="input-group">
        <label>Nghĩa của câu:</label>
        <textarea
          value={sentenceMeaning}
          onChange={(e) => setSentenceMeaning(e.target.value)}
          placeholder="Nghĩa của câu..."
        />
      </div>

      <button onClick={handleSave}>Lưu</button>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default VocabularyInput;
