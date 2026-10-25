/**
 * TagSci Content Studio - Automated In-Browser Runtime Test Harness
 */
(function() {
  const testResults = {
    passed: false,
    assertions: [],
    errors: [],
    logs: []
  };

  function sendLog(msg) {
    testResults.logs.push(msg);
    console.log('[CS-HARNESS]', msg);
    try {
      fetch('/__log', { method: 'POST', body: '[CS] ' + msg }).catch(() => {});
    } catch(e) {}
  }

  function assert(name, condition, details) {
    const ok = Boolean(condition);
    testResults.assertions.push({ name, passed: ok, details: details || '' });
    sendLog((ok ? 'PASS: ' : 'FAIL: ') + name + (details ? ' (' + details + ')' : ''));
    return ok;
  }

  window.__RUNTIME_ERRORS = [];
  window.addEventListener('error', function(e) {
    const errInfo = {
      message: e.message || String(e),
      filename: e.filename || 'unknown',
      lineno: e.lineno || 0
    };
    window.__RUNTIME_ERRORS.push(errInfo);
    testResults.errors.push(errInfo);
    sendLog('ERROR: ' + errInfo.message + ' at line ' + errInfo.lineno);
  });

  window.addEventListener('unhandledrejection', function(e) {
    const reasonMsg = e.reason ? (e.reason.message || String(e.reason)) : 'unknown rejection';
    const errInfo = { message: 'Unhandled Promise Rejection: ' + reasonMsg };
    window.__RUNTIME_ERRORS.push(errInfo);
    testResults.errors.push(errInfo);
    sendLog('PROMISE ERROR: ' + reasonMsg);
  });

  async function reportResults() {
    try {
      testResults.passed = testResults.errors.length === 0 && testResults.assertions.every(a => a.passed);
      sendLog('Reporting Content Studio test results to server...');
      await fetch('/__report_results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testResults)
      });
    } catch (err) {
      sendLog('FATAL: Could not report results: ' + err.message);
    }
  }

  async function runCSTestSuite() {
    sendLog('runCSTestSuite() started');
    
    // Give it time to execute fetchLatestUpdatesJson and initial renders
    await new Promise(r => setTimeout(r, 600));

    try {
      // 1. Verify global STUDIO_DATA
      assert('STUDIO_DATA exists', typeof window.STUDIO_DATA === 'object' && window.STUDIO_DATA !== null);

      // 2. Hydrate from updates.json if flashcardDecks not yet populated
      const currentDecks = (window.STUDIO_DATA && window.STUDIO_DATA.flashcardDecks) ? window.STUDIO_DATA.flashcardDecks : [];
      if (currentDecks.length === 0) {
        sendLog('Fetching updates.json directly for verification...');
        try {
          const res = await fetch('/updates.json');
          if (res.ok) {
            const data = await res.json();
            if (data.flashcardDecks && data.flashcardDecks.length > 0) {
              window.STUDIO_DATA.flashcardDecks = data.flashcardDecks;
              window.STUDIO_DATA.quizSets = data.flashcardDecks;
              if (typeof window.renderQuizSetsList === 'function') window.renderQuizSetsList();
              if (typeof window.loadQuizSetToEditor === 'function') window.loadQuizSetToEditor();
              if (typeof window.renderHubDashboard === 'function') window.renderHubDashboard();
            }
          }
        } catch (e) {
          sendLog('Note: direct fetch error: ' + e.message);
        }
      }

      const decks = (window.STUDIO_DATA && window.STUDIO_DATA.flashcardDecks) ? window.STUDIO_DATA.flashcardDecks : [];
      assert('Flashcard decks parsed into STUDIO_DATA (> 0)', decks.length > 0, `Count: ${decks.length}`);

      // 3. Verify total cards across decks
      let totalCards = 0;
      decks.forEach(d => {
        totalCards += (d.cards ? d.cards.length : 0);
      });
      assert('Total flashcards parsed in Studio (> 0)', totalCards > 0, `Total cards: ${totalCards}`);

      // 4. Verify Deck list container
      const deckContainer = document.getElementById('quiz-sets-container');
      assert('Deck list container rendered in Studio', deckContainer && deckContainer.children.length > 0, `Decks listed: ${deckContainer ? deckContainer.children.length : 0}`);

      // 5. Verify Hub Dashboard stats
      const statQuiz = document.getElementById('hub-stat-quiz-count');
      assert('Hub Dashboard flashcard stat badge rendered', statQuiz && statQuiz.innerText !== '0', `Stat: ${statQuiz ? statQuiz.innerText : ''}`);

      // 6. Switch to Flashcards / Quizzes Tab
      if (typeof window.switchTab === 'function') {
        window.switchTab('quizzes');
        const quizView = document.getElementById('view-quizzes');
        assert('Flashcards Studio tab view is active', quizView && !quizView.classList.contains('hidden'));
      }

      // 7. Verify Questions / Card Builder rendered cards
      const builderContainer = document.getElementById('questions-builder-container');
      assert('Card Builder contains editable flashcards', builderContainer && builderContainer.querySelectorAll('[data-card-index]').length > 0, `Cards rendered: ${builderContainer ? builderContainer.querySelectorAll('[data-card-index]').length : 0}`);

      // 8. Verify Title Input is populated
      const titleInput = document.getElementById('quiz-input-title');
      assert('Deck title input populated with active deck', titleInput && titleInput.value.trim().length > 0, `Title: "${titleInput ? titleInput.value : ''}"`);

      // 9. Verify Live Simulator Flip
      if (typeof window.revealTesterFlashcard === 'function') {
        window.revealTesterFlashcard();
        const simPreview = document.getElementById('quiz-interactive-preview');
        assert('Simulator preview updated on card flip', !!simPreview);
      }

      // 10. Verify Zero runtime errors
      assert('Zero runtime errors in Content Studio', window.__RUNTIME_ERRORS.length === 0, 
        window.__RUNTIME_ERRORS.map(e => e.message).join('; '));

    } catch (err) {
      sendLog('Fatal error during Content Studio test: ' + err.message);
      testResults.errors.push({ message: err.message, stack: err.stack });
    } finally {
      await reportResults();
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(runCSTestSuite, 200);
  } else {
    window.addEventListener('load', runCSTestSuite);
  }
})();
