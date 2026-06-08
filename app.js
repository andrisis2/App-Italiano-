// TTS Utility
function speak(text, lang = 'it-IT') {
  if (!window.speechSynthesis) {
    alert('Il tuo browser non supporta la sintesi vocale.');
    return;
  }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.88;
  utt.pitch = 1;
  utt.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const itVoice = voices.find(v => v.lang.startsWith('it'));
  if (itVoice) utt.voice = itVoice;
  window.speechSynthesis.speak(utt);
  return utt;
}

function attachSpeakerButtons() {
  document.querySelectorAll('[data-speak]').forEach(btn => {
    btn.addEventListener('click', function () {
      const text = this.getAttribute('data-speak');
      const lang = this.getAttribute('data-lang') || 'it-IT';
      const utt = speak(text, lang);
      if (!utt) return;
      this.classList.add('speaking');
      utt.onend = () => this.classList.remove('speaking');
      utt.onerror = () => this.classList.remove('speaking');
    });
  });
}

function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
    else a.classList.remove('active');
  });
}

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {};
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  attachSpeakerButtons();
});
