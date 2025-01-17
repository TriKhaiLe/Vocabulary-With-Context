import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const VocabularyReview = () => {
  const [vocabularies, setVocabularies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState('');
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');
  const [loadingContextList, setLoadingContextList] = useState({});

  useEffect(() => {
    const fetchVocabularies = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Bạn cần đăng nhập để ôn tập từ vựng!');
          return;
        }

        const q = query(collection(db, 'users', user.uid, 'vocabulary'));
        const querySnapshot = await getDocs(q);
        const vocabList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVocabularies(vocabList);
      } catch (err) {
        setError('Có lỗi xảy ra khi tải từ vựng. Vui lòng thử lại!');
        console.error('Fetch error:', err);
      }
    };

    fetchVocabularies();
  }, []);

  const handleCheckAnswer = () => {
    const trimmedSelectedWord = selectedWord.trim().toLowerCase();
    const trimmedWord = vocabularies[currentIndex].word.trim().toLowerCase();

    if (trimmedSelectedWord === trimmedWord) {
      setScore(score + 1);
      alert('Chính xác! Điểm của bạn: ' + (score + 1));
    } else {
      alert('Sai rồi! Từ đúng là: ' + vocabularies[currentIndex].word);
    }

    setCurrentIndex(currentIndex + 1);
    setSelectedWord('');
  };

  const handleAddToContextList = async (vocabularyId, isChecked) => {
    setLoadingContextList(prev => ({ ...prev, [vocabularyId]: true }));

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Bạn cần đăng nhập để thêm từ vựng vào danh sách đổi context!');
        return;
      }

      const vocabDocRef = doc(db, 'users', user.uid, 'vocabulary', vocabularyId);
      await updateDoc(vocabDocRef, { inContextList: isChecked });

      // Update local state after successful update
      setVocabularies(prevVocabularies =>
        prevVocabularies.map(vocab =>
          vocab.id === vocabularyId ? { ...vocab, inContextList: isChecked } : vocab
        )
      );
    } catch (err) {
      setError('Có lỗi xảy ra khi cập nhật danh sách đổi context. Vui lòng thử lại!');
      console.error('Update context list error:', err);
    } finally {
      setLoadingContextList(prev => ({ ...prev, [vocabularyId]: false }));
    }
  };

  if (currentIndex >= vocabularies.length) {
    return <div>Bạn đã hoàn thành ôn tập từ vựng! Điểm của bạn: {score}</div>;
  }

  const currentVocab = vocabularies[currentIndex];
  const sentenceWithBlank = currentVocab.context.replace(new RegExp(currentVocab.word, 'gi'), '_____');

  return (
    <div className="vocabulary-review">
      <h2>Ôn Tập Từ Vựng</h2>
      <p>Điểm của bạn: {score}</p>
      <div className="sentence">
        <p>{sentenceWithBlank}</p>
      </div>
      <div className="input-group">
        <label>Chọn từ đúng:</label>
        <input
          type="text"
          value={selectedWord}
          onChange={(e) => setSelectedWord(e.target.value)}
          placeholder="Nhập từ vựng..."
        />
      </div>
      <button onClick={handleCheckAnswer}>Kiểm tra</button>
      <div className="context-list">
        <label>
          {loadingContextList[currentVocab.id] ? (
            <span className="loading-spinner">...</span>
          ) : (
            <input
              type="checkbox"
              checked={currentVocab.inContextList || false}
              onChange={(e) => handleAddToContextList(currentVocab.id, e.target.checked)}
            />
          )}
          Thêm từ vựng này vào danh sách đổi context
        </label>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default VocabularyReview;