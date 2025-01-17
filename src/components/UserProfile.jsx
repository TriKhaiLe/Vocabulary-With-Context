import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { translateWithGemini } from '../services/gemini';
import './UserProfile.css';

const UserProfile = () => {
  const [vocabularies, setVocabularies] = useState([]);
  const [score, setScore] = useState(0);
  const [loadingContextList, setLoadingContextList] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVocabularies = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Bạn cần đăng nhập để xem trang cá nhân!');
          return;
        }

        const q = query(collection(db, 'users', user.uid, 'vocabulary'));
        const querySnapshot = await getDocs(q);
        const vocabList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVocabularies(vocabList);

        // Calculate total score
        const totalScore = vocabList.length; // Assuming each vocabulary item gives 1 point
        setScore(totalScore);
      } catch (err) {
        setError('Có lỗi xảy ra khi tải từ vựng. Vui lòng thử lại!');
        console.error('Fetch error:', err);
      }
    };

    fetchVocabularies();
  }, []);

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

  const handleChangeContext = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('Bạn cần đăng nhập để đổi context!');
        return;
      }

      const contextList = vocabularies.filter(vocab => vocab.inContextList);
      for (const vocab of contextList) {
        const newContext = await translateWithGemini(vocab.word, false);
        const vocabDocRef = doc(db, 'users', user.uid, 'vocabulary', vocab.id);
        await updateDoc(vocabDocRef, { context: newContext });
      }

      alert('Đổi context thành công!');
    } catch (err) {
      setError('Có lỗi xảy ra khi đổi context. Vui lòng thử lại!');
      console.error('Change context error:', err);
    }
  };

  return (
    <div className="user-profile">
      <h2>Trang Cá Nhân</h2>
      <p>Tổng điểm của bạn: {score}</p>

      <div className="vocabulary-list">
        {vocabularies.sort((a, b) => a.word.localeCompare(b.word)).map(vocab => (
          <div key={vocab.id} className="vocabulary-item">
            <p><strong>{vocab.word}</strong>: {vocab.wordMeaning}</p>
            <label>
              {loadingContextList[vocab.id] ? (
                <span className="loading-spinner">...</span>
              ) : (
                <input
                  type="checkbox"
                  checked={vocab.inContextList || false}
                  onChange={(e) => handleAddToContextList(vocab.id, e.target.checked)}
                />
              )}
              Đổi context
            </label>
          </div>
        ))}
      </div>

      <button className="change-context-btn" onClick={handleChangeContext}>
        Đổi Context
      </button>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default UserProfile;