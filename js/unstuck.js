import { getCurrentLanguage } from './i18n.js?v=2.8';

const strings = {
  en: {
    button: 'Unstuck',
    description: 'Clear a stuck loading spinner without restarting the game. Keeps saved CW progress.',
    offline: 'Connect to the GaC server first.',
    queued: 'Recovery queued. Waiting for the game…',
    completed: 'The game cleared its network wait. Try closing or retrying the page.',
    delayed: 'No acknowledgement from the game yet. Recovery is still queued; the game must be connected.',
    failed: 'The game could not clear the wait.',
    unsupported: 'This server does not support Unstuck yet.'
  },
  th: {
    button: 'Unstuck / แก้ค้าง',
    description: 'ปลดตัวหมุนค้างโดยไม่ต้องออกเกม และเก็บเซฟรอบ CW ไว้',
    offline: 'เชื่อมต่อเซิร์ฟเวอร์ GaC ก่อน',
    queued: 'ส่งคำสั่งแล้ว กำลังรอเกมตอบกลับ…',
    completed: 'เกมปลดการรอแพ็กเก็ตแล้ว ลองปิดหน้าต่างหรือกดใหม่ได้',
    delayed: 'เกมยังไม่ตอบรับ คำสั่งยังอยู่ในคิวและต้องเชื่อมต่อเกมไว้',
    failed: 'เกมปลดการรอไม่สำเร็จ',
    unsupported: 'เซิร์ฟเวอร์นี้ยังไม่รองรับ Unstuck'
  }
};

export function initializeUnstuck({ apiCall, isConnected, showToast }) {
  const button = document.getElementById('btn-client-unstuck');
  const description = document.getElementById('client-unstuck-description');
  const status = document.getElementById('client-unstuck-status');
  if (!button) return;
  const text = () => strings[getCurrentLanguage()] || strings.en;
  const translate = () => {
    button.textContent = text().button;
    if (description) description.textContent = text().description;
  };
  translate();
  document.getElementById('lang-select')?.addEventListener('change', translate);
  button.addEventListener('click', async () => {
    if (!isConnected()) { showToast(text().offline, 'error'); return; }
    button.disabled = true;
    try {
      const result = await apiCall('/api/client/unstuck', 'POST', {});
      if (!result?.request_id || result.state !== 'queued') throw new Error(text().unsupported);
      if (status) status.textContent = text().queued;
      for (let attempt = 0; attempt < 16; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 750));
        const acknowledgement = await apiCall('/api/client/unstuck');
        if (acknowledgement?.request_id !== result.request_id) continue;
        if (acknowledgement.state === 'completed') {
          if (status) status.textContent = text().completed;
          showToast(text().completed, 'success');
          return;
        }
        if (acknowledgement.state === 'failed') {
          throw new Error(acknowledgement.error || text().failed);
        }
      }
      if (status) status.textContent = text().delayed;
    } catch (error) {
      if (status) status.textContent = error.message;
      showToast(error.message, 'error');
    } finally {
      button.disabled = false;
    }
  });
}
