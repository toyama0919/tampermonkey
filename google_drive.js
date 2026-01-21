// ==UserScript==
// @name         Google Drive Navigation
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  Ctrl+Enter to send selected file info to Gemini
// @author       toyama0919
// @match        https://drive.google.com/drive/*
// @updateURL    https://raw.githubusercontent.com/toyama0919/tampermonkey/master/google_drive.js
// @downloadURL  https://raw.githubusercontent.com/toyama0919/tampermonkey/master/google_drive.js
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const isInputFocused = () => {
    const el = document.activeElement;
    return el && (
      el.tagName === 'INPUT' ||
      el.tagName === 'TEXTAREA' ||
      el.isContentEditable
    );
  };

  const getSelectedFileRow = () => {
    const row = document.querySelector('[role="row"][aria-selected="true"]');
    if (!row) return null;

    // フォルダは除外（gridcellを含む）
    return row.querySelector('[role="gridcell"]') ? null : row;
  };

  const getFileUrl = (row) => {
    const fileId = row.getAttribute('data-id');
    return fileId ? `https://drive.google.com/file/d/${fileId}/view` : null;
  };

  const getFileName = (row) => {
    const text = row.textContent?.trim() || '';
    const parts = text.split(/\s+/);

    if (parts.length >= 2) {
      // "Google スプレッドシート ファイル名" -> parts[2]
      if (parts[0] === 'Google' && parts[1] === 'スプレッドシート') {
        return parts[2] || 'ファイル';
      }
      // "PDF ファイル名" -> parts[1]
      return parts[1] || 'ファイル';
    }

    return parts[0] || 'ファイル';
  };

  const openInGemini = (fileName, fileUrl) => {
    const query = fileUrl
      ? `ファイル名: ${fileName}\nURL: ${fileUrl}\n\nこのファイルを要約してください。`
      : `ファイル名: ${fileName}\n\nこのファイルを要約してください。`;

    const geminiUrl = `https://gemini.google.com/app?q=${encodeURIComponent(query)}`;
    window.open(geminiUrl, '_blank');
  };

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      return;
    }

    if (isInputFocused()) return;

    const row = getSelectedFileRow();
    if (!row) return;

    e.preventDefault();
    e.stopPropagation();

    const fileName = getFileName(row);
    const fileUrl = getFileUrl(row);
    openInGemini(fileName, fileUrl);
  });

})();
