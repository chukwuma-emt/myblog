document.addEventListener('DOMContentLoaded', () => {
  const likeBtn = document.getElementById('likeBtn');
  const likeCount = document.getElementById('likeCount');

  // Prevent double click spamming
  if (likeBtn && likeCount) {
    let liked = false;

    likeBtn.addEventListener('click', async () => {
      if (liked) return;
      liked = true;

      const postId = likeBtn.dataset.postid;
      try {
        const res = await fetch(`/like/${postId}`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          likeCount.textContent = data.likes;
          likeBtn.disabled = true;
        } else {
          alert(data.message || 'Error liking post');
          liked = false; // Allow retry
        }
      } catch (err) {
        console.error('Like error:', err);
        liked = false;
      }
    });
  }

  // COMMENT FORM
  const commentForm = document.getElementById('commentForm');
  const commentList = document.getElementById('commentList');

  if (commentForm && commentList) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const postId = document.getElementById('postId').value;
      const username = document.getElementById('username').value.trim();
      const text = document.getElementById('commentText').value.trim();

      if (!username || !text) {
        return alert('Please fill in both fields.');
      }

      try {
        const res = await fetch('/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, username, text })
        });

        const data = await res.json();
        if (data.success && data.comment) {
          const newComment = document.createElement('div');
          newComment.className = 'comment';
          newComment.innerHTML = `<strong>${data.comment.username}:</strong> ${data.comment.text}`;
          commentList.prepend(newComment);
          commentForm.reset();
        } else {
          alert(data.message || 'Error posting comment');
        }
      } catch (err) {
        console.error('Comment error:', err);
        alert('Error posting comment');
      }
    });
  }

  
});
