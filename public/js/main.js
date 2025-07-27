// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const likeBtn = document.querySelector('.like-btn');
  if (likeBtn) {
    likeBtn.addEventListener('click', async () => {
      const postId = likeBtn.dataset.id;
      const res = await fetch(`/like/${postId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        document.querySelector('.like-count').textContent = data.likes;
        likeBtn.disabled = true;
      } else {
        alert(data.message || 'Already liked');
      }
    });
  }

  const commentForm = document.getElementById('comment-form');
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const postId = commentForm.dataset.postId;
      const username = document.getElementById('username').value;
      const text = document.getElementById('comment-text').value;

      const res = await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, username, text }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Comment added!');
        location.reload();
      } else {
        alert(data.message || 'Failed to comment');
      }
    });
  }
});
