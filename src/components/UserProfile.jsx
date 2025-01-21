import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { translateWithGemini, findNewContextWithGemini } from '../services/gemini';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
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

        const scoreDocRef = doc(db, 'users', user.uid, 'scores', 'total');
        const scoreDoc = await getDoc(scoreDocRef);
  
        if (scoreDoc.exists()) {
          setScore(scoreDoc.data().points || 0);
        } else {
          setScore(0);
        }
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
        const newContext = await findNewContextWithGemini(vocab.word);
        const newContextMeaning = await translateWithGemini(newContext, false);
        const vocabDocRef = doc(db, 'users', user.uid, 'vocabulary', vocab.id);
        await updateDoc(vocabDocRef, { context: newContext, contextMeaning: newContextMeaning });
      }

      alert('Đổi context thành công!');
    } catch (err) {
      setError('Có lỗi xảy ra khi đổi context. Vui lòng thử lại!');
      console.error('Change context error:', err);
    }
  };

  const playAudio = (audioSrc) => {
    const audio = new Audio(audioSrc);
    audio.play();
  };

  return (
    <div className="user-profile">
      <h2>Trang Cá Nhân</h2>
      <p>Tổng điểm của bạn: {score}</p>

      <div className="vocabulary-list">
        {vocabularies.sort((a, b) => a.word.localeCompare(b.word)).map(vocab => (
          <div key={vocab.id} className="vocabulary-item">
            <div className="word">
              {vocab.word}
              {vocab.audio && (
                <FontAwesomeIcon
                  icon={faPlay}
                  onClick={() => playAudio(vocab.audio)}
                  className="audio-icon"
                />
              )}
            </div>
            <p><strong>Nghĩa:</strong> {vocab.wordMeaning}</p>
            <p><strong>Context:</strong> {vocab.context}</p>
            <p><strong>Nghĩa của câu:</strong> {vocab.contextMeaning}</p>
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